from django.contrib import admin

# Register your models here.
from .models import Message

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'sender', 'text', 'created_at'
    )


from .models import Session

@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'title', 'created_at'
    )