"""
RAG Sync Engine
Compiles KPIs, forecasts, anomalies, and recommendations into structured
financial summaries, then pushes them to Upstash Search indexed by bot_id.
This allows the Conversational CFO to retrieve real financial context during chat.
"""
import os
import json
import logging
import requests
from api.models import KPISnapshot, ForecastResult, AnomalyLog, Recommendation, UploadedFile

logger = logging.getLogger(__name__)


def sync_financial_context_to_rag(bot_id: str) -> dict:
    """
    Compile all financial intelligence for a bot and push to Upstash Search.

    Args:
        bot_id: The company's bot instance ID.

    Returns:
        A dict summarizing what was synced.
    """
    documents = []

    # 1. KPI Snapshots
    kpis = KPISnapshot.objects.filter(bot_id=bot_id).order_by("-created_at")[:6]
    if kpis.exists():
        kpi_text = _build_kpi_summary(kpis)
        documents.append({
            "id": f"bot:{bot_id}:kpis",
            "content": kpi_text,
            "metadata": {"botId": bot_id, "type": "kpi_summary"},
        })

    # 2. Forecast Results
    forecasts = ForecastResult.objects.filter(bot_id=bot_id).order_by("forecast_date")[:12]
    if forecasts.exists():
        forecast_text = _build_forecast_summary(forecasts)
        documents.append({
            "id": f"bot:{bot_id}:forecasts",
            "content": forecast_text,
            "metadata": {"botId": bot_id, "type": "forecast_summary"},
        })

    # 3. Anomaly Alerts
    anomalies = AnomalyLog.objects.filter(bot_id=bot_id, is_resolved=False).order_by("-detected_at")[:10]
    if anomalies.exists():
        anomaly_text = _build_anomaly_summary(anomalies)
        documents.append({
            "id": f"bot:{bot_id}:anomalies",
            "content": anomaly_text,
            "metadata": {"botId": bot_id, "type": "anomaly_alerts"},
        })

    # 4. Recommendations
    recs = Recommendation.objects.filter(bot_id=bot_id).order_by("-created_at")[:10]
    if recs.exists():
        rec_text = _build_recommendation_summary(recs)
        documents.append({
            "id": f"bot:{bot_id}:recommendations",
            "content": rec_text,
            "metadata": {"botId": bot_id, "type": "recommendations"},
        })

    # 5. Uploaded File Summaries
    files = UploadedFile.objects.filter(bot_id=bot_id, status="completed").order_by("-uploaded_at")[:5]
    for f in files:
        if f.ai_summary:
            documents.append({
                "id": f"bot:{bot_id}:file:{f.id}",
                "content": f"Uploaded File: {f.original_filename}\n{f.ai_summary}",
                "metadata": {"botId": bot_id, "type": "file_summary", "filename": f.original_filename},
            })

    # Push all documents to Upstash Search
    synced = _push_to_upstash(documents)

    logger.info(f"RAG sync complete for bot={bot_id}: {synced} documents pushed")
    return {
        "bot_id": bot_id,
        "documents_synced": synced,
        "document_types": [d["metadata"]["type"] for d in documents],
    }


def retrieve_financial_context(bot_id: str, query: str, top_k: int = 5) -> str:
    """
    Retrieve relevant financial context from Upstash Search for a chat query.

    Args:
        bot_id: The company's bot instance ID.
        query: The user's chat message.
        top_k: Number of top results to retrieve.

    Returns:
        A formatted string of relevant financial context for LLM injection.
    """
    url = os.environ.get("UPSTASH_SEARCH_REST_URL")
    token = os.environ.get("UPSTASH_SEARCH_REST_TOKEN")

    if not url or not token:
        logger.warning("Upstash Search not configured. RAG disabled.")
        return ""

    try:
        response = requests.post(
            f"{url}/search",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            },
            json={
                "query": query,
                "topK": top_k,
                "filter": f"botId = '{bot_id}'",
            },
            timeout=5,
        )
        response.raise_for_status()
        results = response.json()

        if not results or "result" not in results:
            return ""

        context_parts = []
        for hit in results["result"]:
            content = hit.get("content", "")
            if content:
                context_parts.append(content)

        if context_parts:
            return "FINANCIAL CONTEXT START\n" + "\n---\n".join(context_parts) + "\nFINANCIAL CONTEXT END"

        return ""

    except Exception as e:
        logger.error(f"RAG retrieval failed: {e}")
        return ""


# ──────────────────────────────────────────────
# Summary Builders
# ──────────────────────────────────────────────

def _build_kpi_summary(kpis) -> str:
    lines = ["FINANCIAL KPI REPORT (Last 6 periods)"]
    for kpi in kpis:
        lines.append(
            f"Period {kpi.period}: Revenue=${kpi.total_revenue}, "
            f"Expenses=${kpi.total_expenses}, Net Profit=${kpi.net_profit}, "
            f"Margin={kpi.profit_margin}%, Burn Rate=${kpi.burn_rate}/month, "
            f"Runway={kpi.runway_months} months"
        )
    return "\n".join(lines)


def _build_forecast_summary(forecasts) -> str:
    lines = ["REVENUE FORECAST (Next months)"]
    for f in forecasts:
        lines.append(
            f"{f.forecast_date}: Predicted Revenue=${f.predicted_revenue} "
            f"(Range: ${f.lower_bound} - ${f.upper_bound})"
        )
    return "\n".join(lines)


def _build_anomaly_summary(anomalies) -> str:
    lines = ["ACTIVE ANOMALY ALERTS"]
    for a in anomalies:
        lines.append(
            f"[{a.severity.upper()}] {a.category}: {a.description}"
        )
    return "\n".join(lines)


def _build_recommendation_summary(recs) -> str:
    lines = ["CFO RECOMMENDATIONS"]
    for r in recs:
        lines.append(
            f"[{r.priority.upper()}] {r.title}: {r.detail}"
        )
    return "\n".join(lines)


def _push_to_upstash(documents: list) -> int:
    """Push documents to Upstash Search via REST API."""
    url = os.environ.get("UPSTASH_SEARCH_REST_URL")
    token = os.environ.get("UPSTASH_SEARCH_REST_TOKEN")

    if not url or not token:
        logger.warning("Upstash Search not configured. Skipping RAG sync.")
        return 0

    synced = 0
    for doc in documents:
        try:
            response = requests.post(
                f"{url}/upsert",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                },
                json={
                    "id": doc["id"],
                    "content": doc["content"],
                    "metadata": doc["metadata"],
                },
                timeout=5,
            )
            response.raise_for_status()
            synced += 1
        except Exception as e:
            logger.error(f"Failed to upsert document {doc['id']}: {e}")

    return synced
