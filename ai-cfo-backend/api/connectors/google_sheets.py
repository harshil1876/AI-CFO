"""
Sprint 6: Google Sheets Connector
Reads financial data from a structured Google Sheet using the Sheets API v4.
Config keys: {
    "spreadsheet_id": "1BxiMVs...",
    "sheet_name": "Transactions",        (optional, defaults to first sheet)
    "service_account_json": { ... }      (the Google service account key JSON)
}
"""
import logging
import datetime
from decimal import Decimal, InvalidOperation
import json
import requests
from .base import BaseConnector

logger = logging.getLogger(__name__)


class GoogleSheetsConnector(BaseConnector):
    """
    Connects to a Google Sheet via the Sheets API v4 using a Service Account.
    Expected sheet columns: Date | Amount | Description | Category | Currency
    """

    def _get_access_token(self) -> str:
        """
        Gets a short-lived OAuth2 access token from Google using the service account.
        Uses JWT-based auth without the google-auth library for minimal dependencies.
        """
        import time, base64, json
        from cryptography.hazmat.primitives import hashes, serialization
        from cryptography.hazmat.primitives.asymmetric import padding

        sa = self.config['service_account_json']
        if isinstance(sa, str):
            sa = json.loads(sa)

        now = int(time.time())
        header = base64.urlsafe_b64encode(json.dumps({'alg': 'RS256', 'typ': 'JWT'}).encode()).rstrip(b'=').decode()
        payload = base64.urlsafe_b64encode(json.dumps({
            'iss': sa['client_email'],
            'scope': 'https://www.googleapis.com/auth/spreadsheets.readonly',
            'aud': 'https://oauth2.googleapis.com/token',
            'iat': now,
            'exp': now + 3600,
        }).encode()).rstrip(b'=').decode()

        private_key = serialization.load_pem_private_key(sa['private_key'].encode(), password=None)
        signature = private_key.sign(f"{header}.{payload}".encode(), padding.PKCS1v15(), hashes.SHA256())
        sig_b64 = base64.urlsafe_b64encode(signature).rstrip(b'=').decode()

        jwt = f"{header}.{payload}.{sig_b64}"
        token_resp = requests.post('https://oauth2.googleapis.com/token', data={
            'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion': jwt,
        }, timeout=10)
        return token_resp.json()['access_token']

    def authenticate(self) -> bool:
        token = self._get_access_token()
        if token:
            logger.info(f"[{self.bot_id}] Google Sheets auth OK")
            return True
        raise ConnectionError("Failed to obtain Google access token.")

    def fetch_transactions(self) -> list[dict]:
        spreadsheet_id = self.config['spreadsheet_id']
        sheet_name = self.config.get('sheet_name', 'Sheet1')
        token = self._get_access_token()

        url = f"https://sheets.googleapis.com/v4/spreadsheets/{spreadsheet_id}/values/{sheet_name}"
        resp = requests.get(url, headers={'Authorization': f'Bearer {token}'}, timeout=15)

        if resp.status_code != 200:
            raise ConnectionError(f"Google Sheets error: {resp.status_code} — {resp.text}")

        rows = resp.json().get('values', [])
        if not rows:
            return []

        headers = [h.strip().lower() for h in rows[0]]
        result = []
        for row in rows[1:]:
            record = dict(zip(headers, row))
            result.append(record)

        logger.info(f"[{self.bot_id}] Google Sheets: fetched {len(result)} rows")
        return result

    def transform(self, raw: dict) -> dict | None:
        try:
            date_str = raw.get('date', '').strip()
            # Support multiple date formats: YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY
            for fmt in ('%Y-%m-%d', '%d/%m/%Y', '%m/%d/%Y', '%d-%m-%Y'):
                try:
                    date = datetime.datetime.strptime(date_str, fmt).date().isoformat()
                    break
                except ValueError:
                    continue
            else:
                return None

            amount_str = raw.get('amount', '0').replace(',', '').strip()
            amount = Decimal(amount_str)
            if amount == 0:
                return None

            return {
                'date': date,
                'amount': abs(amount),
                'description': raw.get('description', '')[:500],
                'category': raw.get('category', 'Uncategorized'),
                'currency': raw.get('currency', 'INR').upper(),
            }
        except (InvalidOperation, Exception) as e:
            logger.warning(f"[GoogleSheetsConnector] transform error: {e} | raw={raw}")
            return None
