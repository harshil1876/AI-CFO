# Enterprise AI CFO Platform

Welcome to the **Enterprise AI CFO Platform**! This is a state-of-the-art AI Decision Intelligence System designed for multi-tenant B2B environments.

This repository integrates an **AI CFO Core Engine**, a **Financial Advisor Simulation**, and a **Conversational Chat Infrastructure** (based on Quickbots architecture) into a unified enterprise SaaS solution.

## 🚀 Key Features (Sprints 1-14)
1. **Supabase-Tier Multi-Tenant Workspaces:** A highly robust top-level `Organization` model paired with an isolated multi-`Workspace` engine, strictly separating ledgers, integrations, and permission hierarchies.
2. **Hybrid Multi-Agent Ecosystem:** Four explicit AI Personas (The Auditor, The Strategist, The Analyst, The Guardian) built on Gemini Vision/Pro, automatically adapting the RAG context and interaction style to the financial task.
3. **Financial Intelligence & Analytics Engine:** Automatically ingests raw CSV, Excel, or PDF invoices and computes Descriptive KPIs, Prophet-based Revenue Forecasting, and Isolation Forest Fraud Detection.
4. **Interactive BI Dashboards:** Power BI-inspired reporting capabilities using `Recharts`, complete with "Drill-Down" transaction rendering, Target KPI radial trackers, and dynamic globally-adaptive currency/timezone states.
5. **Invisible AP Automation & Webhooks:** Utilizes Gemini Vision to automatically pull line-items from invoice PDFs, logging anomalies to an Immutable Audit Trail and alerting stakeholders via background webhooks.

## 📁 Repository Structure
This project is conceptually divided into two major layers:

*   **/ai-cfo-frontend:** The Next.js 14 React App Router architecture.
    *   *Features:* Supabase-inspired 3-State Sidebar Layout, Hybrid Chatbot Interface, B2B Authentication (Clerk), and Advanced Financial Charting.
*   **/ai-cfo-backend:** The Django REST API and Machine Learning service.
    *   *Features:* Pandas ETL parsing, P&L/Cash Flow algorithmic generation, ML anomaly detection workers, and Python RAG orchestration linked to Upstash Vector.

## 🛠️ Quick Start

**Prerequisites:** You will need API keys from:
*   [Clerk.com](https://clerk.com/) (Enable B2B Organizations)
*   [Supabase.com](https://supabase.com/) (PostgreSQL Relational DB)
*   [Upstash.com](https://upstash.com/) (Vector Search Database)
*   [Google AI Studio](https://aistudio.google.com/) (Gemini LLM / Vision)

**Frontend Setup:**
1. `cd ai-cfo-frontend`
2. Configure `.env.local`
3. `npm install`
4. `npm run dev`

**Backend Setup:**
1. `cd ai-cfo-backend`
2. Configure `.env`
3. `python -m venv venv` and activate it
4. `pip install -r requirements.txt`
5. `python manage.py migrate`
6. `python manage.py runserver`

## 🏗️ Agile Methodology & Sprints
This project is built iteratively using Agile Sprints. You can find detailed breakdowns of Epics and User stories in `agile_user_stories.md`.

*Current Status: The Core Financial ML Engine, Multi-Agent Chatbot, and Enterprise RBAC layers (Sprints 1 through 13) are **completed**. The application is currently entering the critical architecture refactor phase (Sprint 14): Supabase UX Layout & Workspace Intelligence Isolation.*

## ☁️ Deployment
The Next.js frontend is optimized for **Vercel** via Server Actions, while the Django container backend operates flawlessly scaled across **Microsoft Azure** (App Services & Key Vault).
