import os
from news.models import News

# Local model se - no API, no error
try:
    from sentence_transformers import SentenceTransformer
    MODEL = SentenceTransformer('all-MiniLM-L6-v2')
    USE_LOCAL = True
    print("Local embedding model loaded")
except:
    USE_LOCAL = False
    print("Local model not found, install sentence-transformers")

def build_text(news):
    title = news.title or ""
    content = (news.content or "")[:600]
    return f"{title} {content}".strip()

def generate_embeddings(batch_size=32):
    queryset = News.objects.filter(is_active=True, embedding__isnull=True).select_related("source")
    news_list = list(queryset)

    if not news_list:
        print("No new embeddings required.")
        return

    print(f"Generating embeddings for {len(news_list)} news via LOCAL model...")

    if not USE_LOCAL:
        print("ERROR: sentence-transformers not installed. Run: pip install sentence-transformers")
        return

    updated = 0
    for i in range(0, len(news_list), batch_size):
        batch_news = news_list[i:i+batch_size]
        batch_texts = [build_text(n) for n in batch_news]
        
        vectors = MODEL.encode(batch_texts, show_progress_bar=False)
        
        to_update = []
        for obj, vec in zip(batch_news, vectors):
            obj.embedding = vec.tolist()
            to_update.append(obj)
        
        News.objects.bulk_update(to_update, ["embedding"])
        updated += len(to_update)
        print(f"Batch {i//batch_size+1}/{(len(news_list)-1)//batch_size+1} done - {len(to_update)} saved")

    print(f"Embeddings updated successfully. Total: {updated}/{len(news_list)}")