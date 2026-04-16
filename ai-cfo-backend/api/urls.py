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
    PurchaseOrderListCreateView, InvoiceListView, upload_invoice, update_invoice_status,
    # New: Unified Notifications
    notifications_list, notifications_count,
    # Sprint 10: Dynamic Reporting
    report_pnl, report_cashflow, report_balancesheet, report_export_excel,
    get_team_permissions, update_team_permission,
    # Sprint 11: Phase 2 & 3
    update_anomaly_status, anomaly_comments,
    audit_trail, audit_export_csv,
    daily_briefing,
    WorkspaceListCreateView, WorkspaceRetrieveUpdateDestroyView,
    GoalTargetListCreateView, OrgChatMessageListCreateView,
    workspace_set_status,
    # Sprint 17: New endpoints
    update_transaction_status, usage_metrics,
    # Sprint 18: Invoice Workspace & Email Ingestion
    invoice_threads, mailgun_inbound_webhook, email_inbox_logs,
    # Sprint 18 Part B: Proactive Generative Layer
    nl_query, generate_budget, custom_kpis, evaluate_custom_kpi, delete_custom_kpi,
    NLQueryHistoryListCreateView,
)
from .v1_views import ingest_transactions, fetch_kpis

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
    # New: Unified Notifications
    path('notifications/', notifications_list, name='notifications-list'),
    path('notifications/count/', notifications_count, name='notifications-count'),
    path('briefing/', daily_briefing, name='daily-briefing'),

    # Sprint 10: Dynamic Reporting
    path('reports/pnl/', report_pnl, name='report-pnl'),
    path('reports/cashflow/', report_cashflow, name='report-cashflow'),
    path('reports/balancesheet/', report_balancesheet, name='report-balancesheet'),
    path('reports/export/', report_export_excel, name='report_export_excel'),
    
    # Sprint 11: Enterprise RBAC
    path('team/permissions/', get_team_permissions, name='get_team_permissions'),
    path('team/permissions/update/', update_team_permission, name='update_team_permission'),

    # Sprint 11: Phase 2 — Collaborative Anomaly Workflows
    path('anomalies/<int:anomaly_id>/status/', update_anomaly_status, name='anomaly-status-update'),
    path('anomalies/<int:anomaly_id>/comments/', anomaly_comments, name='anomaly-comments'),

    # Sprint 11: Phase 3 — Immutable Audit Trail
    path('audit/', audit_trail, name='audit-trail'),
    path('audit/export/', audit_export_csv, name='audit-export-csv'),

    # Sprint 15 / 16: Workspaces, Setting Goals, Org Chat, and Lifecycle
    path('workspaces/', WorkspaceListCreateView.as_view(), name='workspace-list'),
    path('workspaces/<int:pk>/', WorkspaceRetrieveUpdateDestroyView.as_view(), name='workspace-detail'),
    path('workspaces/<int:pk>/status/', workspace_set_status, name='workspace-set-status'),
    path('goals/', GoalTargetListCreateView.as_view(), name='goaltarget-list'),
    path('org-chat/', OrgChatMessageListCreateView.as_view(), name='orgchatmessage-list'),

    # Sprint 17: Transaction Review & Usage Metrics
    path('transactions/<int:transaction_id>/status/', update_transaction_status, name='transaction-status-update'),
    path('usage/', usage_metrics, name='usage-metrics'),

    # Sprint 17 Extended: Developer API Platform
    path('v1/transactions/', ingest_transactions, name='v1-ingest-transactions'),
    path('v1/kpis/', fetch_kpis, name='v1-fetch-kpis'),

    # Sprint 18: Invoice Workspace Threads
    path('invoices/<int:invoice_id>/threads/', invoice_threads, name='invoice-threads'),

    # Sprint 18: VicInbox — Mailgun Email Webhook
    path('ap/webhooks/mailgun-inbound/', mailgun_inbound_webhook, name='mailgun-inbound-webhook'),

    # Sprint 18: Email Inbox Processing Log
    path('ap/email-logs/', email_inbox_logs, name='email-inbox-logs'),

    # Sprint 18 Part B: Ad-Hoc Data Query Agent (NL2SQL)
    path('query/', nl_query, name='nl-query'),
    path('query-history/', NLQueryHistoryListCreateView.as_view(), name='nl-query-history'),

    # Sprint 18 Part B: Generative Budget Planner
    path('budget/generate/', generate_budget, name='budget-generate'),

    # Sprint 18 Part B: Custom KPI Builder
    path('kpi-builder/', custom_kpis, name='custom-kpis'),
    path('kpi-builder/<int:kpi_id>/evaluate/', evaluate_custom_kpi, name='evaluate-custom-kpi'),
    path('kpi-builder/<int:kpi_id>/', delete_custom_kpi, name='delete-custom-kpi'),
]
