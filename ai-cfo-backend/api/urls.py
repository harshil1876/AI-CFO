from django.urls import path
from .views import TransactionListCreateView, DepartmentDataListCreateView

urlpatterns = [
    path('transactions/', TransactionListCreateView.as_view(), name='transaction-list-create'),
    path('department-data/', DepartmentDataListCreateView.as_view(), name='department-data-list-create'),
]
