import xml.etree.ElementTree as ET

import requests
from django.core.management.base import BaseCommand
from news.models import Source


class Command(BaseCommand):
    help = "Check every Source's RSS feed — reports which ones are working and which are broken"

    HEADERS = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
        )
    }
    TIMEOUT = 10

    def add_arguments(self, parser):
        parser.add_argument(
            "--deactivate",
            action="store_true",
            help="Automatically set is_active=False on sources whose feed fails",
        )

    def handle(self, *args, **options):
        sources = Source.objects.all().order_by("name")
        total = sources.count()

        if total == 0:
            self.stdout.write(self.style.WARNING("No sources found. Run seed_sources first."))
            return

        self.stdout.write(f"Checking {total} sources...\n")

        working = []
        broken = []

        for source in sources:
            ok, detail = self.check_feed(source.rss_url)

            if ok:
                working.append(source)
                self.stdout.write(self.style.SUCCESS(f"✅ {source.name:<30} {detail}"))
            else:
                broken.append(source)
                self.stdout.write(self.style.ERROR(f"❌ {source.name:<30} {detail}"))

                if options["deactivate"] and source.is_active:
                    source.is_active = False
                    source.save(update_fields=["is_active"])

        self.stdout.write("\n" + "=" * 50)
        self.stdout.write(self.style.SUCCESS(f"Working: {len(working)}/{total}"))
        self.stdout.write(self.style.ERROR(f"Broken:  {len(broken)}/{total}"))

        if broken:
            self.stdout.write("\nBroken sources:")
            for s in broken:
                self.stdout.write(f"  - {s.name} ({s.rss_url})")

        if options["deactivate"] and broken:
            self.stdout.write(
                self.style.WARNING(f"\n{len(broken)} broken sources were deactivated (is_active=False).")
            )

    def check_feed(self, url):
        """Fetch the RSS url and confirm it's reachable and parses as valid XML with items."""
        try:
            resp = requests.get(url, headers=self.HEADERS, timeout=self.TIMEOUT)
        except requests.exceptions.RequestException as e:
            return False, f"Connection failed ({type(e).__name__})"

        if resp.status_code != 200:
            return False, f"HTTP {resp.status_code}"

        try:
            root = ET.fromstring(resp.content)
        except ET.ParseError:
            return False, "Invalid XML"

        item_count = len(root.findall(".//item")) or len(
            root.findall(".//{http://www.w3.org/2005/Atom}entry")
        )

        if item_count == 0:
            return False, "No items found in feed"

        return True, f"OK ({item_count} items)"