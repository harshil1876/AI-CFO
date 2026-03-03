"""
Descriptive Analytics Service
Calculates KPI metrics from raw transaction and department data.
Runs per bot_id to maintain multi-tenant isolation.
"""
import logging
from decimal import Decimal
from django.db.models import Sum, Q
from api.models import Transaction, DepartmentData, KPISnapshot

logger = logging.getLogger(__name__)


def calculate_kpis(bot_id: str, period: str) -> dict:
    """
    Calculate descriptive KPIs for a given bot and period.
    
    Args:
        bot_id: The unique identifier for the company's bot instance.
        period: The month-year string, e.g. "2026-03".
    
    Returns:
        A dictionary of computed KPI values.
    """
    # Fetch all transactions for this bot in the given period
    transactions = Transaction.objects.filter(
        bot_id=bot_id,
        date__year=int(period.split("-")[0]),
        date__month=int(period.split("-")[1]),
    )

    # Revenue = positive amounts (income categories)
    revenue = transactions.filter(
        amount__gt=0
    ).aggregate(total=Sum("amount"))["total"] or Decimal("0")

    # Expenses = negative amounts (absolute value)
    expenses = abs(
        transactions.filter(
            amount__lt=0
        ).aggregate(total=Sum("amount"))["total"] or Decimal("0")
    )

    net_profit = revenue - expenses
    profit_margin = (net_profit / revenue * 100) if revenue > 0 else Decimal("0")

    # Burn Rate = average monthly expenses
    burn_rate = expenses  # For a single month, burn rate = expenses

    # Runway = how many months of cash remaining (simplified)
    # Assuming current cash = net_profit (can be extended with balance data)
    runway_months = Decimal("0")
    if burn_rate > 0:
        runway_months = max(net_profit / burn_rate, Decimal("0"))

    # Department budget utilization
    departments = DepartmentData.objects.filter(
        bot_id=bot_id,
        month_year=period,
    )
    total_budget = departments.aggregate(total=Sum("budget"))["total"] or Decimal("0")
    total_spend = departments.aggregate(total=Sum("actual_spend"))["total"] or Decimal("0")

    # Store KPI Snapshot
    snapshot, created = KPISnapshot.objects.update_or_create(
        bot_id=bot_id,
        period=period,
        defaults={
            "total_revenue": revenue,
            "total_expenses": expenses,
            "net_profit": net_profit,
            "profit_margin": round(profit_margin, 2),
            "burn_rate": burn_rate,
            "runway_months": round(runway_months, 1),
        },
    )

    logger.info(f"KPIs calculated for bot={bot_id}, period={period}, created={created}")

    return {
        "bot_id": bot_id,
        "period": period,
        "total_revenue": float(revenue),
        "total_expenses": float(expenses),
        "net_profit": float(net_profit),
        "profit_margin": float(round(profit_margin, 2)),
        "burn_rate": float(burn_rate),
        "runway_months": float(round(runway_months, 1)),
        "total_department_budget": float(total_budget),
        "total_department_spend": float(total_spend),
    }
