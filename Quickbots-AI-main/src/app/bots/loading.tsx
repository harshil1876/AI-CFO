"use client";

import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div
      className="flex items-center justify-center min-h-screen text-muted-foreground"
      role="status"
      aria-label="Loading"
    >
      <Spinner className="size-6" />
    </div>
  );
}
