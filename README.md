# Enterprise AI CFO Platform

Welcome to the **Enterprise AI CFO Platform**! This is a state-of-the-art AI Decision Intelligence System designed for multi-tenant B2B environments.

This repository integrates an **AI CFO Core Engine**, a **Financial Advisor Simulation**, and a **Conversational Chat Infrastructure** (based on Quickbots architecture) into a unified enterprise SaaS solution.

## 🚀 Key Features
1. **Multi-Tenant SaaS Architecture:** Each company has isolated financial data and its own unique Chatbot Instance (powered by Clerk B2B Orgs and Supabase RLS).
2. **Financial Intelligence Engine:** Ingests raw transactions and computes Descriptive KPIs, Predictive Forecasts (via Prophet), and Risk Detection (via Isolation Forest).
3. **Conversational AI Layer (RAG):** Uses Upstash Vector to sync financial KPI summaries, so the LLM chatbot can answer questions like *"Why is our profit declining?"* using real data context.
4. **Advisory Simulation Pipeline:** Allows users to run hypothetical scenarios and see the projected financial impact immediately.
5. **Automation:** Triggers webhooks for critical financial anomalies (e.g. via n8n to Slack/Email).

## 📁 Repository Structure
This project is conceptually divided into two major layers:

*   **/ai-cfo-frontend:** The Next.js React application.
    *   *Features:* Chatbot Interface, Multi-Tenant Authentication (Clerk), and Dashboard elements written using Tailwind + Shadcn UI.
*   **/ai-cfo-backend:** The Django REST API and Machine Learning service.
    *   *Features:* Transaction models, ML calculation workers, RAG orchestration endpoints, and database connection logic targeting Supabase PostgreSQL.

## 🛠️ Quick Start

**Prerequisites:** You will need API keys from:
*   [Clerk.com](https://clerk.com/) (Enable Organizations)
*   [Supabase.com](https://supabase.com/) (PostgreSQL Database)
*   [Upstash.com](https://upstash.com/) (Vector Search & Redis)

**Frontend Setup:**
1. `cd ai-cfo-frontend`
2. Configure `.env.local`
3. `npm install`
4. `npm run dev`

**Backend Setup:**
1. `cd ai-cfo-backend`
2. Configure `.env`
3. `python -m venv venv` and activate it
4. `pip install -r requirements.txt` *(to be generated)*
5. `python manage.py migrate`
6. `python manage.py runserver`

## 🏗️ Agile Methodology
This project is built iteratively using Agile Sprints. You can find detailed breakdowns of the Epics and User stories in `agile_user_stories.md`.

*Current Status: Sprints 1 through 5 (Foundation, Chat, AI Engine, Clerk Auth) are **completed**. Preparing for Sprint 6: Data Integration Layer.*

## ☁️ Deployment
The frontend is optimized for **Vercel** and the backend is configured for **Microsoft Azure** (App Services & Key Vault).
