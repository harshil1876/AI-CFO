"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, Check } from "lucide-react";
import React, { useEffect, useState, startTransition, useRef } from "react";
import { Spinner } from "./ui/spinner";

interface SaveTriggerUIProps {
  isDirty: boolean;
  isSubmitting: boolean;
  isPendingUpdate: boolean;
  onSave: () => void;
  onCancel?: () => void;
  phrase?: string;
  justSaved?: boolean; // Track if a save just completed
}

export default function SaveTriggerUI({
  isDirty,
  isSubmitting,
  isPendingUpdate,
  onSave,
  onCancel,
  phrase = "",
  justSaved = false,
}: SaveTriggerUIProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const prevIsDirtyRef = useRef(isDirty);
  const prevIsSubmittingRef = useRef(isSubmitting);
  const prevIsPendingUpdateRef = useRef(isPendingUpdate);
  const wasSubmittingRef = useRef(false); // Track if we were submitting recently

  useEffect(() => {
    // Track previous states
    const wasDirty = prevIsDirtyRef.current;
    const wasSubmitting = prevIsSubmittingRef.current;
    const wasPendingUpdate = prevIsPendingUpdateRef.current;

    // Track if we're currently in a save operation
    if (isSubmitting || isPendingUpdate) {
      wasSubmittingRef.current = true;
    }

    prevIsDirtyRef.current = isDirty;
    prevIsSubmittingRef.current = isSubmitting;
    prevIsPendingUpdateRef.current = isPendingUpdate;

    if (isDirty) {
      startTransition(() => {
        setIsVisible(true);
        setShowSuccess(false);
      });
      return;
    }

    // If not dirty and was visible
    if (!isDirty && isVisible && !isSubmitting && !isPendingUpdate) {
      // Check if we just completed a save operation
      // This happens when:
      // 1. We were submitting/pending and now we're not (save completed), OR
      // 2. justSaved prop is true (explicit save signal), OR
      // 3. We transitioned from dirty+submitting to clean (save completed)
      const justCompletedSave =
        wasSubmittingRef.current ||
        justSaved ||
        (wasDirty && (wasSubmitting || wasPendingUpdate));

      if (justCompletedSave) {
        // Show success message after actual save
        wasSubmittingRef.current = false; // Reset flag
        startTransition(() => {
          setShowSuccess(true);
        });

        // Let success state be visible for a while
        const successTimer = setTimeout(() => {
          // Trigger exit animation only
          startTransition(() => {
            setIsVisible(false);
          });

          // Reset internal state AFTER animation finishes
          const cleanupTimer = setTimeout(() => {
            startTransition(() => {
              setShowSuccess(false);
            });
          }, 300); // Wait for CSS transition to complete

          return () => clearTimeout(cleanupTimer);
        }, 2000);

        return () => clearTimeout(successTimer);
      } else {
        // Changes were reverted without saving - hide immediately
        wasSubmittingRef.current = false; // Reset flag
        startTransition(() => {
          setIsVisible(false);
          setShowSuccess(false);
        });
      }
    }
  }, [isDirty, isVisible, isSubmitting, isPendingUpdate, justSaved]);

  const isLoading = isSubmitting || isPendingUpdate;

  return (
    <div
      className={`fixed bottom-4 sm:bottom-6 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-999999999999999 transition-all duration-300 ease-out ${
        isVisible
          ? "translate-y-0 opacity-100 scale-100"
          : "translate-y-4 opacity-0 scale-95 pointer-events-none"
      }`}
    >
      <div className="relative">
        {/* Floating card with shadow */}
        <div className="bg-background border border-border rounded-xl shadow-2xl shadow-black/20 dark:shadow-black/40 overflow-hidden sm:min-w-[400px] max-w-2xl">
          {/* Top accent line */}
          <div className="h-1 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500" />

          {/* Content */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 sm:gap-4">
            {/* Left side - Status message */}
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              {showSuccess ? (
                <>
                  <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-green-500/10 shrink-0">
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-foreground truncate">
                      Changes saved successfully
                    </p>
                    <p className="text-xs text-muted-foreground hidden sm:block">
                      {phrase} has been updated
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500/10 animate-pulse shrink-0">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-foreground truncate">
                      Unsaved changes
                    </p>
                    <p className="text-xs text-muted-foreground hidden sm:block">
                      {phrase || "Your changes"} need to be saved
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Right side - Action buttons */}
            {!showSuccess && (
              <div className="flex items-center gap-2 shrink-0">
                {onCancel && (
                  <Button
                    onClick={onCancel}
                    disabled={isLoading}
                    size="sm"
                    variant="outline"
                    className="gap-1.5 sm:gap-2 px-3 sm:px-4 h-8 sm:h-9 font-medium text-xs sm:text-sm"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  onClick={onSave}
                  disabled={isLoading}
                  size="sm"
                  className="gap-1.5 sm:gap-2 px-3 sm:px-4 h-8 sm:h-9 font-medium bg-primary hover:bg-primary/90 shadow-sm text-xs sm:text-sm"
                >
                  {isLoading ? (
                    <>
                      <Spinner />
                      <span className="hidden xs:inline">Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>Save</span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Backdrop blur effect (subtle) */}
        <div className="absolute inset-0 -z-10 blur-xl bg-linear-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-xl" />
      </div>
    </div>
  );
}
