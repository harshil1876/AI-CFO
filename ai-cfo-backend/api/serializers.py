from rest_framework import serializers
from .models import Transaction, DepartmentData

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'

class DepartmentDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = DepartmentData
        fields = '__all__'
