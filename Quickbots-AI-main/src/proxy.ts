import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/bots(.*)"]);

// CORS headers for API routes
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Session-Id, X-Requested-With",
  "Access-Control-Max-Age": "86400",
};

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const pathname = req.nextUrl.pathname;
  
  // Only handle CORS for /api/config and /api/chat routes
  const isConfigRoute = pathname.startsWith("/api/config/");
  const isChatRoute = pathname.startsWith("/api/chat/");
  
  // Handle CORS preflight requests for config and chat routes only
  if (req.method === "OPTIONS" && (isConfigRoute || isChatRoute)) {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // For config and chat API routes, just let them through (they handle their own CORS)
  // Don't apply Clerk protection to these routes
  if (isConfigRoute || isChatRoute) {
    return NextResponse.next();
  }

  // Protect other routes that match the pattern
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*|embed).*)", "/api/(.*)"],
};

