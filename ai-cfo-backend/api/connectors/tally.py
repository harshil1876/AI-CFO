"""
Sprint 6: Tally Prime Connector
Connects to the Tally ERP 9 / Tally Prime XML export or the TallyServer (via HTTP).
Config keys: { "host": "localhost", "port": 9000, "company_name": "My Company" }
"""
import logging
import datetime
import re
import requests
from decimal import Decimal
from .base import BaseConnector

logger = logging.getLogger(__name__)

# Standard Tally XML request to fetch all vouchers
TALLY_LEDGER_XML = """
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Export Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <EXPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Day Book</REPORTNAME>
        <STATICVARIABLES>
          <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
        </STATICVARIABLES>
      </REQUESTDESC>
    </EXPORTDATA>
  </BODY>
</ENVELOPE>
"""


class TallyConnector(BaseConnector):
    """
    Fetches voucher data from a locally running Tally Prime instance.
    Tally must have ODBC/HTTP server enabled on port 9000 (default).
    """

    def authenticate(self) -> bool:
        host = self.config.get('host', 'localhost')
        port = self.config.get('port', 9000)
        url = f"http://{host}:{port}"
        try:
            resp = requests.post(url, data="<ENVELOPE><HEADER><TALLYREQUEST>Export Data</TALLYREQUEST></HEADER></ENVELOPE>", timeout=5)
            if resp.status_code == 200:
                logger.info(f"[{self.bot_id}] Tally authentication OK at {url}")
                return True
            raise ConnectionError(f"Tally returned status {resp.status_code}")
        except requests.exceptions.ConnectionError:
            raise ConnectionError(
                f"Cannot reach Tally at {url}. Ensure Tally Prime is open and the HTTP gateway is enabled."
            )

    def fetch_transactions(self) -> list[dict]:
        host = self.config.get('host', 'localhost')
        port = self.config.get('port', 9000)
        url = f"http://{host}:{port}"

        resp = requests.post(url, data=TALLY_LEDGER_XML, timeout=30)
        xml_text = resp.text

        # Parse vouchers from Tally XML response
        vouchers = []
        # Extract <VOUCHER> blocks
        voucher_blocks = re.findall(r'<VOUCHER[^>]*>(.*?)</VOUCHER>', xml_text, re.DOTALL)
        for block in voucher_blocks:
            date_match = re.search(r'<DATE>(\d{8})</DATE>', block)
            amount_match = re.search(r'<AMOUNT>([\d.\-]+)</AMOUNT>', block)
            narration_match = re.search(r'<NARRATION>(.*?)</NARRATION>', block)
            vtype_match = re.search(r'<VOUCHERTYPENAME>(.*?)</VOUCHERTYPENAME>', block)
            if date_match and amount_match:
                vouchers.append({
                    'date_raw': date_match.group(1),
                    'amount_raw': amount_match.group(1),
                    'narration': narration_match.group(1) if narration_match else '',
                    'voucher_type': vtype_match.group(1) if vtype_match else 'Other',
                })
        return vouchers

    def transform(self, raw: dict) -> dict | None:
        try:
            # Tally date format: YYYYMMDD
            date_str = raw['date_raw']
            date = datetime.date(int(date_str[:4]), int(date_str[4:6]), int(date_str[6:8]))

            amount = abs(Decimal(raw['amount_raw']))
            if amount == 0:
                return None

            voucher_type = raw.get('voucher_type', 'Other').lower()
            if 'receipt' in voucher_type or 'sales' in voucher_type:
                category = 'Revenue'
            elif 'payment' in voucher_type or 'purchase' in voucher_type:
                category = 'Expense'
            else:
                category = voucher_type.title() or 'Other'

            return {
                'date': date.isoformat(),
                'amount': amount,
                'description': raw.get('narration', '')[:500],
                'category': category,
                'currency': 'INR',  # Tally India is always INR
            }
        except Exception as e:
            logger.warning(f"[TallyConnector] transform error: {e}")
            return None
