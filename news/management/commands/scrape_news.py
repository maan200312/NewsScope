from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime
import requests
import feedparser
import time
from bs4 import BeautifulSoup
from news.models import Source, News
from news.services.category import detect_category

# bias optional - agar na ho to fallback
try:
    from news.services.bias import detect_bias
except ImportError:
    detect_bias = None

class Command(BaseCommand):
    help = "Scrape News"

    CATEGORY_MAP = {
        "world": "world",
        "international": "world",
        "politics": "politics",
        "pakistan": "politics",
        "business": "business",
        "technology": "technology",
        "tech": "technology",
        "sports": "sports",
        "health": "health",
        "science": "science",
        "finance": "finance",
        "entertainment": "entertainment",
        "showbiz": "entertainment",
    }

    def get_image(self, item, summary):
        try:
            if item.get("media_thumbnail"):
                return item.media_thumbnail[0]["url"]
            if item.get("media_content"):
                return item.media_content[0]["url"]
            if item.get("enclosures"):
                return item.enclosures[0]["href"]
            soup = BeautifulSoup(summary, "html.parser")
            img = soup.find("img")
            if img:
                return img.get("src")
        except Exception:
            pass
        return "https://placehold.co/600x400?text=News"

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS("========== START SCRAPING =========="))

        total_saved = 0
        total_skipped = 0

        # is_active ka chakkar khatam - saare sources lo
        sources = Source.objects.all()
        self.stdout.write(f"Found {sources.count()} sources in DB")

        # agar 0 hain to bata do
        if sources.count() == 0:
            self.stdout.write(self.style.ERROR("No sources found! Run seed_sources first"))
            return

        for source in sources:
            self.stdout.write(f"\nScraping: {source.name} - {source.rss_url}")

            try:
                response = requests.get(
                    source.rss_url,
                    timeout=20,
                    headers={"User-Agent": "Mozilla/5.0"}
                )
                response.raise_for_status()
                feed = feedparser.parse(response.content)
                self.stdout.write(f" -> Feed entries: {len(feed.entries)}")
            except Exception as e:
                self.stdout.write(self.style.ERROR(f" -> Failed: {e}"))
                continue

            for item in feed.entries:
                try:
                    title = item.get("title", "").strip()
                    url = item.get("link", "").strip()
                    if not title or not url:
                        continue

                    if News.objects.filter(url=url).exists():
                        total_skipped += 1
                        continue

                    summary = item.get("summary", "")
                    clean_summary = BeautifulSoup(summary, "html.parser").get_text(" ", strip=True)
                    image = self.get_image(item, summary)

                    published = timezone.now()
                    if item.get("published_parsed"):
                        try:
                            published = timezone.make_aware(
                                datetime.fromtimestamp(time.mktime(item.published_parsed))
                            )
                        except Exception:
                            pass

                    feed_category = None
                    if hasattr(item, "tags"):
                        for tag in item.tags:
                            term = tag.get("term", "").lower()
                            if term in self.CATEGORY_MAP:
                                feed_category = self.CATEGORY_MAP[term]
                                break

                    category = feed_category if feed_category else detect_category(title, clean_summary)

                    News.objects.create(
                        title=title,
                        content=clean_summary[:5000],
                        url=url,
                        image_url=image,
                        published_at=published,
                        source=source,
                        category=category,
                        country=getattr(source, 'country', 'PK'),
                        language=getattr(source, 'language', 'en'),
                        bias=getattr(source, 'bias', 'center'),
                        bias_score=getattr(source, 'bias_score', 50),
                        is_active=True,
                    )
                    total_saved += 1

                except Exception as e:
                    print(f"Article Error for {source.name}: {e}")

        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("========== SCRAPING COMPLETE =========="))
        self.stdout.write(self.style.SUCCESS(f"Saved : {total_saved}"))
        self.stdout.write(self.style.WARNING(f"Skipped : {total_skipped}"))