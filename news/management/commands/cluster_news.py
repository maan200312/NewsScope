from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = "Run AI clustering - safe for Render"

    def handle(self, *args, **kwargs):
        self.stdout.write("========== START CLUSTERING ==========")
        try:
            # dono path try karo - jo mile
            try:
                from news.services.clustering import save_clusters
            except ImportError:
                from news.services.ai_cluster import save_clusters
            
            save_clusters()
            self.stdout.write(self.style.SUCCESS("✅ Clustering done"))
        except ModuleNotFoundError as e:
            self.stdout.write(self.style.WARNING(f"⚠️ {e} not installed on Render - skipping. News still works unclustered."))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Clustering failed: {e}"))