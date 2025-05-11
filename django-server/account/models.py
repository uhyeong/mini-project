from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

class UserManager(BaseUserManager):
  use_in_migrations = True
  
  def create_user(self, username, email=None, password=None,**extra_fields):
    extra_fields.setdefault('is_active', True)
    user = self.model(
      username=username,
      email=self.normalize_email(email),
      **extra_fields
    )
    user.set_password(password)
    user.save(using=self._db)

    return user
  def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(username, email, password, **extra_fields)

class CustomUser(AbstractBaseUser, PermissionsMixin):
  objects = UserManager()

  username = models.CharField(
    max_length=20,
    unique=True,
    null=False
  )
  email = models.EmailField(
    max_length=100,
    unique=True,
    null=False
  )
  is_superuser = models.BooleanField(default=False)
  is_admin = models.BooleanField(default=False)
  is_active = models.BooleanField(default=True)
  is_staff = models.BooleanField(default=False)
  
  class Meta:
    db_table = 'account'

  USERNAME_FIELD = 'username'
  REQUIRED_FIELDS = ['email']