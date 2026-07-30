import os
import requests
from news.models import News

# ==========================================================
# HUGGINGFACE API SETUP
# ==========================================================
HF_TOKEN = os.getenv("HF_TOKEN")
MODEL_ID = "sentence-transformers/all-MiniLM-L6-v2"
API_URL = f"https://api-inference.huggingface.co/pipeline/feature-extraction/{MODEL_ID}"

HEADERS = {"Authorization": f"Bearer {HF_TOKEN}"} if HF_TOKEN else {}

# ==========================================================
# BUILD TEXT
# ==========================================================
def build_text(news):
    title = news.title or ""
    content = (news.content or "")[:500]
    category = news.category or ""
    source = news.source.name if news.source else ""
    return f"Title: {title} Summary: {content} Category: {category} Source: {source}".strip()

# ==========================================================
# SINGLE EMBEDDING (HF API)
# ==========================================================
def get_embedding(title, content=""):
    if not title:
        return None
    try:
        text = f"Title: {title} Summary: {(content or '')[:500]}"
        response = requests.post(API_URL, headers=HEADERS, json={"inputs": text, "options": {"wait_for_model": True}}, timeout=30)
        data = response.json()
        # HF returns list of floats, sometimes nested
        if isinstance(data[0], list):
            return data[0]
        return data
    except Exception as e:
        print("Embedding Error:", e)
        return None

# ==========================================================
# BATCH EMBEDDINGS (HF API)
# ==========================================================
def generate_embeddings(batch_size=16):
    queryset = News.objects.filter(is_active=True, embedding__isnull=True).select_related("source")
    news_list = list(queryset)

    if not news_list:
        print("No new embeddings required.")
        return

    print(f"Generating embeddings for {len(news_list)} news via HF API...")

    texts = [build_text(news) for news in news_list]

    vectors = []
    # Batch me bhejna parega, warna HF rate limit dega
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i+batch_size]
        try:
            resp = requests.post(API_URL, headers=HEADERS, json={"inputs": batch, "options": {"wait_for_model": True}}, timeout=60)
            batch_vectors = resp.json()
            # Agar error aaya to list nahi hogi
            if isinstance(batch_vectors, dict) and 'error' in batch_vectors:
                print("HF API Error:", batch_vectors)
                continue
            vectors.extend(batch_vectors)
            print(f"Batch {i//batch_size + 1} done")
        except Exception as e:
            print("Batch Error:", e)

    # Save only jitne vectors mile
    for news, vector in zip(news_list, vectors):
        # Nested list handle
        if isinstance(vector, list) and len(vector) > 0 and isinstance(vector[0], list):
            news.embedding = vector[0]
        else:
            news.embedding = vector

    News.objects.bulk_update(news_list[:len(vectors)], ["embedding"], batch_size=200)
    print("Embeddings updated successfully.")