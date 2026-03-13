"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // If Clerk loses the session (e.g., account deleted remotely), auto-redirect to sign-in
    if (error.message?.includes("No session was found")) {
      window.location.href = "/sign-in";
    }
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#060a14] text-white p-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="mb-3 text-xl font-bold text-white">Something went wrong</h2>
        <p className="mb-8 text-sm text-gray-400 leading-relaxed">
          {error.message?.includes("No session was found") 
            ? "Your authentication session has expired, or your account was removed. Please sign in again to continue."
            : "An unexpected application error occurred. " + error.message}
        </p>
        <button
          onClick={() => window.location.href = "/sign-in"}
          className="rounded-xl bg-blue-600 px-8 py-3 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-500 hover:shadow-blue-500/40"
        >
          Return to Sign In
        </button>
      </div>
    </div>
  );
}
