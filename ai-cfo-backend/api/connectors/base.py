"""
Sprint 6: Data Integration Layer — Base Connector Framework
All connectors (Tally, Razorpay, Google Sheets, Zoho) must inherit from BaseConnector.
"""
import logging
from abc import ABC, abstractmethod
from decimal import Decimal
from django.utils import timezone
from ..models import DataSource, ConnectorSyncLog, Transaction

logger = logging.getLogger(__name__)

# Approximate exchange rates to INR (updated periodically or via live API in Sprint 9)
EXCHANGE_RATES_TO_INR = {
    'INR': Decimal('1.0'),
    'USD': Decimal('83.50'),
    'EUR': Decimal('90.20'),
    'GBP': Decimal('105.00'),
    'AED': Decimal('22.73'),
    'SGD': Decimal('61.50'),
}


def convert_to_inr(amount: Decimal, currency: str) -> tuple[Decimal, Decimal]:
    """Convert any currency amount to INR. Returns (converted_amount, exchange_rate)."""
    currency = currency.upper().strip()
    rate = EXCHANGE_RATES_TO_INR.get(currency, Decimal('1.0'))
    return amount * rate, rate


class BaseConnector(ABC):
    """
    Abstract base class that all data source connectors must implement.
    Provides a consistent interface: authenticate → fetch → transform → persist.
    """

    def __init__(self, data_source: DataSource):
        self.data_source = data_source
        self.bot_id = data_source.bot_id
        self.config = data_source.config  # Dict of credentials from DB

    @abstractmethod
    def authenticate(self) -> bool:
        """
        Test connectivity with the external data source.
        Returns True if successful, raises an exception otherwise.
        """
        pass

    @abstractmethod
    def fetch_transactions(self) -> list[dict]:
        """
        Pull raw transaction data from the external source.
        Returns a list of raw dicts; each must be normalized by transform().
        """
        pass

    @abstractmethod
    def transform(self, raw_record: dict) -> dict | None:
        """
        Normalize a single raw record into a standard shared format:
        {
            'date': 'YYYY-MM-DD',
            'amount': Decimal,
            'description': str,
            'category': str,
            'currency': str,   # e.g. 'INR', 'USD'
        }
        Return None to skip a record.
        """
        pass

    def sync(self) -> ConnectorSyncLog:
        """
        Main orchestration method: fetch → transform → persist → log.
        Returns a ConnectorSyncLog instance.
        """
        log = ConnectorSyncLog(
            data_source=self.data_source,
            bot_id=self.bot_id,
            status='failed',
            records_fetched=0,
            records_inserted=0,
        )

        try:
            logger.info(f"[{self.bot_id}] Starting sync: {self.data_source.source_type}")

            # Step 1: Authenticate
            self.authenticate()

            # Step 2: Fetch raw records
            raw_records = self.fetch_transactions()
            log.records_fetched = len(raw_records)
            logger.info(f"[{self.bot_id}] Fetched {len(raw_records)} raw records.")

            # Step 3: Transform + Persist
            inserted = 0
            for raw in raw_records:
                try:
                    normalized = self.transform(raw)
                    if normalized is None:
                        continue

                    currency = normalized.get('currency', 'INR')
                    amount_inr, rate = convert_to_inr(
                        Decimal(str(normalized['amount'])), currency
                    )

                    Transaction.objects.create(
                        bot_id=self.bot_id,
                        date=normalized['date'],
                        amount=amount_inr,
                        description=normalized.get('description', ''),
                        category=normalized.get('category', 'Uncategorized'),
                    )

                    log.currency_used = currency
                    log.exchange_rate = rate
                    inserted += 1

                except Exception as row_err:
                    logger.warning(f"[{self.bot_id}] Skipped record due to error: {row_err}")

            log.records_inserted = inserted
            log.status = 'success' if inserted > 0 else 'partial'

            # Step 4: Update DataSource last_synced_at
            self.data_source.last_synced_at = timezone.now()
            self.data_source.status = 'active'
            self.data_source.save(update_fields=['last_synced_at', 'status'])

            logger.info(f"[{self.bot_id}] Sync complete. Inserted {inserted} records.")

        except Exception as e:
            log.status = 'failed'
            log.error_message = str(e)
            self.data_source.status = 'error'
            self.data_source.save(update_fields=['status'])
            logger.error(f"[{self.bot_id}] Sync FAILED: {e}")

        finally:
            log.save()

        return log
