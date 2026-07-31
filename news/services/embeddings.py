import os
import time
import requests
from news.models import News

# ==========================================================
# HUGGINGFACE API SETUP
# ==========================================================
HF_TOKEN = os.getenv("HF_TOKEN")
MODEL_ID = "sentence-transformers/all-MiniLM-L6-v2"
API_URL = f"https://router.huggingface.co/hf-inference/models/{MODEL_ID}"

HEADERS = {"Authorization": f"Bearer {HF_TOKEN}"} if HF_TOKEN else {}

# ==========================================================
# BUILD TEXT
# ==========================================================
def build_text(news):
    title = news.title or ""
    content = (news.content or "")[:600]
    category = news.category or ""
    source = news.source.name if news.source else ""
    return f"Title: {title} Summary: {content} Category: {category} Source: {source}".strip()

# ==========================================================
# SINGLE EMBEDDING (with retry)
# ==========================================================
def get_embedding(title, content=""):
    if not title:
        return None
    text = f"Title: {title} Summary: {(content or '')[:600]}"
    for attempt in range(3):
        try:
            resp = requests.post(
                API_URL,
                headers=HEADERS,
                json={"inputs": text, "options": {"wait_for_model": True}},
                timeout=60
            )
            data = resp.json()
            if isinstance(data, dict) and "error" in data:
                print(f"HF loading, retry {attempt+1}: {data.get('error')}")
                time.sleep(5)
                continue
            if isinstance(data[0], list):
                return data[0]
            return data
        except Exception as e:
            print(f"Embedding Error attempt {attempt+1}: {e}")
            time.sleep(3)
    return None

# ==========================================================
# BATCH EMBEDDINGS - FIXED VERSION
# ==========================================================
def generate_embeddings(batch_size=8):
    queryset = News.objects.filter(is_active=True, embedding__isnull=True).select_related("source")
    news_list = list(queryset)

    if not news_list:
        print("No new embeddings required.")
        return

    print(f"Generating embeddings for {len(news_list)} news via HF API...")

    updated_count = 0

    for i in range(0, len(news_list), batch_size):
        batch_news = news_list[i:i+batch_size]
        batch_texts = [build_text(n) for n in batch_news]

        for attempt in range(3):
            try:
                resp = requests.post(
                    API_URL,
                    headers=HEADERS,
                    json={"inputs": batch_texts, "options": {"wait_for_model": True}},
                    timeout=90
                )
                batch_vectors = resp.json()

                if isinstance(batch_vectors, dict) and 'error' in batch_vectors:
                    print(f"HF API Error batch {i//batch_size+1}: {batch_vectors}")
                    if "loading" in batch_vectors.get('error','').lower():
                        time.sleep(batch_vectors.get('estimated_time', 10))
                        continue
                    else:
                        time.sleep(5)
                        continue

                # Save this batch only
                to_update = []
                for news_obj, vec in zip(batch_news, batch_vectors):
                    if isinstance(vec, list) and len(vec) > 0:
                        if isinstance(vec[0], list): # nested case
                            news_obj.embedding = vec[0]
                        else:
                            news_obj.embedding = vec
                        to_update.append(news_obj)

                if to_update:
                    News.objects.bulk_update(to_update, ["embedding"])
                    updated_count += len(to_update)

                print(f"Batch {i//batch_size + 1}/{(len(news_list)-1)//batch_size+1} done - {len(to_update)} saved")
                break # success, next batch

            except Exception as e:
                print(f"Batch Error {i//batch_size+1} attempt {attempt+1}: {e}")
                time.sleep(3)
        else:
            print(f"Failed batch {i//batch_size+1} after 3 retries, skipping")

        time.sleep(1) # rate limit se bachne ke liye

    print(f"Embeddings updated successfully. Total: {updated_count}/{len(news_list)}")