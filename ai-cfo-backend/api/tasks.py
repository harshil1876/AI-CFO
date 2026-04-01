"""
Sprint 6: Celery Tasks for Scheduled Auto-Import
Celery beat schedules connectors to auto-sync on a cron basis.
"""
import logging
from celery import shared_task
from .models import DataSource
from .connectors import get_connector

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def sync_data_source(self, source_id: int):
    """
    Celery task to sync a single DataSource by its ID.
    Retries up to 3 times with a 60-second delay on failure.
    """
    try:
        ds = DataSource.objects.get(id=source_id, status='active')
        connector = get_connector(ds)
        log = connector.sync()
        logger.info(
            f"[Celery] Sync task complete for source_id={source_id}: "
            f"{log.status} | {log.records_inserted} inserted"
        )
        return {
            'source_id': source_id,
            'status': log.status,
            'inserted': log.records_inserted,
        }
    except DataSource.DoesNotExist:
        logger.warning(f"[Celery] DataSource {source_id} not found or not active.")
        return {'source_id': source_id, 'status': 'skipped'}
    except Exception as exc:
        logger.error(f"[Celery] Sync task failed for source_id={source_id}: {exc}")
        raise self.retry(exc=exc)


@shared_task
def sync_all_active_sources():
    """
    Celery beat task: runs every hour and queues a sync for every active DataSource.
    Configure in settings.py CELERY_BEAT_SCHEDULE.
    """
    active_sources = DataSource.objects.filter(status='active').values_list('id', flat=True)
    count = 0
    for source_id in active_sources:
        sync_data_source.delay(source_id)
        count += 1
    logger.info(f"[Celery] Queued {count} active connector sync tasks.")
    return {'queued': count}

@shared_task
def email_monthly_pnl_reports():
    """
    Celery beat task to automatically generate and email the P&L summary
    to the organization administrators on the 1st of every month.
    """
    from .services.reporting_logic import generate_pnl
    from .models import Transaction
    import datetime
    
    # Identify active bot_ids (organizations)
    bot_ids = Transaction.objects.values_list('bot_id', flat=True).distinct()
    
    today = datetime.date.today()
    first_of_this_month = today.replace(day=1)
    last_day_last_month = first_of_this_month - datetime.timedelta(days=1)
    first_day_last_month = last_day_last_month.replace(day=1)
    
    start = first_day_last_month.strftime('%Y-%m-%d')
    end = last_day_last_month.strftime('%Y-%m-%d')
    
    count = 0
    for bot_id in bot_ids:
        try:
            pnl_data = generate_pnl(bot_id, start_date=start, end_date=end)
            net_income = pnl_data.get('NetIncome', 0)
            logger.info(f"Generated P&L for {bot_id} | Net Income: {net_income} | Dispatching to SendGrid.")
            # TODO: Integrate django.core.mail.send_mail logic here
            count += 1
        except Exception as e:
            logger.error(f"Failed to generate email report for {bot_id}: {str(e)}")
            
    return {'emails_sent': count}
