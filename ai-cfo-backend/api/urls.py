from django.urls import path
from .views import (
    upload_file, UploadedFileListView, ParsedRecordListView,
    TransactionListCreateView, DepartmentDataListCreateView,
    KPISnapshotListView, ForecastResultListView,
    AnomalyLogListView, RecommendationListView,
    run_analytics, run_forecast,
    chat, sync_rag,
    simulate, send_alerts,
    # Sprint 6: Data Integration Connectors
    data_sources, delete_data_source, trigger_sync,
    # Sprint 7: Budgeting & Forecasting
    BudgetListCreateView, upload_budget, variance_analysis, monte_carlo_simulation,
    # Sprint 8: Invoice & AP Automation
    PurchaseOrderListCreateView, InvoiceListView, upload_invoice, update_invoice_status
)

urlpatterns = [
    # Sprint 1: Flexible File Upload
    path('upload/', upload_file, name='upload-file'),
    path('files/', UploadedFileListView.as_view(), name='uploaded-files-list'),
    path('records/', ParsedRecordListView.as_view(), name='parsed-records-list'),

    # Sprint 1: Legacy Structured Ingestion
    path('transactions/', TransactionListCreateView.as_view(), name='transaction-list-create'),
    path('department-data/', DepartmentDataListCreateView.as_view(), name='department-data-list-create'),

    # Sprint 2: Intelligence Engine (Triggers)
    path('analytics/run/', run_analytics, name='run-analytics'),
    path('forecast/run/', run_forecast, name='run-forecast'),

    # Sprint 2: Intelligence Engine (Read-only Results)
    path('kpis/', KPISnapshotListView.as_view(), name='kpi-list'),
    path('forecasts/', ForecastResultListView.as_view(), name='forecast-list'),
    path('anomalies/', AnomalyLogListView.as_view(), name='anomaly-list'),
    path('recommendations/', RecommendationListView.as_view(), name='recommendation-list'),

    # Sprint 3: Conversational CFO & RAG
    path('chat/<str:bot_id>/', chat, name='chat'),
    path('rag/sync/', sync_rag, name='rag-sync'),

    # Sprint 4: Simulation & Alerts
    path('simulate/', simulate, name='simulate'),
    path('alerts/send/', send_alerts, name='send-alerts'),

    # Sprint 6: Data Integration Connectors
    path('connectors/', data_sources, name='connector-list-create'),
    path('connectors/<int:source_id>/', delete_data_source, name='connector-delete'),
    path('connectors/<int:source_id>/sync/', trigger_sync, name='connector-sync'),

    # Sprint 7: Advanced Budgeting & Forecasting
    path('budgets/', BudgetListCreateView.as_view(), name='budget-list-create'),
    path('budgets/upload/', upload_budget, name='budget-upload'),
    path('budgets/variance/', variance_analysis, name='budget-variance'),
    path('forecast/monte-carlo/', monte_carlo_simulation, name='monte-carlo-simulation'),

    # Sprint 8: Invoice & AP Automation
    path('purchase-orders/', PurchaseOrderListCreateView.as_view(), name='purchase-order-list-create'),
    path('invoices/', InvoiceListView.as_view(), name='invoice-list'),
    path('invoices/upload/', upload_invoice, name='invoice-upload'),
    path('invoices/<int:invoice_id>/status/', update_invoice_status, name='update-invoice-status'),
]
