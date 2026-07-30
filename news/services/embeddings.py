from sentence_transformers import SentenceTransformer
from news.models import News

# ==========================================================
# LOAD MODEL (Only Once)
# ==========================================================

model = SentenceTransformer(
    "all-MiniLM-L6-v2",
    device="cpu"
)


# ==========================================================
# BUILD TEXT
# ==========================================================

def build_text(news):

    title = news.title or ""

    content = (news.content or "")[:500]

    category = news.category or ""

    source = news.source.name if news.source else ""

    return f"""
Title:
{title}

Summary:
{content}

Category:
{category}

Source:
{source}
""".strip()


# ==========================================================
# SINGLE EMBEDDING
# ==========================================================

def get_embedding(title, content=""):

    if not title:
        return None

    try:

        text = f"""
Title:
{title}

Summary:
{(content or "")[:500]}
"""

        vector = model.encode(
            text,
            normalize_embeddings=True,
            show_progress_bar=False
        )

        return vector.tolist()

    except Exception as e:

        print("Embedding Error:", e)

        return None


# ==========================================================
# GENERATE EMBEDDINGS FOR ALL NEWS
# ==========================================================

def generate_embeddings(batch_size=64):

    queryset = News.objects.filter(
        is_active=True,
        embedding__isnull=True
    ).select_related("source")

    news_list = list(queryset)

    if not news_list:

        print("No new embeddings required.")

        return

    print(f"Generating embeddings for {len(news_list)} news...")

    texts = [
        build_text(news)
        for news in news_list
    ]

    vectors = model.encode(

        texts,

        batch_size=batch_size,

        show_progress_bar=True,

        normalize_embeddings=True

    )

    for news, vector in zip(news_list, vectors):

        news.embedding = vector.tolist()

    News.objects.bulk_update(

        news_list,

        ["embedding"],

        batch_size=200

    )

    print("===================================")
    print("Embeddings updated successfully.")
    print("===================================")