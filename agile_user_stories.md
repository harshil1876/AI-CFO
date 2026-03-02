# Agile Product Backlog: Enterprise AI CFO Platform

This document breaks down the platform development into Epics, User Stories, and Acceptance Criteria suited for short, focused Sprints.

---

## Epic 1: Core Foundation & Secure Multi-Tenancy
**Description:** Establish the architecture so a B2B SaaS client can register their company and get a dedicated, isolated environment.

**User Stories:**
- **US 1.1:** As an Admin of a Company, I want to register my organization via Clerk, so that all my employees can join the same tenant under one `bot_id`.
  - *Acceptance Criteria:* Clerk Organization features are active; logging in redirects to a multi-tenant dashboard.
- **US 1.2:** As a System Architect, I want to store financial records in Supabase with Row Level Security (RLS), so that Company A can never query Company B's financial data.
  - *Acceptance Criteria:* `org_id` / `bot_id` is automatically linked to all Supabase inserts/selects.
- **US 1.3:** As an Accountant, I want to push my general ledger and `transaction` data into the platform API, so the AI can analyze it.
  - *Acceptance Criteria:* Secure Django endpoints exist for uploading CSV/JSON payloads.

---

## Epic 2: The Intelligence Engine (AI Brain)
**Description:** Analyze raw data, summarize historical KPIs to detect anomalies, and forecast future revenue/expenses.

**User Stories:**
- **US 2.1:** As a Financial Analyst, I want the system to calculate Descriptive KPIs (profit margin, burn rate) monthly, so I don't have to do it manually.
  - *Acceptance Criteria:* A periodic worker or endpoint aggregates `transactions` into the `kpi_snapshots` table.
- **US 2.2:** As a CFO, I want to see predictive forecasts of my revenue for the next 6 months, so I can plan budgets accurately.
  - *Acceptance Criteria:* Prophet ML model generates `forecast_results` stored securely in the DB.
- **US 2.3:** As an Auditor, I want the system to flag anomalous department costs, so I can investigate potential fraud or waste.
  - *Acceptance Criteria:* Isolation Forest correctly logs records to the `anomaly_logs` table.

---

## Epic 3: RAG Integration & Conversational CFO
**Description:** Connect the backend intelligence and structured data with an LLM conversational bot interface (Next.js).

**User Stories:**
- **US 3.1:** As the RAG Engine, I need to ingest the latest `kpi_snapshots` and `forecast_results`, so the LLM has up-to-date context.
  - *Acceptance Criteria:* Django pushes structured KPI text into Upstash Vector, partitioned by `bot_id`.
- **US 3.2:** As a Company CEO, I want to ask my CFO bot "Why is our profit declining?", so I can get contextual answers tied to actual reports.
  - *Acceptance Criteria:* The `/api/chat/<bot_id>` endpoint fetches Upstash RAG chunks before pinging OpenAI/Groq, returning a tailored answer in the React UI.

---

## Epic 4: Advisory Simulation & Automation
**Description:** Move beyond answering questions to simulating proactive scenarios and triggering outside systems.

**User Stories:**
- **US 4.1:** As a CEO, I want to ask "What happens if we increase marketing by 20%?", so the AI can recalculate the financial future on the fly.
  - *Acceptance Criteria:* Intent detection triggers the Django Advisory Simulation Engine to recalculate margins before responding.
- **US 4.2:** As a CFO, I want to be alerted immediately in Slack when a Cash Flow risk threshold is breached, so I can act before end-of-month reporting.
  - *Acceptance Criteria:* Severe `anomaly_logs` trigger a webhook (n8n), alerting stakeholders.
