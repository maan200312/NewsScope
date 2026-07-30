from django.db import models
from django.conf import settings
from news.models import News


class SavedNews(models.Model):

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    news = models.ForeignKey(
        News,
        on_delete=models.CASCADE
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "news")

    def __str__(self):
        return f"{self.user} - {self.news.title}"