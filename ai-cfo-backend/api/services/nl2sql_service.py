"""
Sprint 18 Part B — Ad-Hoc Data Query Agent (NL2SQL)
====================================================
Converts natural-language financial questions into safe Django ORM queries.
Uses Gemini to classify intent, then maps to pre-defined safe query templates.
This approach avoids raw SQL injection risks entirely.
"""

import os
import json
import logging
from datetime import datetime, timedelta
from decimal import Decimal

logger = logging.getLogger(__name__)

# ── Safe query templates mapped by intent key ─────────────────────────────
def _run_query(intent: str, bot_id: str, params: dict) -> list[dict]:
    from api.models import Transaction, Budget, Invoice, KPISnapshot, AnomalyLog

    rows = []

    if intent == "top_expenses":
        limit = params.get("limit", 10)
        qs = Transaction.objects.filter(bot_id=bot_id, transaction_type="expense") \
                                .order_by("-amount")[:limit]
        for t in qs:
            rows.append({"Category": t.category, "Amount ($)": float(t.amount), "Date": str(t.date), "Description": t.description or ""})

    elif intent == "expenses_by_category":
        from django.db.models import Sum
        department = params.get("department", "").lower()
        qs = Transaction.objects.filter(bot_id=bot_id, transaction_type="expense")
        if department:
            qs = qs.filter(category__icontains=department)
        qs = qs.values("category").annotate(total=Sum("amount")).order_by("-total")
        for r in qs:
            rows.append({"Category": r["category"], "Total Spend ($)": float(r["total"])})

    elif intent == "revenue_summary":
        from django.db.models import Sum
        qs = Transaction.objects.filter(bot_id=bot_id, transaction_type="revenue") \
                                .values("category").annotate(total=Sum("amount")).order_by("-total")
        for r in qs:
            rows.append({"Category": r["category"], "Total Revenue ($)": float(r["total"])})

    elif intent == "budget_vs_actual":
        from django.db.models import Sum
        month = params.get("month", datetime.now().strftime("%Y-%m"))
        budgets = Budget.objects.filter(bot_id=bot_id, month_year=month, is_active=True)
        actuals = Transaction.objects.filter(bot_id=bot_id, transaction_type="expense") \
                                     .values("category").annotate(total=Sum("amount"))
        actual_map = {a["category"].lower(): float(a["total"]) for a in actuals}
        for b in budgets:
            actual = actual_map.get(b.category.lower(), 0)
            variance = float(b.allocated_amount) - actual
            rows.append({
                "Category": b.category,
                "Budgeted ($)": float(b.allocated_amount),
                "Actual ($)": actual,
                "Variance ($)": round(variance, 2),
                "Status": "Under Budget" if variance >= 0 else "Over Budget"
            })

    elif intent == "invoice_summary":
        status_filter = params.get("status", "")
        qs = Invoice.objects.filter(bot_id=bot_id)
        if status_filter:
            qs = qs.filter(status=status_filter)
        qs = qs.order_by("-uploaded_at")[:20]
        for inv in qs:
            rows.append({
                "Vendor": inv.vendor_name,
                "Amount ($)": float(inv.total_amount or 0),
                "Status": inv.status,
                "Date": str(inv.date_issued or ""),
                "Fraud Score": f"{inv.fraud_confidence_score}%",
            })

    elif intent == "anomalies":
        severity = params.get("severity", "")
        qs = AnomalyLog.objects.filter(bot_id=bot_id).order_by("-detected_at")[:20]
        if severity:
            qs = qs.filter(severity=severity)
        for a in qs:
            rows.append({
                "Category": a.category,
                "Description": a.description,
                "Severity": a.severity.upper(),
                "Amount ($)": float(a.amount or 0),
                "Detected At": a.detected_at.strftime("%Y-%m-%d"),
            })

    elif intent == "kpi_snapshot":
        kpi = KPISnapshot.objects.filter(bot_id=bot_id).order_by("-created_at").first()
        if kpi:
            rows.append({
                "Period": kpi.period,
                "Revenue ($)": float(kpi.total_revenue),
                "Expenses ($)": float(kpi.total_expenses),
                "Net Profit ($)": float(kpi.net_profit),
                "Profit Margin (%)": float(kpi.profit_margin),
                "Burn Rate ($/mo)": float(kpi.burn_rate),
                "Runway (months)": float(kpi.runway_months),
            })

    elif intent == "recent_transactions":
        days = params.get("days", 30)
        since = datetime.now() - timedelta(days=int(days))
        qs = Transaction.objects.filter(bot_id=bot_id, date__gte=since).order_by("-date")[:30]
        for t in qs:
            rows.append({
                "Date": str(t.date),
                "Category": t.category,
                "Type": t.transaction_type,
                "Amount ($)": float(t.amount),
                "Description": t.description or "",
            })

    return rows


def _classify_intent(question: str) -> dict:
    """Use Gemini to classify the user's NL question into a safe query intent."""
    import os
    from google import genai

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return {"intent": "unknown", "params": {}, "summary": "GEMINI_API_KEY not configured."}

    client = genai.Client(api_key=api_key)

    classification_prompt = f"""
You are a financial data query classifier. Map the user's question to ONE of these intents:

- top_expenses       → User wants top spending items  (params: limit int)
- expenses_by_category → User wants spending broken down by category (params: department str optional)
- revenue_summary    → User wants revenue breakdown
- budget_vs_actual   → User wants budget vs actual comparison (params: month YYYY-MM)
- invoice_summary    → User wants to see invoices (params: status str optional: pending_approval|approved|rejected)
- anomalies          → User wants to see fraud/anomaly alerts (params: severity str optional: low|medium|high)
- kpi_snapshot       → User wants live KPIs / financial summary
- recent_transactions → User wants recent transactions (params: days int default 30)

User question: "{question}"

Respond ONLY in this JSON format:
{{
  "intent": "<intent_key>",
  "params": {{}},
  "summary": "<One sentence describing what you will show>"
}}
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=classification_prompt,
        )
        text = response.text.strip()
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
        return json.loads(text)
    except Exception as e:
        logger.error(f"[NL2SQL] Intent classification failed: {e}")
        # Fallback to kpi_snapshot
        return {"intent": "kpi_snapshot", "params": {}, "summary": "Showing your live KPI snapshot."}


def run_nl_query(bot_id: str, question: str) -> dict:
    """
    Main entry point. Classifies the user's NL question and runs a safe ORM query.
    Returns: { intent, summary, columns, rows }
    """
    classification = _classify_intent(question)
    intent = classification.get("intent", "kpi_snapshot")
    params = classification.get("params", {})
    summary = classification.get("summary", "")

    if intent == "unknown":
        return {
            "success": False,
            "error": "I couldn't understand what data you're looking for. Try asking about expenses, revenue, invoices, or KPIs.",
        }

    rows = _run_query(intent, bot_id, params)

    if not rows:
        return {
            "success": True,
            "intent": intent,
            "summary": summary,
            "columns": [],
            "rows": [],
            "message": "No data found for this query. Try uploading data first or running the analytics pipeline.",
        }

    columns = list(rows[0].keys())

    return {
        "success": True,
        "intent": intent,
        "summary": summary,
        "columns": columns,
        "rows": rows,
    }
