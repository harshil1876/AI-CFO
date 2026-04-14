"""
Clerk JWT Authentication Middleware for Django.

Verifies Clerk-issued JWT tokens on incoming API requests.
- Extracts the Bearer token from the Authorization header.
- Validates signature, expiry, and issuer using Clerk's JWKS endpoint.
- Attaches clerk_user_id and clerk_org_id to the request object.
- Skips auth for OPTIONS (CORS preflight) and non-API paths.
"""

import os
import json
import jwt
from jwt import PyJWKClient
from django.http import JsonResponse


class ClerkAuthMiddleware:
    """
    Django middleware that verifies Clerk JWT tokens.
    
    Requires CLERK_ISSUER in .env (e.g., https://well-dragon-8.clerk.accounts.dev)
    """

    # Paths that don't require authentication
    EXEMPT_PATHS = [
        "/api/ap/webhooks/",
        "/api/health/"
    ]

    def __init__(self, get_response):
        self.get_response = get_response
        self.clerk_issuer = os.environ.get("CLERK_ISSUER", "")
        self.jwks_url = f"{self.clerk_issuer}/.well-known/jwks.json" if self.clerk_issuer else ""
        self.jwks_client = PyJWKClient(self.jwks_url) if self.jwks_url else None

    def __call__(self, request):
        # Skip auth for CORS preflight
        if request.method == "OPTIONS":
            return self.get_response(request)

        # Skip auth for non-API paths (admin, etc.)
        if not request.path.startswith("/api/"):
            return self.get_response(request)

        # Pass through exempt endpoints
        for exempt in self.EXEMPT_PATHS:
            if request.path.startswith(exempt):
                return self.get_response(request)

        # Skip if no CLERK_ISSUER configured (development fallback)
        if not self.clerk_issuer or not self.jwks_client:
            request.clerk_user_id = None
            request.clerk_org_id = None
            return self.get_response(request)

        # Extract Bearer token
        auth_header = request.META.get("HTTP_AUTHORIZATION", "")
        if not auth_header.startswith("Bearer "):
            return JsonResponse(
                {"error": "Authentication required. No Bearer token provided."},
                status=401,
            )

        token = auth_header.split("Bearer ")[1].strip()

        try:
            # Get the signing key from Clerk's JWKS endpoint
            signing_key = self.jwks_client.get_signing_key_from_jwt(token)

            # Decode and verify the JWT
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256"],
                issuer=self.clerk_issuer,
                options={
                    "verify_exp": True,
                    "verify_iss": True,
                    "verify_aud": False,  # Clerk JWTs may not have aud
                },
            )

            # Attach Clerk user info to the request
            request.clerk_user_id = payload.get("sub", None)
            request.clerk_org_id = payload.get("org_id", None)

        except jwt.ExpiredSignatureError:
            return JsonResponse(
                {"error": "Token has expired. Please sign in again."},
                status=401,
            )
        except jwt.InvalidIssuerError:
            return JsonResponse(
                {"error": "Invalid token issuer."},
                status=401,
            )
        except jwt.InvalidTokenError as e:
            return JsonResponse(
                {"error": f"Invalid authentication token: {str(e)}"},
                status=401,
            )
        except Exception as e:
            return JsonResponse(
                {"error": f"Authentication error: {str(e)}"},
                status=401,
            )

        return self.get_response(request)
