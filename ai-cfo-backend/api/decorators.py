import logging
from functools import wraps
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ObjectDoesNotExist
from .models import UserFeaturePermission

logger = logging.getLogger(__name__)

def require_feature(feature_name):
    """
    Decorator to enforce granular RBAC feature permissions.
    Expects the client to send HTTP_X_USER_ID and a bot_id (via query_params or body).
    
    If the user is an org:admin locally, they bypass all restrictions.
    Otherwise, we check the UserFeaturePermission table.
    """
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            
            # 1. Extract Identity context
            user_id = request.headers.get('X-User-Id')
            org_role = request.headers.get('X-Org-Role', 'org:member')
            
            # Where is the bot_id?
            # It could be in request.data (POST) or request.query_params (GET)
            bot_id = None
            if hasattr(request, 'data') and isinstance(request.data, dict):
                bot_id = request.data.get('bot_id')
            if not bot_id and hasattr(request, 'query_params'):
                bot_id = request.query_params.get('bot_id')
                
            if not user_id or not bot_id:
                logger.warning(f"RBAC Blocked: Missing auth headers Context. user_id={user_id}, bot_id={bot_id}")
                return Response({'error': 'Unauthorized. Missing Identity Headers.'}, status=status.HTTP_401_UNAUTHORIZED)
            
            # 2. Super-Admin bypass
            if org_role == 'org:admin':
                return view_func(request, *args, **kwargs)
                
            # 3. Check Granular Database Permission
            try:
                permission_obj = UserFeaturePermission.objects.get(bot_id=bot_id, user_id=user_id)
                
                # Use getattr to dynamically check the requested boolean flag
                if hasattr(permission_obj, feature_name):
                    has_access = getattr(permission_obj, feature_name)
                    if not has_access:
                        logger.warning(f"RBAC Blocked: User {user_id} lacks explicit '{feature_name}' permission.")
                        return Response({'error': f'Forbidden. Lack explicit permission for: {feature_name}'}, status=status.HTTP_403_FORBIDDEN)
                else:
                    logger.error(f"RBAC Error: Unknown feature name '{feature_name}' passed to decorator.")
                    return Response({'error': 'Internal Server Error enforcing RBAC.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                    
            except UserFeaturePermission.DoesNotExist:
                logger.warning(f"RBAC Blocked: User {user_id} has no permission mappings defined.")
                # By default, deny access to sensitive features if no mapping exists
                return Response({'error': f'Forbidden. No permission entry exists for {user_id}.'}, status=status.HTTP_403_FORBIDDEN)

            # Access granted
            return view_func(request, *args, **kwargs)
            
        return _wrapped_view
    return decorator
