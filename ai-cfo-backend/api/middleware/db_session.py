from django.db import connection

class TenantSessionMiddleware:
    """
    Middleware that sets the current PostgreSQL session variable `app.current_tenant`
    before processing the view, tying all Django ORM queries to the Supabase RLS policies.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # We assume the bot_id is added to request.user by the authentication middleware (Clerk or DeveloperAPIKey).
        # We safely grab it, as some requests (like health probes) might not have a .user object mapped at all yet.
        user = getattr(request, 'user', None)
        bot_id = getattr(user, 'bot_id', None) if user else None
        
        if bot_id:
            with connection.cursor() as cursor:
                # Use SET LOCAL to ensure the variable scope is limited to the current transaction.
                # Must be very careful to sanitize bot_id to prevent SQL injection if it came directly from user input.
                cursor.execute(f"SET LOCAL app.current_tenant = %s;", [str(bot_id)])
        
        response = self.get_response(request)
        return response
