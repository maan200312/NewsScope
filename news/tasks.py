from celery import shared_task
from django.core.management import call_command
from django.utils import timezone
from datetime import timedelta

from news.models import News


# ==========================================================
# AUTO NEWS PIPELINE
# ==========================================================

@shared_task
def auto_scrape():

    try:

        print("========== SCRAPING STARTED ==========")

        call_command("scrape_news")

        print("========== SCRAPING FINISHED ==========")


        print("========== GENERATING EMBEDDINGS ==========")

        call_command("generate_embeddings")

        print("========== EMBEDDINGS FINISHED ==========")


        print("========== AI CLUSTERING STARTED ==========")

        call_command("cluster_news")

        print("========== AI CLUSTERING FINISHED ==========")


    except Exception as e:

        print("Celery Pipeline Error:", e)


# ==========================================================
# DELETE OLD NEWS
# ==========================================================

@shared_task
def delete_old_news():

    cutoff = timezone.now() - timedelta(days=7)

    deleted_count, _ = News.objects.filter(
        published_at__lt=cutoff
    ).delete()

    print(f"{deleted_count} old news deleted.")