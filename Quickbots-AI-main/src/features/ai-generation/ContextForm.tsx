"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { FieldType } from "@/types/ai.types";

interface BotContextData {
  bot_configs?: {
    persona?: string | null;
    botthesis?: string | null;
    greetings?: string | null;
    fallback_message?: string | null;
  };
  bot_settings?: {
    business_name?: string | null;
    business_type?: string | null;
    business_description?: string | null;
    product_name?: string | null;
    product_description?: string | null;
  };
  bot_ui_settings?: {
    welcome_message?: string | null;
    chatbot_name?: string | null;
  };
}

interface ContextFormProps {
  field: FieldType;
  context: { userHint?: string };
  onContextChange: (context: { userHint?: string }) => void;
  botContext: BotContextData | null;
  disabled?: boolean;
}

interface ContextBadge {
  label: string;
  value: string;
}

export function ContextForm({
  field,
  context,
  onContextChange,
  botContext,
  disabled = false,
}: ContextFormProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [manualText, setManualText] = useState<string>(context.userHint || "");

  // Get the combined text for display
  const getCombinedText = () => {
    const selectedText = selectedOptions.join(" and ");
    return manualText.trim()
      ? selectedText
        ? `${selectedText} ${manualText}`
        : manualText
      : selectedText;
  };

  // Update context when selected options or manual text changes
  useEffect(() => {
    const selectedText = selectedOptions.join(" and ");
    const finalHint = manualText.trim()
      ? selectedText
        ? `${selectedText} ${manualText}`
        : manualText
      : selectedText;
    onContextChange({ userHint: finalHint });
  }, [selectedOptions, manualText, onContextChange]);

  const handleInputChange = (value: string) => {
    const selectedText = selectedOptions.join(" and ");

    // If the value starts with the selected text, extract the manual part
    if (selectedText && value.startsWith(selectedText)) {
      const remaining = value.slice(selectedText.length).trim();
      setManualText(remaining);
    } else {
      // If it doesn't match, treat the whole thing as manual text
      // and clear selected options if they don't appear in the text
      const hasSelectedOptions = selectedOptions.some((opt) =>
        value.includes(opt)
      );
      if (!hasSelectedOptions && selectedOptions.length > 0) {
        // User removed selected options, clear them
        setSelectedOptions([]);
        setManualText(value);
      } else {
        setManualText(value);
      }
    }
  };

  const handleQuickClick = (option: string) => {
    if (!selectedOptions.includes(option)) {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  const handleRemoveOption = (option: string) => {
    setSelectedOptions(selectedOptions.filter((opt) => opt !== option));
  };

  // Quick click options based on field type
  const getQuickOptions = (): string[] => {
    const commonOptions = [
      "Make it short",
      "Make it more precise",
      "Keep it friendly",
      "Keep it professional",
      "Make it concise",
    ];

    // Field-specific options
    const fieldOptions: Partial<Record<FieldType, string[]>> = {
      persona: [
        "Add more personality",
        "Make it more conversational",
        "Emphasize expertise",
      ],
      botthesis: [
        "Focus on mission",
        "Highlight value proposition",
        "Make it inspiring",
      ],
      greetings: ["Make it warm", "Keep it brief", "Add enthusiasm"],
      welcome_message: [
        "Make it welcoming",
        "Keep it simple",
        "Add helpful context",
      ],
      fallback_message: [
        "Make it helpful",
        "Keep it polite",
        "Suggest alternatives",
      ],
      business_description: [
        "Highlight key features",
        "Focus on benefits",
        "Make it compelling",
      ],
      product_description: [
        "Emphasize unique selling points",
        "Keep it clear",
        "Make it engaging",
      ],
    };

    return [...commonOptions, ...(fieldOptions[field] || [])];
  };

  const quickOptions = getQuickOptions();

  // Build context badges from bot data
  const contextBadges: ContextBadge[] = [];

  if (botContext) {
    const settings = botContext.bot_settings;
    const configs = botContext.bot_configs;
    const uiSettings = botContext.bot_ui_settings;

    // Business context
    if (settings?.business_name) {
      contextBadges.push({
        label: "Business",
        value: settings.business_name,
      });
    }
    if (settings?.product_name) {
      contextBadges.push({
        label: "Product",
        value: settings.product_name,
      });
    }
    if (settings?.business_type) {
      contextBadges.push({
        label: "Type",
        value: settings.business_type,
      });
    }
    if (settings?.business_description) {
      contextBadges.push({
        label: "Business Info",
        value: settings.business_description,
      });
    }
    if (settings?.product_description) {
      contextBadges.push({
        label: "Product Info",
        value: settings.product_description,
      });
    }

    // Config context
    if (configs?.persona) {
      contextBadges.push({
        label: "Persona",
        value: configs.persona,
      });
    }
    if (configs?.greetings) {
      contextBadges.push({
        label: "Greetings",
        value: configs.greetings,
      });
    }

    // UI context
    if (uiSettings?.welcome_message) {
      contextBadges.push({
        label: "Welcome",
        value: uiSettings.welcome_message,
      });
    }
  }

  const truncateText = (text: string, maxLength: number = 50): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="space-y-6">
      {/* Context Badges Display */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <p className="text-sm font-medium">
            QuickBots AI will use this context
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          {contextBadges.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {contextBadges.map((badge, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="px-3 py-1.5 text-xs font-normal max-w-full"
                >
                  <span className="font-semibold mr-1.5">{badge.label}:</span>
                  <span className="truncate">
                    {truncateText(badge.value, 40)}
                  </span>
                </Badge>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className="px-3 py-1.5 text-xs font-normal"
              >
                <span className="font-semibold mr-1.5">Field:</span>
                <span>{field}</span>
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Required User Instructions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="user-hint" className="text-sm font-medium">
            What would you like to generate? *
          </Label>
        </div>

        {/* Quick Click Options */}
        <div className="flex flex-wrap gap-2">
          {quickOptions.map((option, index) => (
            <Button
              key={index}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickClick(option)}
              disabled={disabled || selectedOptions.includes(option)}
              className="h-8 text-xs"
            >
              {option}
            </Button>
          ))}
        </div>

        {/* Selected Options as Chips */}
        {selectedOptions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {selectedOptions.map((option, index) => (
              <div key={index} className="flex items-center gap-1">
                {index > 0 && (
                  <span className="text-sm text-muted-foreground px-1">
                    and
                  </span>
                )}
                <Badge
                  variant="secondary"
                  className={`px-3 py-1.5 text-xs font-normal flex items-center gap-1.5 ${
                    disabled ? "opacity-60" : ""
                  }`}
                >
                  <span>{option}</span>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(option)}
                      className="ml-1 rounded-full hover:bg-secondary-foreground/20 p-0.5 transition-colors"
                      aria-label={`Remove ${option}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              </div>
            ))}
          </div>
        )}

        <Textarea
          id="user-hint"
          placeholder={
            selectedOptions.length > 0
              ? "Give further instructions if you want (optional)"
              : "Type your instructions or click quick options above"
          }
          value={selectedOptions.length > 0 ? manualText : getCombinedText()}
          onChange={(e) => handleInputChange(e.target.value)}
          className="min-h-[100px] resize-none"
          required={selectedOptions.length === 0 && !manualText.trim()}
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground">
          {selectedOptions.length > 0
            ? "Selected options are shown above. You can add additional custom instructions below."
            : "Click the quick options above to add common instructions, or type your own custom instructions."}
        </p>
      </div>
    </div>
  );
}
