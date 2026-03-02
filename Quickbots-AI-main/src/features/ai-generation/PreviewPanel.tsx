"use client";

import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { FieldType } from "@/types/ai.types";

interface PreviewPanelProps {
  field: FieldType;
  value: string | string[];
  currentValue?: string;
}

export function PreviewPanel({ value, currentValue }: PreviewPanelProps) {
  const isArray = Array.isArray(value);
  const displayValue = isArray ? value.join(" ") : value;

  const wordCount = displayValue
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Status */}
      <div className="flex items-center justify-between">
        <Badge className="gap-2 px-4 py-2 text-primary bg-gradient-to-r from-purple-500/10 to-blue-500/10">
          <Sparkles className="h-4 w-4 text-purple-500 animate-pulse" />
          AI Result Ready
        </Badge>
        <Badge variant="outline" className="text-xs">
          Confidence 94%
        </Badge>
      </div>

      {/* Before / After */}
      {currentValue && !isArray && (
        <div className="grid grid-cols-[1fr,auto,1fr] items-start gap-4">
          {/* Before */}
          <div className="space-y-2">
            <p className="text-xs uppercase text-muted-foreground">Current</p>
            <div className="p-3 border rounded-lg bg-muted/30">
              <p className="text-xs line-clamp-5 text-muted-foreground">
                {currentValue || "Empty"}
              </p>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center pt-6">
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* After */}
          <div className="space-y-2">
            <p className="text-xs uppercase text-primary">Generated</p>
            <div className="p-3 border border-primary/40 rounded-lg bg-primary/5 animate-in fade-in zoom-in duration-200">
              <p className="text-sm">{value as string}</p>
            </div>
          </div>
        </div>
      )}

      {/* No comparison view */}
      {(!currentValue || isArray) && (
        <div className="p-4 border border-primary/30 rounded-lg bg-card">
          {isArray ? (
            <ul className="space-y-2">
              {(value as string[]).map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="font-medium text-primary">{i + 1}.</span>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="whitespace-pre-wrap text-sm">{value as string}</p>
          )}
        </div>
      )}

      {/* Metadata */}
      {!isArray && (
        <div className="flex items-center justify-between text-xs">
          <Badge variant="secondary">{wordCount} words</Badge>

          {wordCount >= 50 && wordCount <= 300 && (
            <Badge className="gap-1 bg-green-500/10 text-green-600">
              <CheckCircle2 className="h-3 w-3" />
              Ideal length
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
