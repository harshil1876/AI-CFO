"use client";

import { useState, useEffect } from "react";
import { Loader2, Sparkles, AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ContextForm } from "./ContextForm";
import { PreviewPanel } from "./PreviewPanel";
import { getFieldConfig } from "./field-configs";
import type { FieldType, BotData } from "@/types/ai.types";

interface GenerateFieldSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  field: FieldType;
  botId: string;
  currentValue?: string;
  onApply: (value: string | string[]) => void;
}

interface ContextState {
  userHint?: string;
}

export function GenerateFieldSheet({
  open,
  onOpenChange,
  field,
  botId,
  currentValue,
  onApply,
}: GenerateFieldSheetProps) {
  const [context, setContext] = useState<ContextState>({});
  const [generatedValue, setGeneratedValue] = useState<
    string | string[] | null
  >(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [botContext, setBotContext] = useState<BotData | null>(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [lastUsedContext, setLastUsedContext] = useState<ContextState>({});
  const [isMobile, setIsMobile] = useState(false);

  const fieldConfig = getFieldConfig(field);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch bot context when sheet opens
  useState(() => {
    if (open && botId) {
      fetch(`/api/bots/${botId}/data`)
        .then((res) => res.json())
        .then((data) => setBotContext(data))
        .catch(() => setBotContext(null));
    }
  });

  /**
   * Maps technical error messages to user-friendly messages
   */
  const getUserFriendlyError = (error: unknown): string => {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    // Network errors
    if (
      errorMessage.includes("fetch") ||
      errorMessage.includes("network") ||
      errorMessage.includes("Failed to fetch")
    ) {
      return "We're experiencing connection issues. Please check your internet and try again.";
    }

    // API errors (500, 503, etc.)
    if (
      errorMessage.includes("Internal server error") ||
      errorMessage.includes("500") ||
      errorMessage.includes("503") ||
      errorMessage.includes("GEMINI_API_KEY") ||
      errorMessage.includes("Gemini generation failed") ||
      errorMessage.includes("technical issues")
    ) {
      return "We're experiencing technical issues. Please try again in a moment.";
    }

    // Validation errors (already user-friendly, pass through)
    if (
      errorMessage.includes("too vague") ||
      errorMessage.includes("disabled") ||
      errorMessage.includes("Invalid input") ||
      errorMessage.includes("Cannot generate") ||
      errorMessage.includes("format violation")
    ) {
      return errorMessage;
    }

    // Timeout errors
    if (
      errorMessage.includes("timeout") ||
      errorMessage.includes("timed out")
    ) {
      return "The request took too long. Please try again.";
    }

    // Default fallback for any other errors
    return "We're experiencing technical issues. Please try again in a moment.";
  };

  const handleGenerate = async (contextToUse?: ContextState) => {
    const contextForGeneration = contextToUse || context;
    setIsGenerating(true);
    // Store the context used for this generation
    setLastUsedContext(contextForGeneration);
    try {
      const response = await fetch("/api/generate-field", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botId,
          field,
          context: contextForGeneration,
          currentValue,
        }),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          // If response is not JSON, use status code
          errorData = { error: `HTTP ${response.status}` };
        }
        throw new Error(errorData.error || errorData.message || "Generation failed");
      }

      const data = await response.json();
      setGeneratedValue(data.value);
      toast.success("Generated successfully!");
    } catch (error) {
      console.error("Generation error:", error);
      const userFriendlyMessage = getUserFriendlyError(error);
      toast.error(userFriendlyMessage, {
        duration: 5000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (generatedValue) {
      onApply(generatedValue);
      handleReset();
      onOpenChange(false);
      toast.success("Applied successfully!");
    }
  };

  const handleCancel = () => {
    // If generating, prevent cancel
    if (isGenerating) {
      toast.warning("Please wait for generation to complete");
      return;
    }

    // If there's generated content, show confirmation
    if (generatedValue) {
      setShowCloseConfirm(true);
      return;
    }

    // Otherwise, allow cancel
    handleReset();
    onOpenChange(false);
  };

  const handleReset = () => {
    setGeneratedValue(null);
    setContext({});
  };

  const handleOpenChange = (newOpen: boolean) => {
    // If trying to close
    if (!newOpen) {
      // Prevent closing if currently generating
      if (isGenerating) {
        toast.warning("Please wait for generation to complete");
        return;
      }

      // Show confirmation if there's generated content that hasn't been applied
      if (generatedValue) {
        setShowCloseConfirm(true);
        return;
      }

      // Otherwise, allow closing
      handleReset();
      onOpenChange(false);
    } else {
      // Opening - reset any pending close state
      onOpenChange(true);
    }
  };

  const handleConfirmClose = () => {
    setShowCloseConfirm(false);
    handleReset();
    onOpenChange(false);
  };

  const handleCancelClose = () => {
    setShowCloseConfirm(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          className="sm:max-w-[600px] overflow-y-auto p-4 max-h-[90vh] sm:max-h-full"
          onInteractOutside={(e) => {
            // Prevent closing on outside click if generating
            if (isGenerating) {
              e.preventDefault();
              toast.warning("Please wait for generation to complete");
            }
          }}
          onEscapeKeyDown={(e) => {
            // Prevent closing on ESC if generating
            if (isGenerating) {
              e.preventDefault();
              toast.warning("Please wait for generation to complete");
            }
          }}
        >
          <SheetHeader className="space-y-4 pb-6 border-b">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <SheetTitle className="text-xl">
                    Generate with QuickBots AI
                  </SheetTitle>
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    BETA
                  </span>
                </div>
                <SheetDescription className="text-sm">
                  {fieldConfig.label}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="py-6 space-y-6">
            {!generatedValue ? (
              <ContextForm
                field={field}
                context={context}
                onContextChange={setContext}
                botContext={botContext}
                disabled={isGenerating}
              />
            ) : (
              <PreviewPanel
                field={field}
                value={generatedValue}
                currentValue={currentValue}
              />
            )}
          </div>

          <SheetFooter className="gap-2 pt-6 border-t">
            {!generatedValue ? (
              <Button
                type="button"
                onClick={() => handleGenerate()}
                disabled={isGenerating || !context.userHint?.trim()}
                className="min-w-[140px]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    // Immediately start regenerating with the last used context
                    handleGenerate(lastUsedContext);
                  }}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    "Regenerate"
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={handleApply}
                  disabled={isGenerating}
                  className="min-w-[100px]"
                >
                  Apply Changes
                </Button>
              </>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Close
            </Button>
          </SheetFooter>
          
          {/* Safety Disclaimer - At the bottom */}
          <div className="px-4 pb-4 pt-2">
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-amber-900 dark:text-amber-200 mb-1">
                  AI-Generated Content Disclaimer
                </p>
                <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  This content is generated by AI and may contain errors or inaccuracies. 
                  Always review and verify the generated content before using it in production. 
                  AI can make mistakes—please double-check everything.
                </p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard generated content?</AlertDialogTitle>
            <AlertDialogDescription>
              You have generated content that hasn&apos;t been applied. If you
              close now, these changes will be lost. Are you sure you want to
              continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelClose}>
              Keep Changes
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClose}>
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
