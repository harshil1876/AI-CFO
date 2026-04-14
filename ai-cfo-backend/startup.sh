#!/bin/bash
python manage.py migrate --no-input
python manage.py collectstatic --no-input
gunicorn backend.wsgi --workers 2 --timeout 120 --bind 0.0.0.0:8000
