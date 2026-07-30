import hdbscan
import numpy as np

from news.models import News


# ==========================================================
# SETTINGS
# ==========================================================

MIN_CLUSTER_SIZE = 3
MIN_SAMPLES = 1


# ==========================================================
# LOAD NEWS WITH EMBEDDINGS
# ==========================================================

def load_news():

    news_list = list(
        News.objects.filter(
            embedding__isnull=False,
            is_active=True
        ).select_related("source")
    )

    embeddings = np.array(
        [
            news.embedding
            for news in news_list
        ]
    )

    return news_list, embeddings



# ==========================================================
# HDBSCAN TEST
# ==========================================================

def test_hdbscan():

    print("Loading news...")

    news_list, embeddings = load_news()


    print(f"Total news with embeddings: {len(news_list)}")

    print(
        f"Embedding shape: {embeddings.shape}"
    )


    if len(news_list) == 0:
        print("No embeddings found")
        return



    # ======================================================
    # HDBSCAN MODEL
    # ======================================================

    clusterer = hdbscan.HDBSCAN(

        min_cluster_size=3,

        min_samples=1,

        metric="euclidean",

        cluster_selection_method="eom",

        algorithm="generic"
)


    labels = clusterer.fit_predict(
        embeddings
    )


    # ======================================================
    # RESULTS
    # ======================================================

    total_clusters = len(
        set(labels)
    ) - (1 if -1 in labels else 0)


    noise_count = list(labels).count(-1)



    print("========================")

    print(
        f"Total clusters: {total_clusters}"
    )

    print(
        f"Noise articles: {noise_count}"
    )

    print("========================")



    # ======================================================
    # CLUSTER SIZE
    # ======================================================

    cluster_sizes = {}


    for label in labels:

        if label not in cluster_sizes:

            cluster_sizes[label] = 0


        cluster_sizes[label] += 1



    print("\nCluster sizes:")


    for cluster_id, size in sorted(
        cluster_sizes.items(),
        key=lambda x: x[1],
        reverse=True
    )[:10]:

        print(
            f"Cluster {cluster_id} : {size} articles"
        )



    # ======================================================
    # SAMPLE TITLES CHECK
    # ======================================================

    print("\n========================")

    print("Sample Cluster Titles")

    print("========================")


    shown = 0


    for cluster_id in sorted(
        set(labels)
    ):

        if cluster_id == -1:
            continue


        print(
            f"\nCLUSTER {cluster_id}"
        )


        titles = [

            news_list[i].title

            for i, label in enumerate(labels)

            if label == cluster_id

        ]


        for title in titles[:5]:

            print(
                "-",
                title
            )


        shown += 1


        if shown == 5:
            break
