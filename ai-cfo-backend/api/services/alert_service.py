"""
Alert Automation Service
Sends notifications when the AI CFO detects critical anomalies or risks.
Supports webhook (n8n/Zapier), Slack, and email notifications.
"""
import os
import json
import logging
from datetime import datetime

import requests
from api.models import AnomalyLog, Recommendation

logger = logging.getLogger(__name__)


def check_and_send_alerts(bot_id: str) -> dict:
    """
    Check for unresolved critical anomalies and high-priority recommendations,
    then send alerts via configured channels.

    Args:
        bot_id: The company's bot instance ID.

    Returns:
        A dict summarizing which alerts were sent.
    """
    alerts_sent = []

    # Gather critical items
    critical_anomalies = AnomalyLog.objects.filter(
        bot_id=bot_id,
        severity__in=["high", "critical"],
        is_resolved=False,
    ).order_by("-detected_at")[:5]

    action_recommendations = Recommendation.objects.filter(
        bot_id=bot_id,
        priority="action",
    ).order_by("-created_at")[:5]

    if not critical_anomalies.exists() and not action_recommendations.exists():
        return {"bot_id": bot_id, "alerts_sent": 0, "message": "No critical alerts to send."}

    # Build alert payload
    payload = _build_alert_payload(bot_id, critical_anomalies, action_recommendations)

    # Send via configured channels
    webhook_url = os.environ.get("ALERT_WEBHOOK_URL")
    if webhook_url:
        result = _send_webhook(webhook_url, payload)
        alerts_sent.append({"channel": "webhook", "success": result})

    slack_url = os.environ.get("SLACK_WEBHOOK_URL")
    if slack_url:
        result = _send_slack(slack_url, payload)
        alerts_sent.append({"channel": "slack", "success": result})

    # If no channels configured, log the alert
    if not webhook_url and not slack_url:
        logger.info(f"Alert generated but no notification channels configured for bot={bot_id}")
        alerts_sent.append({"channel": "log_only", "success": True})

    return {
        "bot_id": bot_id,
        "alerts_sent": len(alerts_sent),
        "channels": alerts_sent,
        "anomalies_flagged": critical_anomalies.count(),
        "actions_required": action_recommendations.count(),
        "payload": payload,
    }


def _build_alert_payload(bot_id: str, anomalies, recommendations) -> dict:
    """Build a structured alert payload for notification channels."""
    alert_items = []

    for a in anomalies:
        alert_items.append({
            "type": "anomaly",
            "severity": a.severity,
            "category": a.category,
            "description": a.description,
            "amount": float(a.amount) if a.amount else None,
        })

    for r in recommendations:
        alert_items.append({
            "type": "recommendation",
            "priority": r.priority,
            "title": r.title,
            "detail": r.detail,
        })

    return {
        "bot_id": bot_id,
        "timestamp": datetime.now().isoformat(),
        "source": "AI CFO Intelligence Engine",
        "total_alerts": len(alert_items),
        "alerts": alert_items,
        "summary": (
            f"AI CFO detected {anomalies.count()} critical anomalies "
            f"and {recommendations.count()} action items requiring immediate attention."
        ),
    }


def _send_webhook(url: str, payload: dict) -> bool:
    """Send alert to a generic webhook (n8n, Zapier, Make, etc.)."""
    try:
        response = requests.post(
            url,
            headers={"Content-Type": "application/json"},
            json=payload,
            timeout=10,
        )
        response.raise_for_status()
        logger.info(f"Webhook alert sent successfully to {url}")
        return True
    except Exception as e:
        logger.error(f"Webhook alert failed: {e}")
        return False


def _send_slack(url: str, payload: dict) -> bool:
    """Send a formatted alert to Slack via incoming webhook."""
    anomaly_count = len([a for a in payload["alerts"] if a["type"] == "anomaly"])
    rec_count = len([a for a in payload["alerts"] if a["type"] == "recommendation"])

    blocks = [
        {
            "type": "header",
            "text": {"type": "plain_text", "text": "🚨 AI CFO Alert", "emoji": True}
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": payload["summary"]
            }
        },
        {"type": "divider"},
    ]

    # Add anomaly details
    for alert in payload["alerts"][:5]:
        emoji = "🔴" if alert.get("severity") in ["critical", "high"] else "🟡"
        if alert["type"] == "anomaly":
            blocks.append({
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"{emoji} *[{alert['severity'].upper()}]* {alert['category']}\n{alert['description']}"
                }
            })
        else:
            blocks.append({
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"💡 *{alert['title']}*\n{alert['detail']}"
                }
            })

    slack_payload = {"blocks": blocks}

    try:
        response = requests.post(
            url,
            headers={"Content-Type": "application/json"},
            json=slack_payload,
            timeout=10,
        )
        response.raise_for_status()
        logger.info("Slack alert sent successfully")
        return True
    except Exception as e:
        logger.error(f"Slack alert failed: {e}")
        return False
