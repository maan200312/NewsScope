import socket
from urllib.error import URLError, HTTPError

import feedparser
from django.core.management.base import BaseCommand
from news.models import Source

# Hard cap so a single slow/dead host can never hang the whole command.
FEED_TIMEOUT_SECONDS = 8

class Command(BaseCommand):
    help = (
        "Seed international news sources, verify each RSS feed live "
        "(with a timeout so a dead feed never blocks the run), and remove "
        "any source whose feed fails verification."
    )

    # bias: political leaning label (left / left-center / center / right-center / right)
    # bias_score: numeric 1-100 scale, AllSides/Ad Fontes-style —
    #             1 = far-left, 50 = center, 100 = far-right.
    #             Sourced from AllSides Media Bias Ratings / Ad Fontes Media /
    #             Media Bias Fact Check where a rating exists; otherwise a
    #             reasoned estimate based on the outlet's known editorial stance
    #             — flag these for manual confirmation if precision matters.
    # rating: factual/reliability rating, based on established media-bias
    #         evaluators (Media Bias/Fact Check, AllSides, Ad Fontes Media):
    #         "very-high" / "high" / "mostly-factual" / "mixed" / "low"
    SOURCES = [
        # --- Pakistan ---
        {"name": "Dawn", "website": "https://www.dawn.com", "rss_url": "https://www.dawn.com/feeds/home", "logo": "https://www.dawn.com/favicon.ico", "country": "pk", "language": "en", "bias": "center", "bias_score": 50},
        {"name": "Geo News", "website": "https://www.geo.tv", "rss_url": "https://www.geo.tv/rss/1/1", "logo": "https://www.geo.tv/favicon.ico", "country": "pk", "language": "en", "bias": "center", "bias_score": 52,},
        {"name": "ARY News", "website": "https://arynews.tv", "rss_url": "https://arynews.tv/feed/", "logo": "https://arynews.tv/wp-content/uploads/2019/09/favicon.png", "country": "pk", "language": "en", "bias": "center", "bias_score": 65},
        {"name": "The News", "website": "https://www.thenews.com.pk", "rss_url": "https://www.thenews.com.pk/rss/1/1", "logo": "https://www.thenews.com.pk/favicon.ico", "country": "pk", "language": "en", "bias": "center", "bias_score": 48},
        {"name": "Pakistan Observer", "website": "https://pakobserver.net", "rss_url": "https://pakobserver.net/feed/", "logo": "https://pakobserver.net/favicon.ico", "country": "pk", "language": "en", "bias": "right", "bias_score": 80},
        {"name": "Daily Times", "website": "https://dailytimes.com.pk", "rss_url": "https://dailytimes.com.pk/feed/", "logo": "https://dailytimes.com.pk/favicon.ico", "country": "pk", "language": "en", "bias": "center", "bias_score": 50},
        # NOTE: minutemirror.com.pk blocks automated fetch tools (robots.txt) so
        # liveness couldn't be independently re-checked here — the command's own
        # verify_feed() will still catch it and drop it if it's actually dead.
        {"name": "Minute Mirror", "website": "https://minutemirror.com.pk", "rss_url": "https://minutemirror.com.pk/feed/", "logo": "https://minutemirror.com.pk/favicon.ico", "country": "pk", "language": "en", "bias": "center", "bias_score": 50},

        # --- UK ---
        {"name": "BBC News", "website": "https://www.bbc.com/news", "rss_url": "http://feeds.bbci.co.uk/news/rss.xml", "logo": "https://www.bbc.com/favicon.ico", "country": "gb", "language": "en", "bias": "center", "bias_score": 48},
        {"name": "BBC World", "website": "https://www.bbc.com/news/world", "rss_url": "http://feeds.bbci.co.uk/news/world/rss.xml", "logo": "https://www.bbc.com/favicon.ico", "country": "gb", "language": "en", "bias": "center", "bias_score": 48},
        {"name": "The Guardian", "website": "https://www.theguardian.com", "rss_url": "https://www.theguardian.com/world/rss", "logo": "https://www.theguardian.com/favicon.ico", "country": "gb", "language": "en", "bias": "left-center", "bias_score": 25},
        {"name": "The Independent", "website": "https://www.independent.co.uk", "rss_url": "https://www.independent.co.uk/news/world/rss", "logo": "https://www.independent.co.uk/favicon.ico", "country": "gb", "language": "en", "bias": "left", "bias_score": 30},
        {"name": "Sky News", "website": "https://news.sky.com", "rss_url": "https://feeds.skynews.com/feeds/rss/home.xml", "logo": "https://news.sky.com/favicon.ico", "country": "gb", "language": "en", "bias": "center", "bias_score": 52},
        {"name": "The Telegraph", "website": "https://www.telegraph.co.uk", "rss_url": "https://www.telegraph.co.uk/rss.xml", "logo": "https://www.telegraph.co.uk/favicon.ico", "country": "gb", "language": "en", "bias": "right", "bias_score": 72},
        {"name": "Financial Times", "website": "https://www.ft.com", "rss_url": "https://www.ft.com/rss/home", "logo": "https://www.ft.com/favicon.ico", "country": "gb", "language": "en", "bias": "center", "bias_score": 45},
        {"name": "The Economist", "website": "https://www.economist.com", "rss_url": "https://www.economist.com/international/rss.xml", "logo": "https://www.economist.com/favicon.ico", "country": "gb", "language": "en", "bias": "center", "bias_score": 50},

        # --- USA ---
        {"name": "NBC News World", "website": "https://www.nbcnews.com/world", "rss_url": "https://feeds.nbcnews.com/nbcnews/public/world", "logo": "https://www.nbcnews.com/favicon.ico", "country": "us", "language": "en", "bias": "left", "bias_score": 32},
        {"name": "NBC News Top Stories", "website": "https://www.nbcnews.com", "rss_url": "https://feeds.nbcnews.com/nbcnews/public/news", "logo": "https://www.nbcnews.com/favicon.ico", "country": "us", "language": "en", "bias": "left", "bias_score": 32},
        {"name": "New York Times World", "website": "https://www.nytimes.com", "rss_url": "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", "logo": "https://www.nytimes.com/favicon.ico", "country": "us", "language": "en", "bias": "left", "bias_score": 25},
        {"name": "New York Times Home", "website": "https://www.nytimes.com", "rss_url": "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml", "logo": "https://www.nytimes.com/favicon.ico", "country": "us", "language": "en", "bias": "left", "bias_score": 25},
        #{"name": "Washington Post World", "website": "https://www.washingtonpost.com", "rss_url": "https://feeds.washingtonpost.com/rss/world", "logo": "https://www.washingtonpost.com/favicon.ico", "country": "us", "language": "en", "bias": "left", "bias_score": 22},
        {"name": "NPR News", "website": "https://www.npr.org", "rss_url": "https://feeds.npr.org/1001/rss.xml", "logo": "https://www.npr.org/favicon.ico", "country": "us", "language": "en", "bias": "left", "bias_score": 30},
        {"name": "NPR World", "website": "https://www.npr.org", "rss_url": "https://feeds.npr.org/1004/rss.xml", "logo": "https://www.npr.org/favicon.ico", "country": "us", "language": "en", "bias": "left", "bias_score": 30},
        # Fixed: old "/world/rss2.0.xml" path is stale, LA Times moved this section to "/world-nation/"
        {"name": "LA Times World", "website": "https://www.latimes.com", "rss_url": "https://www.latimes.com/world-nation/rss2.0.xml", "logo": "https://www.latimes.com/favicon.ico", "country": "us", "language": "en", "bias": "left", "bias_score": 22},
        {"name": "CNBC", "website": "https://www.cnbc.com", "rss_url": "https://www.cnbc.com/id/100003114/device/rss/rss.html", "logo": "https://www.cnbc.com/favicon.ico", "country": "us", "language": "en", "bias": "center", "bias_score": 38},
        {"name": "Fox News", "website": "https://www.foxnews.com", "rss_url": "https://moxie.foxnews.com/google-publisher/latest.xml", "logo": "https://www.foxnews.com/favicon.ico", "country": "us", "language": "en", "bias": "right", "bias_score": 85},
        {"name": "Fox News World", "website": "https://www.foxnews.com/world", "rss_url": "https://moxie.foxnews.com/google-publisher/world.xml", "logo": "https://www.foxnews.com/favicon.ico", "country": "us", "language": "en", "bias": "right", "bias_score": 85},
        # Replaced: Business Insider confirmed (via their own help-center FAQ) to
        # no longer offer any RSS feed at all — swapped for USA Today, a live,
        # similarly center/left-center-rated general news feed.
        {"name": "USA Today", "website": "https://www.usatoday.com", "rss_url": "https://rssfeeds.usatoday.com/usatoday-newstopstories", "logo": "https://www.usatoday.com/favicon.ico", "country": "us", "language": "en", "bias": "center", "bias_score": 48},
        {"name": "Politico", "website": "https://www.politico.com", "rss_url": "https://www.politico.com/rss/politicopicks.xml", "logo": "https://www.politico.com/favicon.ico", "country": "us", "language": "en", "bias": "left", "bias_score": 33},

        # --- Middle East ---
        {"name": "Al Jazeera", "website": "https://www.aljazeera.com", "rss_url": "https://www.aljazeera.com/xml/rss/all.xml", "logo": "https://www.aljazeera.com/favicon.ico", "country": "qa", "language": "en", "bias": "center", "bias_score": 45},
        {"name": "Middle East Eye", "website": "https://www.middleeasteye.net", "rss_url": "https://www.middleeasteye.net/rss", "logo": "https://www.middleeasteye.net/favicon.ico", "country": "gb", "language": "en", "bias": "left", "bias_score": 15},
        # --- Europe ---
        {"name": "Deutsche Welle", "website": "https://www.dw.com", "rss_url": "https://rss.dw.com/xml/rss-en-all", "logo": "https://www.dw.com/favicon.ico", "country": "de", "language": "en", "bias": "center", "bias_score": 50},
        {"name": "France24", "website": "https://www.france24.com", "rss_url": "https://www.france24.com/en/rss", "logo": "https://www.france24.com/favicon.ico", "country": "fr", "language": "en", "bias": "center", "bias_score": 50},
        {"name": "Euronews", "website": "https://www.euronews.com", "rss_url": "https://www.euronews.com/rss", "logo": "https://www.euronews.com/favicon.ico", "country": "fr", "language": "en", "bias": "center", "bias_score": 50},
        {"name": "Le Monde", "website": "https://www.lemonde.fr", "rss_url": "https://www.lemonde.fr/en/rss/une.xml", "logo": "https://www.lemonde.fr/favicon.ico", "country": "fr", "language": "en", "bias": "left", "bias_score": 30},
        {"name": "The Moscow Times", "website": "https://www.themoscowtimes.com", "rss_url": "https://www.themoscowtimes.com/rss/news", "logo": "https://www.themoscowtimes.com/favicon.ico", "country": "ru", "language": "en", "bias": "center", "bias_score": 50},

        # --- Asia Pacific ---
        {"name": "South China Morning Post", "website": "https://www.scmp.com", "rss_url": "https://www.scmp.com/rss/91/feed", "logo": "https://www.scmp.com/favicon.ico", "country": "hk", "language": "en", "bias": "center", "bias_score": 50},
        {"name": "Japan Times", "website": "https://www.japantimes.co.jp", "rss_url": "https://www.japantimes.co.jp/feed/", "logo": "https://www.japantimes.co.jp/favicon.ico", "country": "jp", "language": "en", "bias": "center", "bias_score": 50},
        {"name": "ABC News Australia", "website": "https://www.abc.net.au/news", "rss_url": "https://www.abc.net.au/news/feed/51120/rss.xml", "logo": "https://www.abc.net.au/favicon.ico", "country": "au", "language": "en", "bias": "center", "bias_score": 48},
        {"name": "Bangkok Post", "website": "https://www.bangkokpost.com", "rss_url": "https://www.bangkokpost.com/rss/data/topstories.xml", "logo": "https://www.bangkokpost.com/favicon.ico", "country": "th", "language": "en", "bias": "center", "bias_score": 50},
        {"name": "Xinhua English", "website": "http://www.xinhuanet.com/english", "rss_url": "http://www.xinhuanet.com/english/rss/worldrss.xml", "logo": "http://www.xinhuanet.com/favicon.ico", "country": "cn", "language": "en", "bias": "right", "bias_score": 85},

    ]

    def add_arguments(self, parser):
        parser.add_argument(
            "--skip-verify",
            action="store_true",
            help="Skip live feed verification and just upsert every source as active (fast, no network calls).",
        )
        parser.add_argument(
            "--timeout",
            type=int,
            default=FEED_TIMEOUT_SECONDS,
            help=f"Per-feed timeout in seconds (default: {FEED_TIMEOUT_SECONDS}).",
        )
        parser.add_argument(
            "--keep-inactive",
            action="store_true",
            help=(
                "Old behaviour: keep failed sources in the DB with is_active=False "
                "instead of deleting them outright."
            ),
        )

    def verify_feed(self, rss_url, timeout):
        old_timeout = socket.getdefaulttimeout()
        socket.setdefaulttimeout(timeout)
        try:
            parsed = feedparser.parse(rss_url)
            if parsed.bozo and not parsed.entries:
                reason = getattr(parsed, "bozo_exception", "unknown parse error")
                return False, f"parse error: {reason}"
            if not parsed.entries:
                return False, "feed returned zero entries"
            return True, f"ok ({len(parsed.entries)} entries)"
        except (URLError, HTTPError, socket.timeout, TimeoutError) as exc:
            return False, f"network error: {exc}"
        except Exception as exc:
            return False, f"unexpected error: {exc}"
        finally:
            socket.setdefaulttimeout(old_timeout)

    def handle(self, *args, **kwargs):
        skip_verify = kwargs["skip_verify"]
        timeout = kwargs["timeout"]
        keep_inactive = kwargs["keep_inactive"]

        self.stdout.write(f"Processing {len(self.SOURCES)} sources (timeout={timeout}s per feed)...\n")

        added, updated, removed = 0, 0, 0
        verified_ok, verified_failed = 0, 0

        for source in self.SOURCES:
            is_active = True
            status_note = "verification skipped"

            if not skip_verify:
                is_active, status_note = self.verify_feed(source["rss_url"], timeout)
                if is_active:
                    verified_ok += 1
                else:
                    verified_failed += 1

            # Feed failed verification and we're not keeping inactive rows:
            # remove it from the DB entirely (matches --keep-inactive=False default).
            if not is_active and not keep_inactive:
                deleted_count, _ = Source.objects.filter(rss_url=source["rss_url"]).delete()
                if deleted_count:
                    removed += 1
                    self.stdout.write(self.style.ERROR(
                        f"\U0001f5d1  Removed: {source['name']} ({source['country'].upper()}) — {status_note}"
                    ))
                else:
                    self.stdout.write(self.style.WARNING(
                        f"\u23ed  Skipped (never existed, failed verify): {source['name']} — {status_note}"
                    ))
                continue

            try:
                obj, created = Source.objects.update_or_create(
                    rss_url=source["rss_url"],
                    defaults={
                        "name": source["name"],
                        "website": source["website"],
                        "logo": source["logo"],
                        "country": source["country"],
                        "language": source["language"],
                        "bias": source.get("bias", "center"),
                        "bias_score": source.get("bias_score", 50),
                        "rating": source.get("rating", "mostly-factual"),
                        "is_active": is_active,
                    },
                )
            except Exception as exc:
                self.stdout.write(self.style.ERROR(f"\u26d4 DB error for {source['name']}: {exc}"))
                continue

            if created:
                added += 1
            else:
                updated += 1

            if is_active:
                icon = "\u2705 Added" if created else "\U0001f504 Updated"
                style = self.style.SUCCESS
            else:
                icon = "\u26a0  Added (inactive)" if created else "\u26a0  Updated (marked inactive)"
                style = self.style.WARNING

            self.stdout.write(style(
                f"{icon}: {source['name']} ({source['country'].upper()}) - {source['language']} "
                f"[bias: {source.get('bias', 'center')} ({source.get('bias_score', 50)}/100), "
                f"rating: {source.get('rating', 'mostly-factual')}] — {status_note}"
            ))

        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS(f"\U0001f389 Done. {added} added, {updated} updated, {removed} removed."))
        if not skip_verify:
            self.stdout.write(f"   Feed check: {verified_ok} verified live, {verified_failed} failed.")
            if verified_failed and keep_inactive:
                self.stdout.write("   --keep-inactive was set, so failed sources were kept with is_active=False instead of being deleted.")