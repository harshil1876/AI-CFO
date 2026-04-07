from rest_framework import authentication
from rest_framework import exceptions
from django.utils import timezone
from .models import DeveloperAPIKey
import hashlib

class DeveloperAPIKeyAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Bearer cfo_'):
            return None # Move onto other authenticators if it doesn't match our pattern

        token = auth_header.split('Bearer ')[1].strip()
        hashed_token = hashlib.sha256(token.encode('utf-8')).hexdigest()

        try:
            api_key = DeveloperAPIKey.objects.get(hashed_key=hashed_token, is_active=True)
        except DeveloperAPIKey.DoesNotExist:
            raise exceptions.AuthenticationFailed('Invalid or revoked API Key.')

        api_key.last_used = timezone.now()
        api_key.save(update_fields=['last_used'])

        # Create a mock user object representing the API integration
        class APIUser:
            is_authenticated = True
            bot_id = api_key.bot_id
            workspace_id = api_key.workspace_id

        return (APIUser(), None)
