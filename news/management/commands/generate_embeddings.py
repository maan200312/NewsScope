from django.core.management.base import BaseCommand

from news.services.embeddings import generate_embeddings


class Command(BaseCommand):

    help = "Generate MiniLM embeddings"

    def handle(self, *args, **kwargs):

        generate_embeddings()

        self.stdout.write(
            self.style.SUCCESS(
                "Embeddings generated successfully."
            )
        )