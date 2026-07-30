from django.db import models
from django.conf import settings


# ==========================================================
# CHOICES (tumhara existing code same)
# ==========================================================

CATEGORY_CHOICES = [
    ("politics", "Politics"),
    ("business", "Business"),
    ("finance", "Finance"),
    ("technology", "Technology"),
    ("sports", "Sports"),
    ("health", "Health"),
    ("science", "Science"),
    ("entertainment", "Entertainment"),
    ("world", "World"),
    ("crime", "Crime"),
    ("education", "Education"),
    ("environment", "Environment"),
    ("general", "General"),
]

BIAS_CHOICES = [
    ("left", "Left"),
    ("center", "Center"),
    ("right", "Right"),
]

COUNTRY_CHOICES = [
    ("pk", "Pakistan"),
    ("us", "United States"),
    ("gb", "United Kingdom"),
    ("in", "India"),
    ("ca", "Canada"),
    ("au", "Australia"),
    ("fr", "France"),
    ("de", "Germany"),
    ("qa", "Qatar"),
    ("sa", "Saudi Arabia"),
    ("ae", "United Arab Emirates"),
    ("il", "Israel"),
    ("ru", "Russia"),
    ("ua", "Ukraine"),
    ("hk", "Hong Kong"),
    ("jp", "Japan"),
    ("sg", "Singapore"),
    ("my", "Malaysia"),
    ("th", "Thailand"),
    ("ph", "Philippines"),
    ("cn", "China"),
    ("nz", "New Zealand"),
    ("bd", "Bangladesh"),
    ("tr", "Turkey"),
    ("ie", "Ireland"),
    ("za", "South Africa"),
    ("kr", "South Korea"),
    ("tw", "Taiwan"),
]


# ==========================================================
# SOURCE MODEL
# ==========================================================

class Source(models.Model):
    name = models.CharField(max_length=100)
    website = models.URLField()
    rss_url = models.URLField(unique=True)
    logo = models.URLField(blank=True)
    country = models.CharField(max_length=5, choices=COUNTRY_CHOICES, default="pk")
    language = models.CharField(max_length=10, default="en")
    bias = models.CharField(max_length=10, choices=BIAS_CHOICES, default="center")
    bias_score = models.IntegerField(default=50)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


# ==========================================================
# NEWS CLUSTER MODEL
# ==========================================================

class NewsCluster(models.Model):
    main_title = models.CharField(max_length=500)
    slug = models.SlugField(unique=True)
    image_url = models.URLField(blank=True)
    summary = models.TextField(blank=True, default="", help_text="3-4 paragraph detailed summary")
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default="general")
    bias = models.CharField(max_length=10, choices=BIAS_CHOICES, default="center")
    bias_score = models.IntegerField(default=50)
    article_count = models.PositiveIntegerField(default=0)
    source_count = models.PositiveIntegerField(default=0)
    left_sources = models.PositiveIntegerField(default=0)
    center_sources = models.PositiveIntegerField(default=0)
    right_sources = models.PositiveIntegerField(default=0)
    country = models.CharField(max_length=5,choices=COUNTRY_CHOICES,default="pk")
    language = models.CharField(max_length=10,default="en")
    is_top_story = models.BooleanField(default=False)
    embedding = models.JSONField(null=True, blank=True)
    hero_source = models.CharField(max_length=100, blank=True)
    latest_published = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.main_title


# ==========================================================
# NEWS MODEL
# ==========================================================

class News(models.Model):
    title = models.CharField(max_length=500)
    content = models.TextField(blank=True)
    url = models.URLField(unique=True, null=True, blank=True)
    bias = models.CharField(max_length=10, choices=BIAS_CHOICES, default="center")
    bias_score = models.IntegerField(default=50)
    image_url = models.URLField(blank=True)
    published_at = models.DateTimeField(null=True, blank=True)
    source = models.ForeignKey(Source, on_delete=models.SET_NULL, null=True, related_name="news")
    cluster = models.ForeignKey(NewsCluster, on_delete=models.SET_NULL, null=True, blank=True, related_name="articles")
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default="general")
    country = models.CharField(max_length=5, choices=COUNTRY_CHOICES, default="pk")
    language = models.CharField(max_length=10, default="en")
    embedding = models.JSONField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-published_at"]

    def __str__(self):
        return self.title


# ==========================================================
# ✅ NEW - SAVED NEWS MODEL (ye add karo)
# ==========================================================

class SavedNews(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="saved_news")
    cluster = models.ForeignKey(NewsCluster, on_delete=models.CASCADE, related_name="saved_by")
    # optional: specific article save karna ho to
    article = models.ForeignKey(News, on_delete=models.CASCADE, null=True, blank=True, related_name="saved_by")
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "cluster", "article")
        ordering = ["-saved_at"]

    def __str__(self):
        return f"{self.user.email} - {self.cluster.main_title[:30]}"