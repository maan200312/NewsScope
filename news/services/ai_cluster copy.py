import numpy as np
import hdbscan

from collections import defaultdict
from django.utils.text import slugify

from news.models import News, NewsCluster


# ==========================================================
# SETTINGS
# ==========================================================

MIN_CLUSTER_SIZE = 6
MIN_SAMPLES = 2


# ==========================================================
# LOAD NEWS
# ==========================================================

def load_news():

    news_list = list(
        News.objects.filter(
            is_active=True,
            embedding__isnull=False
        ).select_related("source")
    )

    embeddings = np.array(
        [news.embedding for news in news_list],
        dtype=np.float32
    )

    return news_list, embeddings


# ==========================================================
# RUN HDBSCAN
# ==========================================================

def build_clusters():

    news_list, embeddings = load_news()

    if len(news_list) == 0:

        print("No news found.")

        return [], []

    print("Running AI clustering...")

    clusterer = hdbscan.HDBSCAN(

        min_cluster_size=MIN_CLUSTER_SIZE,

        min_samples=MIN_SAMPLES,

        metric="euclidean",

        cluster_selection_method="eom",

        prediction_data=True

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

    if not news_list:
        return

    print("Deleting old clusters...")

    NewsCluster.objects.all().delete()

    groups = defaultdict(list)

    for news, label in zip(news_list, labels):

        # Noise ko bhi cluster banao
        if label == -1:

            groups[f"noise_{news.id}"].append(news)

        else:

            groups[label].append(news)

    print(f"Saving {len(groups)} clusters...")

    for _, articles in groups.items():

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

        # -------------------------
        # Bias Counts
        # -------------------------

        left = sum(

            1 for article in articles

            if article.bias == "left"

        )

        center = sum(

            1 for article in articles

            if article.bias == "center"

        )

        right = sum(

            1 for article in articles

            if article.bias == "right"

        )

        if left >= center and left >= right:

            cluster_bias = "left"

        elif right >= center and right >= left:

            cluster_bias = "right"

        else:

            cluster_bias = "center"

        # -------------------------
        # Average Bias Score
        # -------------------------

        scores = [

            article.bias_score

            for article in articles

            if article.bias_score is not None

        ]

        avg_bias = (

            int(sum(scores) / len(scores))

            if scores else

            50

        )

        # -------------------------
        # Source Count
        # -------------------------

        source_ids = {

            article.source.id

            for article in articles

            if article.source

        }

        # -------------------------
        # Create Cluster
        # -------------------------

        cluster = NewsCluster.objects.create(

            main_title=latest.title,

            slug=slug,

            image_url=latest.image_url,

            category=latest.category,

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

        # -------------------------
        # Assign Cluster
        # -------------------------

        for article in articles:

            article.cluster = cluster

        News.objects.bulk_update(

            articles,

            ["cluster"],

            batch_size=200

        )

    print()
    print("======================================")
    print(f"Created {NewsCluster.objects.count()} clusters")
    print("======================================")