from rest_framework import generics, status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from .models import (
    UploadedFile, ParsedRecord,
    Transaction, DepartmentData,
    KPISnapshot, ForecastResult, AnomalyLog, Recommendation,
)
from .serializers import (
    UploadedFileSerializer, ParsedRecordSerializer,
    TransactionSerializer, DepartmentDataSerializer,
    KPISnapshotSerializer, ForecastResultSerializer,
    AnomalyLogSerializer, RecommendationSerializer,
)
from .services.descriptive_analytics import calculate_kpis
from .services.forecasting import run_revenue_forecast
from .services.anomaly_detection import detect_anomalies
from .services.prescriptive_logic import generate_recommendations
from .services.file_processor import save_uploaded_file, process_file
from .services.rag_engine import sync_financial_context_to_rag
from .services.chat_service import chat_with_cfo
from .services.simulation_engine import run_simulation
from .services.alert_service import check_and_send_alerts


# ──────────────────────────────────────────────
# Sprint 1: Flexible File Upload Endpoints
# ──────────────────────────────────────────────

@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def upload_file(request):
    """
    Upload any financial file (CSV, Excel, JSON, etc.)
    The system will auto-detect the schema and generate an AI summary.
    """
    bot_id = request.data.get("bot_id")
    file_obj = request.FILES.get("file")

    if not bot_id:
        return Response(
            {"error": "bot_id is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not file_obj:
        return Response(
            {"error": "No file provided. Use 'file' field in multipart form."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Save the file
    upload = save_uploaded_file(file_obj, bot_id)

    # Process the file (parse + AI analysis)
    result = process_file(upload.id)

    return Response(result, status=status.HTTP_201_CREATED if result["status"] == "completed" else status.HTTP_422_UNPROCESSABLE_ENTITY)


class UploadedFileListView(generics.ListAPIView):
    """List all uploaded files for a bot."""
    serializer_class = UploadedFileSerializer

    def get_queryset(self):
        bot_id = self.request.query_params.get("bot_id")
        if bot_id:
            return UploadedFile.objects.filter(bot_id=bot_id).order_by("-uploaded_at")
        return UploadedFile.objects.all().order_by("-uploaded_at")


class ParsedRecordListView(generics.ListAPIView):
    """List parsed records for a specific uploaded file."""
    serializer_class = ParsedRecordSerializer

    def get_queryset(self):
        file_id = self.request.query_params.get("file_id")
        bot_id = self.request.query_params.get("bot_id")
        qs = ParsedRecord.objects.all()
        if file_id:
            qs = qs.filter(source_file_id=file_id)
        if bot_id:
            qs = qs.filter(bot_id=bot_id)
        return qs.order_by("row_index")


# ──────────────────────────────────────────────
# Sprint 1: Legacy Structured Endpoints (kept for backward compat)
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


# ──────────────────────────────────────────────
# Sprint 3: Conversational CFO & RAG Endpoints
# ──────────────────────────────────────────────

@api_view(["POST"])
def chat(request, bot_id):
    """
    AI CFO Chat endpoint — the core conversational interface.
    Retrieves RAG context + live KPIs, then queries Gemini LLM.
    """
    message = request.data.get("message")
    chat_history = request.data.get("history", [])

    if not message:
        return Response(
            {"error": "message is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    result = chat_with_cfo(bot_id, message, chat_history)

    return Response(result)


@api_view(["POST"])
def sync_rag(request):
    """
    Trigger RAG sync: push latest financial intelligence to Upstash Search.
    Should be called after analytics pipeline completes.
    """
    bot_id = request.data.get("bot_id")

    if not bot_id:
        return Response(
            {"error": "bot_id is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    result = sync_financial_context_to_rag(bot_id)

    return Response({
        "status": "success",
        **result,
    })


# ──────────────────────────────────────────────
# Sprint 4: Simulation & Alert Endpoints
# ──────────────────────────────────────────────

@api_view(["POST"])
def simulate(request):
    """
    Run a what-if simulation on financial data.
    Accepts hypothetical changes and returns projected KPIs.
    """
    bot_id = request.data.get("bot_id")
    period = request.data.get("period")
    scenarios = request.data.get("scenarios", [])

    if not bot_id or not period:
        return Response(
            {"error": "bot_id and period are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not scenarios:
        return Response(
            {"error": "At least one scenario is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    result = run_simulation(bot_id, period, scenarios)

    if "error" in result:
        return Response(result, status=status.HTTP_404_NOT_FOUND)

    return Response({"status": "success", **result})


@api_view(["POST"])
def send_alerts(request):
    """Check for critical alerts and send notifications via configured channels."""
    bot_id = request.data.get("bot_id")

    if not bot_id:
        return Response(
            {"error": "bot_id is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    result = check_and_send_alerts(bot_id)

    return Response({"status": "success", **result})
