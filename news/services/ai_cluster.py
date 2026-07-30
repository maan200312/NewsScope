import numpy as np
import hdbscan

from collections import defaultdict
from django.utils.text import slugify

from news.models import News, NewsCluster

# ==========================================================
# SETTINGS
# ==========================================================

MIN_CLUSTER_SIZE = 3
MIN_SAMPLES = 1


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

    embeddings = np.array(
        [news.embedding for news in news_list],
        dtype=np.float32
    )

    return news_list, embeddings


# ==========================================================
# AI CLUSTERING
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
    print(f"Noise    : {noise}")

    return news_list, labels


# ==========================================================
# SAVE CLUSTERS
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

        left = 0
        center = 0
        right = 0

        source_ids = set()

        for article in articles:

            if article.source:

                source_ids.add(article.source.id)

                bias = getattr(article.source, "bias", "center")

                if bias == "left":
                    left += 1

                elif bias == "right":
                    right += 1

                else:
                    center += 1

        if left >= center and left >= right:
            cluster_bias = "left"

        elif right >= center and right >= left:
            cluster_bias = "right"

        else:
            cluster_bias = "center"

        scores = [
            article.bias_score
            for article in articles
            if article.bias_score is not None
        ]

        avg_bias = (
            int(sum(scores) / len(scores))
            if scores else 50
        )

        cluster = NewsCluster.objects.create(

            main_title=latest.title,

            slug=slug,

            image_url=latest.image_url,

            category=latest.category,
            country=latest.country,
            language=latest.language,
            is_top_story=(
                len(articles) >= 5
                or len(source_ids) >= 3
),

            hero_source=latest.source.name
            if latest.source else "",

            latest_published=latest.published_at,

            article_count=len(articles),

            source_count=len(source_ids),

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