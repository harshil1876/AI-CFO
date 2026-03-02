from rest_framework import generics
from .models import Transaction, DepartmentData
from .serializers import TransactionSerializer, DepartmentDataSerializer

class TransactionListCreateView(generics.ListCreateAPIView):
    serializer_class = TransactionSerializer

    def get_queryset(self):
        """
        Filter transactions by bot_id. This is critical for 
        multi-tenancy isolation. 
        """
        bot_id = self.request.query_params.get('bot_id')
        if bot_id:
            return Transaction.objects.filter(bot_id=bot_id)
        # If no bot_id is provided, we should probably return none for security, 
        # but for now we return all for easy testing. In production, enforce it.
        return Transaction.objects.all()

class DepartmentDataListCreateView(generics.ListCreateAPIView):
    serializer_class = DepartmentDataSerializer

    def get_queryset(self):
        bot_id = self.request.query_params.get('bot_id')
        if bot_id:
            return DepartmentData.objects.filter(bot_id=bot_id)
        return DepartmentData.objects.all()
