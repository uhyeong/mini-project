from django.contrib import admin

# Register your models here.

from .models import CustomUser
@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = (
        'username', 'email', 'is_superuser','is_admin','is_active','is_staff'
    )