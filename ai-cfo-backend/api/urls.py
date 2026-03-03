from django.urls import path
from .views import (
    TransactionListCreateView, DepartmentDataListCreateView,
    KPISnapshotListView, ForecastResultListView,
    AnomalyLogListView, RecommendationListView,
    run_analytics, run_forecast,
)

urlpatterns = [
    # Sprint 1: Data Ingestion
    path('transactions/', TransactionListCreateView.as_view(), name='transaction-list-create'),
    path('department-data/', DepartmentDataListCreateView.as_view(), name='department-data-list-create'),

    # Sprint 2: Intelligence Engine (Trigger Endpoints)
    path('analytics/run/', run_analytics, name='run-analytics'),
    path('forecast/run/', run_forecast, name='run-forecast'),

    # Sprint 2: Intelligence Engine (Read-only Results)
    path('kpis/', KPISnapshotListView.as_view(), name='kpi-list'),
    path('forecasts/', ForecastResultListView.as_view(), name='forecast-list'),
    path('anomalies/', AnomalyLogListView.as_view(), name='anomaly-list'),
    path('recommendations/', RecommendationListView.as_view(), name='recommendation-list'),
]
