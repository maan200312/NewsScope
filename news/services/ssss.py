import numpy as np
from rapidfuzz import fuzz
from datetime import timedelta
from django.utils import timezone
from django.utils.text import slugify
from news.models import NewsCluster

SIMILARITY_THRESHOLD = 0.60
EMBEDDING_WEIGHT = 0.72
TITLE_WEIGHT = 0.15
TIME_WINDOW_DAYS = 7

def cosine_similarity(a, b):
    a = np.array(a)
    b = np.array(b)
    if np.linalg.norm(a) == 0 or np.linalg.norm(b) == 0:
        return 0
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

def update_cluster(cluster):
    articles = cluster.articles.select_related("source")
    if not articles.exists():
        return

    cluster.article_count = articles.count()
    cluster.source_count = articles.values("source").distinct().count()

    latest = articles.order_by("-published_at").first()

    if latest:
        cluster.main_title = latest.title
        cluster.image_url = latest.image_url
        cluster.category = latest.category
        cluster.latest_published = latest.published_at

        if latest.source:
            cluster.hero_source = latest.source.name

    left = center = right = 0
    counted = set()
    for article in articles:
        if not article.source or article.source.id in counted:
            continue
        counted.add(article.source.id)
        if article.source.bias == "left":
            left += 1
        elif article.source.bias == "right":
            right += 1
        else:
            center += 1

    cluster.left_sources = left
    cluster.center_sources = center
    cluster.right_sources = right

    if left >= center and left >= right:
        cluster.bias = "left"
    elif right >= center and right >= left:
        cluster.bias = "right"
    else:
        cluster.bias = "center"

    scores = [x.bias_score for x in articles if x.bias_score is not None]
    if scores:
        cluster.bias_score = int(sum(scores) / len(scores))

    cluster.save()

def assign_cluster(news):
    if news.cluster:
        return news.cluster
    if not news.embedding:
        return None

    recent_clusters = NewsCluster.objects.filter(
        latest_published__gte=timezone.now() - timedelta(days=TIME_WINDOW_DAYS)
    ).exclude(
        embedding__isnull=True
    )

    best_cluster = None
    best_score = 0
    for cluster in recent_clusters:
        try:
            embedding_score = cosine_similarity(news.embedding, cluster.embedding)
            title_score = fuzz.token_set_ratio(news.title.lower(), cluster.main_title.lower()) / 100
            final_score = (embedding_score * EMBEDDING_WEIGHT + title_score * TITLE_WEIGHT)
            if final_score > best_score:
                best_score = final_score
                best_cluster = cluster
        except Exception:
            continue

    if best_cluster and best_score >= SIMILARITY_THRESHOLD:
        news.cluster = best_cluster
        news.save(update_fields=["cluster"])
        update_cluster(best_cluster)
        return best_cluster

    slug = slugify(news.title[:60])
    base_slug = slug
    counter = 1
    while NewsCluster.objects.filter(slug=slug).exists():
        slug = f"{base_slug}-{counter}"
        counter += 1

    cluster = NewsCluster.objects.create(
        main_title=news.title,
        slug=slug,
        image_url=news.image_url,
        category=news.category,
        embedding=news.embedding,
        bias=news.bias,
        bias_score=news.bias_score,
        article_count=1,
        source_count=1,
        left_sources=1 if news.source and news.source.bias == "left" else 0,
        center_sources=1 if news.source and news.source.bias == "center" else 0,
        right_sources=1 if news.source and news.source.bias == "right" else 0,
        latest_published=news.published_at,
        hero_source=news.source.name if news.source else "",
    )

    news.cluster = cluster
    news.save(update_fields=["cluster"])
    update_cluster(cluster)
    return cluster


