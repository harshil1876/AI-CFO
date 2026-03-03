from rest_framework import serializers
from .models import (
    Transaction, DepartmentData,
    KPISnapshot, ForecastResult, AnomalyLog, Recommendation,
)


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
