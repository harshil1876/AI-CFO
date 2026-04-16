from rest_framework import serializers
from .models import (
    UploadedFile, ParsedRecord,
    Transaction, DepartmentData,
    KPISnapshot, ForecastResult, AnomalyLog, Recommendation, Budget,
    PurchaseOrder, Invoice,
    Workspace, GoalTarget, OrgChatMessage, NLQueryHistory
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
    class Meta:
        model = Invoice
        fields = '__all__'


class WorkspaceSerializer(serializers.ModelSerializer):
    secure_key = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Workspace
        fields = [
            'id', 'org_id', 'name', 'entity_type', 'description',
            'currency', 'region', 'status', 'secure_key', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        import hashlib, secrets
        raw_key = validated_data.get('secure_key', '') or secrets.token_hex(16)
        validated_data['secure_key'] = hashlib.sha256(raw_key.encode()).hexdigest()
        return super().create(validated_data)



class GoalTargetSerializer(serializers.ModelSerializer):
    class Meta:
        model = GoalTarget
        fields = '__all__'


class OrgChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrgChatMessage
        fields = '__all__'


class NLQueryHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = NLQueryHistory
        fields = '__all__'
