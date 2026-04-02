import logging
from datetime import timedelta
from django.utils import timezone
from api.models import KPISnapshot, AnomalyLog, Recommendation

logger = logging.getLogger(__name__)

def scan_for_insights(bot_id: str) -> list:
    """
    Background scanner to detect trends across KPIs and Anomalies.
    Returns a list of 'Insight' dictionaries.
    """
    insights = []
    try:
        # Example Engine: Compare last two KPI snapshots
        kpis = list(KPISnapshot.objects.filter(bot_id=bot_id).order_by("-created_at")[:2])
        if len(kpis) == 2:
            current, previous = kpis[0], kpis[1]
            
            # 1. Margin Drop Alert
            if current.profit_margin < previous.profit_margin - 5:
                insights.append({
                    "title": "Margin Alert",
                    "description": f"Profit margin dropped significantly from {previous.profit_margin}% to {current.profit_margin}%.",
                    "severity": "high",
                    "type": "margin_drop"
                })
                
            # 2. Burn Rate Acceleration
            if current.burn_rate > previous.burn_rate * 1.2:
                insights.append({
                    "title": "Burn Rate Warning",
                    "description": f"Burn rate increased by over 20% to ${current.burn_rate}/month.",
                    "severity": "medium",
                    "type": "burn_rate_spike"
                })

        # 3. Clustering Anomalies
        recent_anomalies = AnomalyLog.objects.filter(
            bot_id=bot_id, 
            detected_at__gte=timezone.now() - timedelta(days=1),
            is_resolved=False
        ).count()
        
        if recent_anomalies >= 3:
            insights.append({
                "title": "High Anomaly Volume",
                "description": f"You have {recent_anomalies} unresolved anomalies from the last 24 hours.",
                "severity": "high",
                "type": "anomaly_cluster"
            })
            
    except Exception as e:
        logger.error(f"Error scanning for insights: {e}")
        
    return insights

def generate_morning_brief(bot_id: str) -> dict:
    """
    Consolidates insights, recent recommendations, and active anomalies 
    into a daily briefing for the CFO.
    """
    try:
        insights = scan_for_insights(bot_id)
        
        active_anomalies = AnomalyLog.objects.filter(
            bot_id=bot_id, 
            is_resolved=False
        ).order_by("-detected_at")[:5]
        
        recent_recs = Recommendation.objects.filter(
            bot_id=bot_id
        ).order_by("-created_at")[:3]
        
        brief = {
            "date": timezone.now().date().isoformat(),
            "summary": "Here is your executive daily briefing.",
            "insights": insights,
            "focus_areas": [
                {
                    "title": a.category, 
                    "detail": a.description, 
                    "priority": a.severity
                } for a in active_anomalies
            ],
            "strategic_advice": [
                {
                    "title": r.title,
                    "detail": r.detail
                } for r in recent_recs
            ]
        }
        return brief
        
    except Exception as e:
        logger.error(f"Error generating morning brief: {e}")
        return {"error": "Failed to generate briefing."}
