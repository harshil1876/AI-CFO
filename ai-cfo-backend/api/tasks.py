from celery import shared_task
from .models import Transaction, KPI, Anomaly
import pandas as pd
from django.db.models import Sum

@shared_task
def run_analytics_task(bot_id: str, period: str):
    """
    Celery background task to calculate KPIs and detect anomalies.
    Offloads heavy pandas calculations from the main Django thread.
    """
    transactions = Transaction.objects.filter(bot_id=bot_id, date__startswith=period)
    if not transactions.exists():
        return f"No transactions for {period}"

    df = pd.DataFrame(list(transactions.values()))
    
    # Calculate simple KPIs
    revenue = df[df['type'] == 'credit']['amount'].sum() or 0
    expenses = df[df['type'] == 'debit']['amount'].sum() or 0
    net_profit = revenue - expenses
    margin = (net_profit / revenue * 100) if revenue > 0 else 0

    KPI.objects.update_or_create(
        bot_id=bot_id, period=period,
        defaults={
            'total_revenue': revenue,
            'total_expenses': expenses,
            'net_profit': net_profit,
            'profit_margin': margin,
            'burn_rate': expenses,
            'runway_months': (50000 / expenses) if expenses > 0 else 12 # mock capital 50k
        }
    )

    return f"Analytics completed for {bot_id} - {period}. Net Profit: {net_profit}"

@shared_task
def generate_forecast_task(bot_id: str, months: int):
    """Placeholder for Prophet AI forecasting running async."""
    # Simulation of heavy ML task
    import time
    time.sleep(3)
    return f"Forecasted {months} months for {bot_id}"
