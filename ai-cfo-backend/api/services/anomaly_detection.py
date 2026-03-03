"""
Risk & Anomaly Detection Service
Uses Isolation Forest from scikit-learn to flag unusual transactions.
Runs per bot_id to maintain multi-tenant isolation.
"""
import logging
from decimal import Decimal
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from api.models import Transaction, AnomalyLog

logger = logging.getLogger(__name__)


def detect_anomalies(bot_id: str, contamination: float = 0.05) -> list:
    """
    Detect anomalous transactions using Isolation Forest.

    Args:
        bot_id: The unique identifier for the company's bot instance.
        contamination: Expected proportion of anomalies in the data (default 5%).

    Returns:
        A list of anomaly dictionaries with details about flagged transactions.
    """
    transactions = Transaction.objects.filter(bot_id=bot_id).values(
        "id", "date", "amount", "category", "description"
    )

    if not transactions.exists():
        logger.warning(f"No transactions found for anomaly detection (bot={bot_id})")
        return []

    df = pd.DataFrame(list(transactions))
    df["amount_float"] = df["amount"].astype(float).abs()

    if len(df) < 10:
        logger.warning(f"Too few transactions for anomaly detection (bot={bot_id}, count={len(df)})")
        return []

    # Prepare features for Isolation Forest
    features = df[["amount_float"]].copy()

    model = IsolationForest(
        contamination=contamination,
        random_state=42,
        n_estimators=100,
    )
    df["anomaly_score"] = model.fit_predict(features)
    # -1 = anomaly, 1 = normal
    anomalies = df[df["anomaly_score"] == -1]

    results = []
    for _, row in anomalies.iterrows():
        # Determine severity based on how far from the mean
        mean_amount = df["amount_float"].mean()
        std_amount = df["amount_float"].std()
        deviation = abs(row["amount_float"] - mean_amount)

        if std_amount > 0:
            z_score = deviation / std_amount
        else:
            z_score = 0

        if z_score > 3:
            severity = "critical"
        elif z_score > 2:
            severity = "high"
        elif z_score > 1:
            severity = "medium"
        else:
            severity = "low"

        description = (
            f"Unusual {row['category']} transaction of ${row['amount_float']:.2f} "
            f"detected on {row['date']}. "
            f"This deviates {z_score:.1f} standard deviations from the mean."
        )

        anomaly_log = AnomalyLog.objects.create(
            bot_id=bot_id,
            category=row["category"],
            description=description,
            severity=severity,
            amount=Decimal(str(round(row["amount_float"], 2))),
        )

        results.append({
            "id": anomaly_log.id,
            "category": row["category"],
            "amount": float(row["amount_float"]),
            "severity": severity,
            "description": description,
            "date": str(row["date"]),
        })

    logger.info(f"Anomaly detection complete for bot={bot_id}, found={len(results)} anomalies")
    return results
