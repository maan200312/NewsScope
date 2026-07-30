# news/management/commands/build_embeddings.py
from django.core.management.base import BaseCommand
from news.services.embeddings import generate_embeddings

class Command(BaseCommand):
    help = "Generate embeddings for news without embeddings"

    def handle(self, *args, **options):
        self.stdout.write("Starting embedding generation...")
        generate_embeddings()
        self.stdout.write(self.style.SUCCESS("✅ Embeddings done"))