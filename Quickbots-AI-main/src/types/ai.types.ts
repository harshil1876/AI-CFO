/**
 * AI-related types for field generation and context building
 */

export type FieldType =
  | "persona"
  | "botthesis"
  | "greetings"
  | "fallback_message"
  | "business_name"
  | "business_type"
  | "business_description"
  | "product_name"
  | "product_description"
  | "quick_questions"
  | "welcome_message";

export interface FieldContext {
  // Existing bot data
  business_name?: string;
  business_type?: string;
  business_description?: string;
  product_name?: string;
  product_description?: string;
  brand_voice?: string;
  target_audience?: string;
  problem?: string;

  // User-provided context for this field
  userContext?: string;

  // Additional context
  currentValue?: string;
}

export interface BotData {
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
    quick_questions?: string[] | null;
  };
}

export interface KnownContext {
  business_name?: string | null;
  product_name?: string | null;
  business_type?: string | null;
  business_description?: string | null;
  product_description?: string | null;
  persona?: string | null;
  greetings?: string | null;
  welcome_message?: string | null;
}

export interface GenerationContext {
  known_context: KnownContext;
  user_hint?: string;
}

