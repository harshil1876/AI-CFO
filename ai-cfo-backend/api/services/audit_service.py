"""
Centralized Audit Logging Service for CFOlytics.
Logs all significant financial actions to the AuditEvent model.
Call `log_event(request, action, resource_type, resource_id, details)` from any view.
"""
import logging
from ..models import AuditEvent

logger = logging.getLogger(__name__)


def log_event(request, action: str, resource_type: str = "", resource_id: str = "", details: str = ""):
    """
    Creates an immutable AuditEvent record.

    Args:
        request: The Django request object (to extract bot_id, user_id, IP).
        action: A string constant like "EXPORTED_PNL" or "APPROVED_INVOICE".
        resource_type: The entity type affected e.g. "Report", "Invoice".
        resource_id: A primary key or identifier string for the affected record.
        details: A JSON string or human-readable string with extra context.
    """
    try:
        # Extract identity context
        bot_id = (
            request.data.get("bot_id")
            or request.query_params.get("bot_id")
            or "unknown"
        )
        user_id = request.headers.get("X-User-Id", "anonymous")
        user_email = request.headers.get("X-User-Email", "anonymous@cfol.ai")

        # Extract client IP address
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            ip = x_forwarded_for.split(",")[0].strip()
        else:
            ip = request.META.get("REMOTE_ADDR")

        AuditEvent.objects.create(
            bot_id=bot_id,
            user_id=user_id,
            user_email=user_email,
            action=action,
            resource_type=resource_type,
            resource_id=str(resource_id),
            details=details,
            ip_address=ip,
        )
    except Exception as e:
        # Never let audit logging crash the main flow
        logger.error(f"[AuditService] Failed to log event '{action}': {e}")
