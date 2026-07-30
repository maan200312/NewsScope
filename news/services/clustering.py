import numpy as np
import hdbscan
from collections import defaultdict
from django.utils.text import slugify
from sklearn.metrics.pairwise import cosine_similarity

from news.models import News, NewsCluster
from news.services.bias import calculate_cluster_bias

# ==========================================================
# SETTINGS
# ==========================================================

MIN_CLUSTER_SIZE = 3
MIN_SAMPLES = 1
SIMILARITY_THRESHOLD = 0.75

# ==========================================================
# LOAD NEWS
# ==========================================================

def load_news():
    news_list = list(
        News.objects.filter(
            embedding__isnull=False,
            is_active=True
        ).select_related("source")
    )

    if len(news_list) == 0:
        return [], np.array([])

    embeddings = np.array(
        [news.embedding for news in news_list],
        dtype=np.float32
    )

    return news_list, embeddings

# ==========================================================
# AI CLUSTERING - HDBSCAN
# ==========================================================

def build_clusters():
    news_list, embeddings = load_news()

    if len(news_list) == 0:
        print("No news found.")
        return [], []

    print("Running HDBSCAN...")

    clusterer = hdbscan.HDBSCAN(
        min_cluster_size=MIN_CLUSTER_SIZE,
        min_samples=MIN_SAMPLES,
        metric="euclidean",
        cluster_selection_method="eom"
    )

    labels = clusterer.fit_predict(embeddings)

    total_clusters = len(set(labels)) - (1 if -1 in labels else 0)
    noise = list(labels).count(-1)

    print(f"Clusters : {total_clusters}")
    print(f"Noise : {noise}")

    return news_list, labels

# ==========================================================
# SAVE CLUSTERS - 100% FIXED BIAS COUNTING
# ==========================================================

def save_clusters():
    news_list, labels = build_clusters()

    if len(news_list) == 0:
        return

    print("Deleting old clusters...")
    News.objects.update(cluster=None)
    NewsCluster.objects.all().delete()

    groups = defaultdict(list)

    for news, label in zip(news_list, labels):
        if label == -1:
            continue
        groups[label].append(news)

    print(f"Saving {len(groups)} clusters...")

    for label, articles in groups.items():
        latest = max(
            articles,
            key=lambda x: x.published_at or x.created_at
        )

        slug = slugify(latest.title[:60])
        base_slug = slug
        counter = 1
        while NewsCluster.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1

        # ===== FIXED BIAS COUNTING - SOURCE WISE =====
        left = 0
        center = 0
        right = 0
        unique_sources = {} # source_id -> bias

        for article in articles:
            if not article.source:
                continue
            sid = article.source.id
            if sid in unique_sources:
                continue
            bias = (getattr(article.source, "bias", "center") or "center").lower()
            unique_sources[sid] = bias

        for bias in unique_sources.values():
            if bias == "left":
                left += 1
            elif bias == "right":
                right += 1
            else:
                center += 1

        source_count = len(unique_sources)
        cluster_bias, avg_bias = calculate_cluster_bias(left, center, right)

        # Fallback for bias_score if needed
        if avg_bias == 50 and source_count == 0:
            scores = [a.bias_score for a in articles if a.bias_score is not None]
            if scores:
                avg_bias = int(sum(scores) / len(scores))

        cluster = NewsCluster.objects.create(
            main_title=latest.title,
            slug=slug,
            image_url=latest.image_url,
            category=latest.category,
            country=latest.country,
            language=latest.language,
            is_top_story=(len(articles) >= 5 or source_count >= 3),
            hero_source=latest.source.name if latest.source else "",
            latest_published=latest.published_at,
            article_count=len(articles),
            source_count=source_count,
            left_sources=left,
            center_sources=center,
            right_sources=right,
            bias=cluster_bias,
            bias_score=avg_bias,
            embedding=latest.embedding,
        )

        for article in articles:
            article.cluster = cluster

        News.objects.bulk_update(
            articles,
            ["cluster"],
            batch_size=200
        )

    print()
    print("===================================")
    print(f"Created {NewsCluster.objects.count()} clusters")
    print("===================================")

# ==========================================================
# ASSIGN SINGLE NEWS - FOR scrape_news.py
# ==========================================================

def assign_cluster(news):
    if news.embedding is None:
        return None

    clusters = list(
        NewsCluster.objects.filter(is_active=True).exclude(embedding__isnull=True)
    )

    if not clusters:
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
            country=news.country,
            language=news.language,
            hero_source=news.source.name if news.source else "",
            latest_published=news.published_at,
            article_count=1,
            source_count=1,
            left_sources=1 if news.bias == "left" else 0,
            center_sources=1 if news.bias == "center" else 0,
            right_sources=1 if news.bias == "right" else 0,
            bias=news.bias,
            bias_score=news.bias_score,
            embedding=news.embedding,
        )
        news.cluster = cluster
        news.save(update_fields=["cluster"])
        return cluster

    cluster_embeddings = np.array([c.embedding for c in clusters])
    news_emb = np.array(news.embedding).reshape(1, -1)

    sims = cosine_similarity(news_emb, cluster_embeddings)[0]
    best_idx = int(np.argmax(sims))

    if sims[best_idx] >= SIMILARITY_THRESHOLD:
        best_cluster = clusters[best_idx]
        news.cluster = best_cluster
        news.save(update_fields=["cluster"])
        best_cluster.article_count = (best_cluster.article_count or 0) + 1
        best_cluster.save(update_fields=["article_count"])
        return best_cluster
    else:
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
            country=news.country,
            language=news.language,
            hero_source=news.source.name if news.source else "",
            latest_published=news.published_at,
            article_count=1,
            source_count=1,
            left_sources=1 if news.bias == "left" else 0,
            center_sources=1 if news.bias == "center" else 0,
            right_sources=1 if news.bias == "right" else 0,
            bias=news.bias,
            bias_score=news.bias_score,
            embedding=news.embedding,
        )
        news.cluster = cluster
        news.save(update_fields=["cluster"])
        return cluster