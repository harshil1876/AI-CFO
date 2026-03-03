"""
Prescriptive Logic Rules Engine
Analyzes KPI snapshots and anomaly logs to generate actionable recommendations.
Runs per bot_id to maintain multi-tenant isolation.
"""
import logging
from decimal import Decimal
from api.models import KPISnapshot, AnomalyLog, DepartmentData, Recommendation

logger = logging.getLogger(__name__)


def generate_recommendations(bot_id: str, period: str) -> list:
    """
    Generate prescriptive recommendations based on KPIs and anomalies.

    Args:
        bot_id: The unique identifier for the company's bot instance.
        period: The month-year string, e.g. "2026-03".

    Returns:
        A list of recommendation dictionaries.
    """
    results = []

    # Fetch latest KPI snapshot
    try:
        kpi = KPISnapshot.objects.filter(bot_id=bot_id, period=period).latest("created_at")
    except KPISnapshot.DoesNotExist:
        logger.warning(f"No KPI snapshot found for bot={bot_id}, period={period}")
        return results

    # ---- Rule 1: Low Profit Margin Alert ----
    if kpi.profit_margin < Decimal("10"):
        rec = Recommendation.objects.create(
            bot_id=bot_id,
            title="Critical: Profit Margin Below 10%",
            detail=(
                f"Your profit margin for {period} is {kpi.profit_margin}%. "
                f"This is dangerously low. Consider reducing operational costs "
                f"or reviewing pricing strategy immediately."
            ),
            priority="action",
            related_kpi="profit_margin",
        )
        results.append(_to_dict(rec))

    elif kpi.profit_margin < Decimal("20"):
        rec = Recommendation.objects.create(
            bot_id=bot_id,
            title="Warning: Profit Margin Below 20%",
            detail=(
                f"Your profit margin for {period} is {kpi.profit_margin}%. "
                f"While not critical, this trend should be monitored. "
                f"Review expense categories for potential savings."
            ),
            priority="warning",
            related_kpi="profit_margin",
        )
        results.append(_to_dict(rec))

    # ---- Rule 2: High Burn Rate / Low Runway ----
    if kpi.runway_months < Decimal("3") and kpi.burn_rate > 0:
        rec = Recommendation.objects.create(
            bot_id=bot_id,
            title="Critical: Cash Runway Under 3 Months",
            detail=(
                f"At the current burn rate of ${kpi.burn_rate}/month, "
                f"your estimated runway is {kpi.runway_months} months. "
                f"Immediate action is required: reduce spending or secure funding."
            ),
            priority="action",
            related_kpi="runway_months",
        )
        results.append(_to_dict(rec))

    # ---- Rule 3: Expenses Exceeding Revenue ----
    if kpi.total_expenses > kpi.total_revenue and kpi.total_revenue > 0:
        rec = Recommendation.objects.create(
            bot_id=bot_id,
            title="Warning: Expenses Exceed Revenue",
            detail=(
                f"Total expenses (${kpi.total_expenses}) exceeded revenue "
                f"(${kpi.total_revenue}) in {period}. Net loss: ${abs(kpi.net_profit)}. "
                f"Review your largest expense categories."
            ),
            priority="warning",
            related_kpi="net_profit",
        )
        results.append(_to_dict(rec))

    # ---- Rule 4: Department Budget Overruns ----
    departments = DepartmentData.objects.filter(bot_id=bot_id, month_year=period)
    for dept in departments:
        if dept.actual_spend > dept.budget:
            overrun_pct = round(
                (dept.actual_spend - dept.budget) / dept.budget * 100, 1
            ) if dept.budget > 0 else Decimal("0")

            rec = Recommendation.objects.create(
                bot_id=bot_id,
                title=f"Budget Overrun: {dept.department_name}",
                detail=(
                    f"{dept.department_name} exceeded its budget by {overrun_pct}% in {period}. "
                    f"Budget: ${dept.budget}, Actual: ${dept.actual_spend}."
                ),
                priority="warning" if overrun_pct < 20 else "action",
                related_kpi="department_budget",
            )
            results.append(_to_dict(rec))

    # ---- Rule 5: Unresolved Critical Anomalies ----
    critical_anomalies = AnomalyLog.objects.filter(
        bot_id=bot_id,
        severity__in=["high", "critical"],
        is_resolved=False,
    ).count()

    if critical_anomalies > 0:
        rec = Recommendation.objects.create(
            bot_id=bot_id,
            title=f"Alert: {critical_anomalies} Unresolved Critical Anomalies",
            detail=(
                f"There are {critical_anomalies} unresolved high/critical anomalies "
                f"that require immediate review. These may indicate fraud, "
                f"data entry errors, or unusual financial activity."
            ),
            priority="action",
            related_kpi="anomalies",
        )
        results.append(_to_dict(rec))

    logger.info(f"Prescriptive logic generated {len(results)} recommendations for bot={bot_id}")
    return results


def _to_dict(rec: Recommendation) -> dict:
    return {
        "id": rec.id,
        "title": rec.title,
        "detail": rec.detail,
        "priority": rec.priority,
        "related_kpi": rec.related_kpi,
    }
