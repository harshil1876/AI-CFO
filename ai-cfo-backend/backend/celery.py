"""
Sprint 6: Celery Application Configuration
Creates the Celery app and enables auto-discovery of tasks in all installed apps.
"""
import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

app = Celery('backend')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
