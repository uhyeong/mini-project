from django.db import models
from django.conf import settings
from django.contrib.auth.models import User
from pgvector.django import VectorField

# Create your models here.
class Session(models.Model):
    user_id = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

class Message(models.Model):
    sender = models.CharField(max_length=255)   # "AI" or "User"
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    session_id = models.ForeignKey(Session, on_delete=models.CASCADE)

class PhilosophyData(models.Model):
    author = models.CharField(max_length=255)
    quote = models.TextField()
    quote_keywords = models.CharField(max_length=255, null=True, blank=True)
    quote_emb = VectorField(dimensions=1536, default=[0.0]*1536)
    keywords_emb = VectorField(dimensions=1536, default=[0.0]*1536)
