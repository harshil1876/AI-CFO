from rest_framework import generics, status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from .models import (
    UploadedFile, ParsedRecord,
    Transaction, DepartmentData,
    KPISnapshot, ForecastResult, AnomalyLog, Recommendation,
    DataSource, ConnectorSyncLog, Budget, PurchaseOrder, Invoice, NotificationMeta
)
from django.utils import timezone
from .serializers import (
    UploadedFileSerializer, ParsedRecordSerializer,
    TransactionSerializer, DepartmentDataSerializer,
    KPISnapshotSerializer, ForecastResultSerializer,
    AnomalyLogSerializer, RecommendationSerializer, BudgetSerializer,
    PurchaseOrderSerializer, InvoiceSerializer
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
from .services.budgeting_engine import calculate_variance, run_monte_carlo_simulation
import pandas as pd


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


# ──────────────────────────────────────────────────────────────
# Sprint 6: Data Integration Layer (Connectors)
# ──────────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
def data_sources(request):
    """
    GET  /api/connectors/          — list all data sources for a bot_id
    POST /api/connectors/          — register a new data source connection
    """
    bot_id = request.query_params.get('bot_id') or request.data.get('bot_id')
    if not bot_id:
        return Response({'error': 'bot_id is required'}, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'GET':
        sources = DataSource.objects.filter(bot_id=bot_id).values(
            'id', 'source_type', 'display_name', 'status', 'last_synced_at', 'created_at'
        )
        return Response(list(sources))

    # POST: create a new connector entry
    source_type = request.data.get('source_type')
    display_name = request.data.get('display_name', source_type)
    config = request.data.get('config', {})

    VALID_TYPES = ['tally', 'razorpay', 'google_sheets', 'zoho']
    if source_type not in VALID_TYPES:
        return Response(
            {'error': f'Invalid source_type. Choose from: {VALID_TYPES}'},
            status=status.HTTP_400_BAD_REQUEST
        )

    ds = DataSource.objects.create(
        bot_id=bot_id,
        source_type=source_type,
        display_name=display_name,
        config=config,
    )
    return Response({
        'id': ds.id,
        'source_type': ds.source_type,
        'display_name': ds.display_name,
        'status': ds.status,
        'message': 'Data source registered successfully.',
    }, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
def delete_data_source(request, source_id):
    """DELETE /api/connectors/<id>/ — remove a registered connector."""
    bot_id = request.query_params.get('bot_id') or request.data.get('bot_id')
    try:
        ds = DataSource.objects.get(id=source_id, bot_id=bot_id)
        ds.delete()
        return Response({'message': 'Connector deleted.'}, status=status.HTTP_200_OK)
    except DataSource.DoesNotExist:
        return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
def trigger_sync(request, source_id):
    """
    POST /api/connectors/<id>/sync/ — manually trigger a data sync for a connector.
    Imports transactions from the external source into our database.
    """
    from .connectors import get_connector

    bot_id = request.data.get('bot_id') or request.query_params.get('bot_id')
    try:
        ds = DataSource.objects.get(id=source_id, bot_id=bot_id)
    except DataSource.DoesNotExist:
        return Response({'error': 'Data source not found.'}, status=status.HTTP_404_NOT_FOUND)

    try:
        connector = get_connector(ds)
        log = connector.sync()
        return Response({
            'status': log.status,
            'records_fetched': log.records_fetched,
            'records_inserted': log.records_inserted,
            'currency': log.currency_used,
            'exchange_rate': str(log.exchange_rate),
            'error': log.error_message,
            'synced_at': log.synced_at.isoformat(),
        })
    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': f'Sync failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ──────────────────────────────────────────────────────────────
# Sprint 7: Advanced Budgeting & Forecasting
# ──────────────────────────────────────────────────────────────

class BudgetListCreateView(generics.ListCreateAPIView):
    """
    GET /api/budgets/ - List active budgets for bot
    POST /api/budgets/ - Create or update a budget (upsert logic to handle versions)
    """
    serializer_class = BudgetSerializer

    def get_queryset(self):
        bot_id = self.request.query_params.get('bot_id')
        month = self.request.query_params.get('month_year')
        qs = Budget.objects.filter(is_active=True)
        if bot_id:
            qs = qs.filter(bot_id=bot_id)
        if month:
            qs = qs.filter(month_year=month)
        return qs.order_by('month_year', 'category')

    def create(self, request, *args, **kwargs):
        # We want to do "upsert": if a budget for this bot, category, month exists, 
        # deactivate it and create a v+1
        bot_id = request.data.get('bot_id')
        category = request.data.get('category')
        month_year = request.data.get('month_year')
        allocated_amount = request.data.get('allocated_amount')

        if not all([bot_id, category, month_year, allocated_amount is not None]):
            return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

        # Find existing active budget
        existing = Budget.objects.filter(bot_id=bot_id, category=category, month_year=month_year, is_active=True).first()
        version = 1
        if existing:
            version = existing.version + 1
            existing.is_active = False
            existing.save()
            
        new_budget = Budget.objects.create(
            bot_id=bot_id,
            category=category,
            month_year=month_year,
            allocated_amount=allocated_amount,
            version=version,
            is_active=True
        )
        
        return Response(BudgetSerializer(new_budget).data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def upload_budget(request):
    """
    POST /api/budgets/upload/
    Uploads an Excel file containing headers: [category, allocated_amount, month_year]
    """
    bot_id = request.data.get('bot_id')
    file_obj = request.FILES.get('file')

    if not bot_id or not file_obj:
        return Response({"error": "bot_id and file are required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        df = pd.read_excel(file_obj)
        # Process expected columns
        required_cols = {'category', 'allocated_amount', 'month_year'}
        if not required_cols.issubset(set(df.columns)):
            return Response({"error": f"Excel file must contain columns: {required_cols}"}, status=status.HTTP_400_BAD_REQUEST)

        created_count = 0
        for _, row in df.iterrows():
            category = str(row['category']).strip()
            amount = float(row['allocated_amount'])
            month = str(row['month_year']).strip()

            existing = Budget.objects.filter(bot_id=bot_id, category=category, month_year=month, is_active=True).first()
            version = 1
            if existing:
                version = existing.version + 1
                existing.is_active = False
                existing.save()
                
            Budget.objects.create(
                bot_id=bot_id,
                category=category,
                month_year=month,
                allocated_amount=amount,
                version=version,
                is_active=True
            )
            created_count += 1

        return Response({"message": f"Successfully parsed and saved {created_count} budget entries."}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def variance_analysis(request):
    """
    GET /api/budgets/variance/?bot_id=xyz&month_year=2026-03
    """
    bot_id = request.query_params.get('bot_id')
    month = request.query_params.get('month_year')
    if not bot_id or not month:
        return Response({"error": "bot_id and month_year required"}, status=status.HTTP_400_BAD_REQUEST)

    result = calculate_variance(bot_id, month)
    if "error" in result:
        return Response(result, status=status.HTTP_200_OK)
        
    return Response(result)

@api_view(['GET'])
def monte_carlo_simulation(request):
    """
    GET /api/forecast/monte-carlo/?bot_id=xyz
    """
    bot_id = request.query_params.get('bot_id')
    if not bot_id:
        return Response({"error": "bot_id is required"}, status=status.HTTP_400_BAD_REQUEST)

    result = run_monte_carlo_simulation(bot_id)
    if "error" in result:
        return Response(result, status=status.HTTP_200_OK)
        
    return Response(result)

# ──────────────────────────────────────────────────────────────
# Sprint 8: Invoice & AP Automation
# ──────────────────────────────────────────────────────────────

class PurchaseOrderListCreateView(generics.ListCreateAPIView):
    """
    GET /api/purchase-orders/?bot_id=123
    POST /api/purchase-orders/
    """
    serializer_class = PurchaseOrderSerializer

    def get_queryset(self):
        bot_id = self.request.query_params.get('bot_id')
        qs = PurchaseOrder.objects.all()
        if bot_id:
            qs = qs.filter(bot_id=bot_id)
        return qs.order_by('-created_at')

class InvoiceListView(generics.ListAPIView):
    """
    GET /api/invoices/?bot_id=123
    """
    serializer_class = InvoiceSerializer

    def get_queryset(self):
        bot_id = self.request.query_params.get('bot_id')
        qs = Invoice.objects.all()
        if bot_id:
            qs = qs.filter(bot_id=bot_id)
        return qs.order_by('-uploaded_at')

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def upload_invoice(request):
    """
    POST /api/invoices/upload/
    Uploads an image or PDF of an invoice for Gemini Vision extraction and fraud reasoning.
    """
    from .services.invoice_processor import process_invoice_document
    import os

    bot_id = request.data.get('bot_id')
    file_obj = request.FILES.get('file')

    if not bot_id or not file_obj:
        return Response({"error": "bot_id and file are required"}, status=status.HTTP_400_BAD_REQUEST)

    # Save temp file
    upload_dir = os.path.join('media', 'invoices')
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, file_obj.name)
    
    with open(file_path, 'wb+') as destination:
        for chunk in file_obj.chunks():
            destination.write(chunk)

    # Convert to bytes for Gemini
    with open(file_path, 'rb') as f:
        file_bytes = f.read()
    
    mime_type = "application/pdf" if file_obj.name.endswith('.pdf') else "image/jpeg"
    if file_obj.name.endswith('.png'):
        mime_type = "image/png"

    # Send to multimodal AI
    result = process_invoice_document(bot_id, file_path, mime_type, file_bytes)
    
    if "error" in result:
        return Response(result, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response(result, status=status.HTTP_201_CREATED)

@api_view(['PATCH'])
def update_invoice_status(request, invoice_id):
    """
    PATCH /api/invoices/<id>/status/
    Updates the status of an Invoice (e.g., Pending -> Approved or Rejected).
    """
    try:
        invoice = Invoice.objects.get(id=invoice_id)
        
        # Verify Bot ID Authorization
        bot_id = request.data.get('bot_id') or request.query_params.get('bot_id')
        if not bot_id or invoice.bot_id != bot_id:
            return Response({'error': 'Unauthorized Workspace'}, status=status.HTTP_403_FORBIDDEN)

        new_status = request.data.get('status')
        if new_status not in ['pending_approval', 'approved', 'rejected', 'paid']:
            return Response({'error': 'Invalid status provided.'}, status=status.HTTP_400_BAD_REQUEST)

        invoice.status = new_status
        invoice.save()
        
        return Response({'success': True, 'status': invoice.status})
        
    except Invoice.DoesNotExist:
        return Response({'error': 'Invoice not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error updating invoice: {str(e)}")
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
@api_view(['GET'])
def notifications_count(request):
    """
    GET /api/notifications/count/?bot_id=123
    Returns the number of unseen announcements since last_seen_at.
    """
    bot_id = request.query_params.get('bot_id')
    if not bot_id:
        return Response({'error': 'bot_id is required'}, status=status.HTTP_400_BAD_REQUEST)

    meta, _ = NotificationMeta.objects.get_or_create(bot_id=bot_id)
    last_seen = meta.last_seen_at

    # Count how many of each notification type were created after 'last_seen'
    unseen_anomalies = AnomalyLog.objects.filter(bot_id=bot_id, detected_at__gt=last_seen).count()
    unseen_recs = Recommendation.objects.filter(bot_id=bot_id, created_at__gt=last_seen).count()
    unseen_uploads = UploadedFile.objects.filter(bot_id=bot_id, uploaded_at__gt=last_seen).count()

    total_unseen = unseen_anomalies + unseen_recs + unseen_uploads

    return Response({'count': total_unseen})


@api_view(['GET'])
def notifications_list(request):
    """
    GET /api/notifications/?bot_id=123
    Aggregates news from Anomalies, Recommendations, and File Uploads.
    Also updates last_seen_at for the bot_id.
    """
    bot_id = request.query_params.get('bot_id')
    if not bot_id:
        return Response({'error': 'bot_id is required'}, status=status.HTTP_400_BAD_REQUEST)

    # Mark as seen
    meta, _ = NotificationMeta.objects.get_or_create(bot_id=bot_id)
    meta.last_seen_at = timezone.now()
    meta.save()

    # 1. Fetch Anomalies
    anomalies = AnomalyLog.objects.filter(bot_id=bot_id).order_by('-detected_at')[:10]
    
    # 2. Fetch Recommendations
    recommendations = Recommendation.objects.filter(bot_id=bot_id).order_by('-created_at')[:10]

    # 3. Fetch Recent Uploads
    uploads = UploadedFile.objects.filter(bot_id=bot_id).order_by('-uploaded_at')[:10]

    # Format into a unified structure
    unified = []

    for a in anomalies:
        unified.append({
            'id': f"anomaly_{a.id}",
            'title': f"{a.severity.upper()} Spend Alert: {a.category}",
            'description': a.description,
            'time': a.detected_at.isoformat(),
            'type': 'fraud' if a.severity in ['high', 'critical'] else 'warning',
        })

    for r in recommendations:
        unified.append({
            'id': f"rec_{r.id}",
            'title': f"AI CFO Advice: {r.title}",
            'description': r.detail,
            'time': r.created_at.isoformat(),
            'type': 'info' if r.priority == 'info' else 'action',
        })

    for u in uploads:
        unified.append({
            'id': f"upload_{u.id}",
            'title': f"File Processed: {u.original_filename}",
            'description': f"Successfully parsed {u.row_count} records." if u.status == 'completed' else f"Failed: {u.error_message}",
            'time': u.uploaded_at.isoformat(),
            'type': 'success' if u.status == 'completed' else 'error',
        })

    # Sort descending by time
    unified.sort(key=lambda x: x['time'], reverse=True)

    return Response(unified[:20])
