from django.core.management.base import BaseCommand

from news.services.ai_cluster import save_clusters


class Command(BaseCommand):

    help = "Run AI clustering"

    def handle(self, *args, **kwargs):

        save_clusters()

        self.stdout.write(
            self.style.SUCCESS(
                "AI clustering completed."
            )
        )