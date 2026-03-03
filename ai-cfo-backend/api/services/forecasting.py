"""
Predictive Forecasting Service
Uses Facebook Prophet to forecast future revenue and expenses.
Runs per bot_id to maintain multi-tenant isolation.
"""
import logging
from decimal import Decimal
from datetime import datetime, timedelta
import pandas as pd
from prophet import Prophet
from api.models import Transaction, ForecastResult

logger = logging.getLogger(__name__)


def run_revenue_forecast(bot_id: str, periods: int = 6) -> list:
    """
    Generate a revenue forecast for the next N months using Prophet.

    Args:
        bot_id: The unique identifier for the company's bot instance.
        periods: Number of months to forecast into the future (default 6).

    Returns:
        A list of forecast dictionaries with date, predicted value, and bounds.
    """
    # Fetch historical transaction data (revenue = positive amounts)
    transactions = Transaction.objects.filter(
        bot_id=bot_id,
        amount__gt=0,
    ).values("date", "amount")

    if not transactions.exists():
        logger.warning(f"No revenue transactions found for bot={bot_id}")
        return []

    # Prepare DataFrame for Prophet (requires columns 'ds' and 'y')
    data = []
    for t in transactions:
        data.append({"ds": t["date"], "y": float(t["amount"])})

    df = pd.DataFrame(data)

    # Aggregate by month (Prophet works best with regular intervals)
    df["ds"] = pd.to_datetime(df["ds"])
    df = df.set_index("ds").resample("MS").sum().reset_index()

    if len(df) < 3:
        logger.warning(f"Insufficient data points for forecasting (bot={bot_id}, rows={len(df)})")
        return []

    # Train Prophet model
    model = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=False,
        daily_seasonality=False,
        changepoint_prior_scale=0.05,
    )
    model.fit(df)

    # Generate future dates
    future = model.make_future_dataframe(periods=periods, freq="MS")
    forecast = model.predict(future)

    # Extract only the forecasted future periods
    future_forecast = forecast[forecast["ds"] > df["ds"].max()]

    results = []
    for _, row in future_forecast.iterrows():
        forecast_entry = ForecastResult.objects.create(
            bot_id=bot_id,
            forecast_date=row["ds"].date(),
            predicted_revenue=Decimal(str(round(max(row["yhat"], 0), 2))),
            lower_bound=Decimal(str(round(max(row["yhat_lower"], 0), 2))),
            upper_bound=Decimal(str(round(max(row["yhat_upper"], 0), 2))),
        )

        results.append({
            "forecast_date": str(row["ds"].date()),
            "predicted_revenue": float(forecast_entry.predicted_revenue),
            "lower_bound": float(forecast_entry.lower_bound),
            "upper_bound": float(forecast_entry.upper_bound),
        })

    logger.info(f"Revenue forecast generated for bot={bot_id}, periods={periods}")
    return results
