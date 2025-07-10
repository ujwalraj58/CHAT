from django.db import models
from django.contrib.auth.models import User # Import User model

class Reminder(models.Model):
    """
    Model to store user reminders.
    """
    task = models.CharField(max_length=255)
    date = models.DateField(blank=True, null=True) # Date can be optional
    created_at = models.DateTimeField(auto_now_add=True) # Automatically set on creation

    def __str__(self):
        return self.task

class ChatMessage(models.Model):
    """
    Model to store chat messages between a user and the bot.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE) # Link to Django's built-in User model
    sender = models.CharField(max_length=10)  # 'user' or 'bot'
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True) # Automatically set on creation

    def __str__(self):
        return f"{self.user.username} - {self.sender}: {self.message[:30]}"

