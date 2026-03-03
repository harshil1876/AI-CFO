from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import (
    Transaction, DepartmentData,
    KPISnapshot, ForecastResult, AnomalyLog, Recommendation,
)
from .serializers import (
    TransactionSerializer, DepartmentDataSerializer,
    KPISnapshotSerializer, ForecastResultSerializer,
    AnomalyLogSerializer, RecommendationSerializer,
)
from .services.descriptive_analytics import calculate_kpis
from .services.forecasting import run_revenue_forecast
from .services.anomaly_detection import detect_anomalies
from .services.prescriptive_logic import generate_recommendations


# ──────────────────────────────────────────────
# Sprint 1: Data Ingestion Endpoints
# ──────────────────────────────────────────────

class TransactionListCreateView(generics.ListCreateAPIView):
    serializer_class = TransactionSerializer

    def get_queryset(self):
        bot_id = self.request.query_params.get('bot_id')
        if bot_id:
            return Transaction.objects.filter(bot_id=bot_id)
        return Transaction.objects.all()


class DepartmentDataListCreateView(generics.ListCreateAPIView):
    serializer_class = DepartmentDataSerializer

    def get_queryset(self):
        bot_id = self.request.query_params.get('bot_id')
        if bot_id:
            return DepartmentData.objects.filter(bot_id=bot_id)
        return DepartmentData.objects.all()


# ──────────────────────────────────────────────
# Sprint 2: Intelligence Engine Endpoints
# ──────────────────────────────────────────────

@api_view(["POST"])
def run_analytics(request):
    """
    Trigger full analytics pipeline for a bot:
    1. Calculate KPIs
    2. Detect anomalies
    3. Generate prescriptive recommendations
    """
    bot_id = request.data.get("bot_id")
    period = request.data.get("period")

    if not bot_id or not period:
        return Response(
            {"error": "bot_id and period are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    kpis = calculate_kpis(bot_id, period)
    anomalies = detect_anomalies(bot_id)
    recommendations = generate_recommendations(bot_id, period)

    return Response({
        "status": "success",
        "kpis": kpis,
        "anomalies_found": len(anomalies),
        "anomalies": anomalies,
        "recommendations": recommendations,
    })


@api_view(["POST"])
def run_forecast(request):
    """Trigger Prophet revenue forecast for a bot."""
    bot_id = request.data.get("bot_id")
    periods = request.data.get("periods", 6)

    if not bot_id:
        return Response(
            {"error": "bot_id is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    forecasts = run_revenue_forecast(bot_id, periods=int(periods))

    return Response({
        "status": "success",
        "bot_id": bot_id,
        "forecast_months": len(forecasts),
        "forecasts": forecasts,
    })


# ──────────────────────────────────────────────
# Sprint 2: Read-only List Endpoints
# ──────────────────────────────────────────────

class KPISnapshotListView(generics.ListAPIView):
    serializer_class = KPISnapshotSerializer

    def get_queryset(self):
        bot_id = self.request.query_params.get("bot_id")
        if bot_id:
            return KPISnapshot.objects.filter(bot_id=bot_id).order_by("-created_at")
        return KPISnapshot.objects.all().order_by("-created_at")


class ForecastResultListView(generics.ListAPIView):
    serializer_class = ForecastResultSerializer

    def get_queryset(self):
        bot_id = self.request.query_params.get("bot_id")
        if bot_id:
            return ForecastResult.objects.filter(bot_id=bot_id).order_by("forecast_date")
        return ForecastResult.objects.all().order_by("forecast_date")


class AnomalyLogListView(generics.ListAPIView):
    serializer_class = AnomalyLogSerializer

    def get_queryset(self):
        bot_id = self.request.query_params.get("bot_id")
        if bot_id:
            return AnomalyLog.objects.filter(bot_id=bot_id).order_by("-detected_at")
        return AnomalyLog.objects.all().order_by("-detected_at")


class RecommendationListView(generics.ListAPIView):
    serializer_class = RecommendationSerializer

    def get_queryset(self):
        bot_id = self.request.query_params.get("bot_id")
        if bot_id:
            return Recommendation.objects.filter(bot_id=bot_id).order_by("-created_at")
        return Recommendation.objects.all().order_by("-created_at")
