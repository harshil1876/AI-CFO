from rest_framework import serializers
from .models import (
    UploadedFile, ParsedRecord,
    Transaction, DepartmentData,
    KPISnapshot, ForecastResult, AnomalyLog, Recommendation, Budget,
    PurchaseOrder, Invoice
)


class UploadedFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedFile
        fields = '__all__'


class ParsedRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParsedRecord
        fields = '__all__'


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'


class DepartmentDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = DepartmentData
        fields = '__all__'


class KPISnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = KPISnapshot
        fields = '__all__'


class ForecastResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = ForecastResult
        fields = '__all__'


class AnomalyLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnomalyLog
        fields = '__all__'


class RecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recommendation
        fields = '__all__'

class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = '__all__'

class PurchaseOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseOrder
        fields = '__all__'

class InvoiceSerializer(serializers.ModelSerializer):
    # If we want to nest PO data in GET requests, we can do it here later.
    class Meta:
        model = Invoice
        fields = '__all__'
