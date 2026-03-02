# AI CFO Backend (Django)

## Overview
This is the Intelligence Engine and API layer for the Enterprise AI CFO Platform, built with Django.

### Tech Stack
- **Framework:** Django & Django REST Framework
- **Database:** Supabase (PostgreSQL)
- **Deployment & Cloud:** Microsoft Azure (App Service)
- **Security:** Azure Key Vault (for secrets management)

## Setup Locally
1. Activate virtual environment: `.\venv\Scripts\activate`
2. Install dependencies: `pip install -r requirements.txt` (To be created)
3. Run migrations: `python manage.py migrate`
4. Start server: `python manage.py runserver`

## Azure Integration
As part of the Enterprise Architecture and utilizing Microsoft Azure Student Credits, this backend is configured for deployment on **Azure App Service**:
- **Azure Key Vault** will securely store the Supabase DB string and Clerk Secret Keys.
- **Azure Monitor (Application Insights)** will be tied into the Django app for real-time anomaly tracking.

To configure Azure locally:
1. `az login`
2. Set environment variables for `AZURE_CLIENT_ID`, etc.
