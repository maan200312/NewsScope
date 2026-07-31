import os, requests
from gradio_client import Client
from news.models import News

HF_URL = "https://mumtahina2003-embedding-server.hf.space"

def build_text(news):
    return f"{news.title or ''} {(news.content or '')[:500]}"

def generate_embeddings():
    client = Client(HF_URL)
    news_list = list(News.objects.filter(is_active=True, embedding__isnull=True))
    if not news_list:
        print("No embeddings needed")
        return
    for n in news_list:
        text = build_text(n)
        # HF Space se embedding lo - ye batch wala endpoint hai
        result = client.predict(text, api_name="/embed")
        # result = [[0.12, 0.33,...]] aayega
        embedding = result[0] if isinstance(result[0], list) else result
        n.embedding = embedding
        n.save()
        print(f"Done: {n.id}")
    print(f"All {len(news_list)} embeddings done!")