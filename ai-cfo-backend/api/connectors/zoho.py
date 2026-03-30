"""
Sprint 6: Zoho Books Connector
Fetches invoices and expenses from the Zoho Books API v3.
Config keys: {
    "client_id": "...",
    "client_secret": "...",
    "refresh_token": "...",   (obtained via OAuth2 flow in Zoho)
    "organization_id": "..."  (Zoho organization_id, NOT our bot_id)
}
"""
import logging
import datetime
from decimal import Decimal
import requests
from .base import BaseConnector

logger = logging.getLogger(__name__)

ZOHO_TOKEN_URL = "https://accounts.zoho.in/oauth/v2/token"
ZOHO_BOOKS_BASE = "https://www.zohoapis.in/books/v3"


class ZohoConnector(BaseConnector):
    """
    Connects to Zoho Books to pull invoices (revenue) and bills (expenses).
    Uses OAuth2 refresh token to get a short-lived access token.
    """

    def _get_access_token(self) -> str:
        resp = requests.post(ZOHO_TOKEN_URL, params={
            'grant_type': 'refresh_token',
            'client_id': self.config['client_id'],
            'client_secret': self.config['client_secret'],
            'refresh_token': self.config['refresh_token'],
        }, timeout=10)
        data = resp.json()
        if 'access_token' not in data:
            raise ConnectionError(f"Zoho token error: {data}")
        return data['access_token']

    def _headers(self) -> dict:
        return {'Authorization': f'Zoho-oauthtoken {self._get_access_token()}'}

    def _org_id(self) -> str:
        return self.config.get('organization_id', '')

    def authenticate(self) -> bool:
        token = self._get_access_token()
        if token:
            logger.info(f"[{self.bot_id}] Zoho Books auth OK")
            return True
        raise ConnectionError("Failed to obtain Zoho Books access token.")

    def fetch_transactions(self) -> list[dict]:
        records = []
        org_id = self._org_id()
        headers = self._headers()

        # Fetch invoices (Revenue)
        invoices_resp = requests.get(
            f"{ZOHO_BOOKS_BASE}/invoices",
            headers=headers,
            params={'organization_id': org_id, 'status': 'paid', 'per_page': 200},
            timeout=15
        )
        if invoices_resp.status_code == 200:
            for inv in invoices_resp.json().get('invoices', []):
                inv['_source'] = 'invoice'
                records.append(inv)
        else:
            logger.warning(f"[{self.bot_id}] Zoho invoices error: {invoices_resp.text}")

        # Fetch bills/expenses
        bills_resp = requests.get(
            f"{ZOHO_BOOKS_BASE}/bills",
            headers=headers,
            params={'organization_id': org_id, 'status': 'paid', 'per_page': 200},
            timeout=15
        )
        if bills_resp.status_code == 200:
            for bill in bills_resp.json().get('bills', []):
                bill['_source'] = 'bill'
                records.append(bill)
        else:
            logger.warning(f"[{self.bot_id}] Zoho bills error: {bills_resp.text}")

        logger.info(f"[{self.bot_id}] Zoho Books: fetched {len(records)} total records")
        return records

    def transform(self, raw: dict) -> dict | None:
        try:
            source = raw.get('_source', 'invoice')

            # Date: Zoho uses YYYY-MM-DD
            date_str = raw.get('date') or raw.get('invoice_date') or raw.get('bill_date', '')
            date = datetime.datetime.strptime(date_str, '%Y-%m-%d').date().isoformat()

            # Amount
            amount = Decimal(str(raw.get('total', raw.get('balance', 0))))
            if amount == 0:
                return None

            currency = raw.get('currency_code', 'INR').upper()
            category = 'Revenue' if source == 'invoice' else 'Expense'
            description = raw.get('customer_name') or raw.get('vendor_name') or raw.get('invoice_number', '')

            return {
                'date': date,
                'amount': amount,
                'description': f"Zoho {source.title()}: {description}"[:500],
                'category': category,
                'currency': currency,
            }
        except Exception as e:
            logger.warning(f"[ZohoConnector] transform error: {e}")
            return None
