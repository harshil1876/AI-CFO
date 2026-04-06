"""
Sprint 6 / Sprint 17: Razorpay Connector (India-first)
Fetches captured payments from the Razorpay Payments API.

Config keys stored in DataSource.config:
  { "key_id": "rzp_xxx", "key_secret": "your_secret", "currency": "INR" }

Falls back to RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET env vars if config is empty.
"""
import os
import logging
import datetime
from decimal import Decimal
import requests
from .base import BaseConnector

logger = logging.getLogger(__name__)

RAZORPAY_API_BASE = "https://api.razorpay.com/v1"


class RazorpayConnector(BaseConnector):
    """
    Fetches payment and refund events from the Razorpay Payments API.
    Uses HTTP Basic Auth with key_id and key_secret.
    Falls back to environment variables if DataSource.config is not set.
    """

    def _get_creds(self):
        key_id = self.config.get('key_id') or os.environ.get('RAZORPAY_KEY_ID', '')
        key_secret = self.config.get('key_secret') or os.environ.get('RAZORPAY_KEY_SECRET', '')
        if not key_id or not key_secret:
            raise ValueError(
                "Razorpay credentials not found. Set key_id/key_secret in DataSource config "
                "or RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET environment variables."
            )
        return key_id, key_secret

    def authenticate(self) -> bool:
        key_id, key_secret = self._get_creds()
        resp = requests.get(
            f"{RAZORPAY_API_BASE}/payments?count=1",
            auth=(key_id, key_secret),
            timeout=10
        )
        if resp.status_code == 200:
            logger.info(f"[{self.bot_id}] Razorpay auth OK")
            return True
        raise ConnectionError(f"Razorpay auth failed: {resp.status_code} — {resp.text}")

    def fetch_transactions(self) -> list[dict]:
        """
        Fetches all captured payments using pagination.
        Uses Razorpay's `count` and `skip` params.
        """
        key_id, key_secret = self._get_creds()
        all_payments = []
        skip = 0
        count = 100

        while True:
            resp = requests.get(
                f"{RAZORPAY_API_BASE}/payments",
                auth=(key_id, key_secret),
                params={'count': count, 'skip': skip, 'expand[]': 'order'},
                timeout=20
            )
            if resp.status_code != 200:
                logger.error(f"[{self.bot_id}] Razorpay fetch error: {resp.status_code} {resp.text}")
                break

            data = resp.json()
            items = data.get('items', [])
            all_payments.extend(items)

            if len(items) < count:
                break   # No more pages
            skip += count

        logger.info(f"[{self.bot_id}] Razorpay: fetched {len(all_payments)} payments")
        return all_payments

    def transform(self, raw: dict) -> dict | None:
        try:
            # Only process captured payments — skip failed/pending/refunded
            if raw.get('status') != 'captured':
                return None

            # Razorpay amounts are in smallest currency unit (paise for INR)
            amount = Decimal(str(raw['amount'])) / Decimal('100')
            currency = raw.get('currency', 'INR').upper()

            # Razorpay uses Unix timestamps
            ts = raw.get('created_at', 0)
            date = datetime.datetime.fromtimestamp(ts).date().isoformat()

            # Best-effort description: use order description, email, or payment ID
            description = (
                raw.get('description')
                or raw.get('email')
                or raw.get('contact')
                or raw.get('id', '')
            )
            method = raw.get('method', '')
            if method:
                description = f"[{method.upper()}] {description}"

            return {
                'date': date,
                'amount': amount,
                'description': f"Razorpay: {description}"[:500],
                'category': 'Revenue',
                'currency': currency,
            }
        except Exception as e:
            logger.warning(f"[RazorpayConnector] transform error: {e} | raw={raw.get('id')}")
            return None
