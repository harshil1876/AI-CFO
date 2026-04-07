from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .auth import DeveloperAPIKeyAuthentication
from .models import Transaction, KPI

@api_view(['POST'])
@authentication_classes([DeveloperAPIKeyAuthentication])
@permission_classes([IsAuthenticated])
def ingest_transactions(request):
    """
    Developer Platform Endpoint:
    Allows push-ingestion of transactions directly into AI-CFO via API.
    """
    bot_id = request.user.bot_id
    data = request.data
    
    if not isinstance(data, list):
        return Response({'error': 'Payload must be a list of transactions.'}, status=400)
    
    bulk_txs = []
    for tx in data:
        # Simplistic mapping for the developer endpoint
        bulk_txs.append(Transaction(
            bot_id=bot_id,
            date=tx.get('date'),
            description=tx.get('description'),
            amount=tx.get('amount'),
            category=tx.get('category', 'Uncategorized'),
            type=tx.get('type', 'debit'),
            status='reconciled'
        ))
    
    Transaction.objects.bulk_create(bulk_txs)
    
    # Ideally trigger celery task here to re-run analytics since data changed
    from .tasks import run_analytics_task
    # We trigger async update mapping to the current month of the transactions.
    # Just triggering for a default period for the demo:
    run_analytics_task.delay(bot_id, '2026-04')
    
    return Response({'status': 'success', 'inserted_count': len(bulk_txs)})


@api_view(['GET'])
@authentication_classes([DeveloperAPIKeyAuthentication])
@permission_classes([IsAuthenticated])
def fetch_kpis(request):
    """
    Developer Platform Endpoint:
    Pull metrics to display inside building-company's own internal dashboards.
    """
    bot_id = request.user.bot_id
    kpis = KPI.objects.filter(bot_id=bot_id).order_by('-period')[:12]
    
    data = [
        {
            'period': k.period,
            'total_revenue': k.total_revenue,
            'total_expenses': k.total_expenses,
            'net_profit': k.net_profit,
            'profit_margin': k.profit_margin,
            'burn_rate': k.burn_rate,
            'runway_months': k.runway_months
        } for k in kpis
    ]
    
    return Response({'status': 'success', 'data': data})
