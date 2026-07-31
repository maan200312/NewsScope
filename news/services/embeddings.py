import os
import time
import requests
from news.models import News

HF_TOKEN = os.getenv("HF_TOKEN")
MODEL_ID = "intfloat/e5-small-v2" # <-- FIXED MODEL
API_URL = f"https://router.huggingface.co/hf-inference/models/{MODEL_ID}"

HEADERS = {"Authorization": f"Bearer {HF_TOKEN}"} if HF_TOKEN else {}

def build_text(news):
    title = news.title or ""
    content = (news.content or "")[:600]
    # e5 models need prefix
    return f"query: {title} {content}".strip()

def generate_embeddings(batch_size=8):
    queryset = News.objects.filter(is_active=True, embedding__isnull=True).select_related("source")
    news_list = list(queryset)

    if not news_list:
        print("No new embeddings required.")
        return

    print(f"Generating embeddings for {len(news_list)} news...")

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
                data = resp.json()

                if isinstance(data, dict) and 'error' in data:
                    print(f"HF Error: {data}")
                    time.sleep(data.get('estimated_time', 5))
                    continue

                # data is list of embeddings
                to_update = []
                for news_obj, vec in zip(batch_news, data):
                    # handle nested
                    if isinstance(vec, list) and len(vec) > 0 and isinstance(vec[0], list):
                        vec = vec[0]
                    if isinstance(vec, list) and len(vec) == 384: # e5-small = 384 dim
                        news_obj.embedding = vec
                        to_update.append(news_obj)

                if to_update:
                    News.objects.bulk_update(to_update, ["embedding"])
                    updated_count += len(to_update)

                print(f"Batch {i//batch_size+1}/{(len(news_list)-1)//batch_size+1} OK - {len(to_update)} saved")
                break

            except Exception as e:
                print(f"Batch Error {i//batch_size+1} attempt {attempt+1}: {e}")
                time.sleep(3)
        else:
            print(f"Failed batch {i//batch_size+1}")

        time.sleep(1.5)

    print(f"Embeddings updated successfully. Total: {updated_count}/{len(news_list)}")