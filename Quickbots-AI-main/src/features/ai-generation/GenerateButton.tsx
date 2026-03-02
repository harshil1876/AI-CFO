"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GenerateButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function GenerateButton({
  onClick,
  disabled = false,
  loading = false,
}: GenerateButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClick}
            disabled={disabled || loading}
            className="h-8 w-8 shrink-0"
          >
            <Sparkles className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span className="sr-only">Generate with AI</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Generate with AI</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

