"""
Sprint 6: Connector Package Init
Registry pattern: maps 'source_type' strings to connector classes.
Usage: from api.connectors import get_connector
"""
from .tally import TallyConnector
from .razorpay import RazorpayConnector
from .google_sheets import GoogleSheetsConnector
from .zoho import ZohoConnector

CONNECTOR_REGISTRY = {
    'tally': TallyConnector,
    'razorpay': RazorpayConnector,
    'google_sheets': GoogleSheetsConnector,
    'zoho': ZohoConnector,
}


def get_connector(data_source):
    """
    Factory function: returns the appropriate connector instance for a DataSource.
    Raises ValueError if source_type is not registered.
    """
    ConnectorClass = CONNECTOR_REGISTRY.get(data_source.source_type)
    if not ConnectorClass:
        raise ValueError(
            f"Unknown connector type '{data_source.source_type}'. "
            f"Available: {list(CONNECTOR_REGISTRY.keys())}"
        )
    return ConnectorClass(data_source)
