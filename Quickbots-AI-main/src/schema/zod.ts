import { z } from "zod";
import { POSITION, API_KEY_PERMISSIONS } from "./constants";

/* ---------------------------------------------
   Bot Schema
--------------------------------------------- */
export const botSchema = z.object({
  name: z.string().min(1, "Projects's name is required!"),
  description: z.string().min(1, "Projects's description is required!"),
});

/* ---------------------------------------------
   Bot Config Schema (Form validation)
--------------------------------------------- */
export const botConfigSchema = z.object({
  persona: z.string().min(1, "Persona is required"),
  botthesis: z.string().min(1, "Bot thesis is required"),
  greetings: z.string().optional().nullable(),
  fallback_message: z.string().optional().nullable(),
  version: z.number().default(1),
});

/* ---------------------------------------------
   Bot Config Schema (DB validation - strict)
--------------------------------------------- */
export const BotConfigsSchema = z.object({
  bot_id: z.string().min(1),
  persona: z.string().nullable(),
  botthesis: z.string().nullable(),
  greetings: z.string().nullable(),
  fallback_message: z.string().nullable(),
});

/* ---------------------------------------------
   Bot Settings Schema (Form validation)
--------------------------------------------- */
export const botSettingsSchema = z.object({
  business_name: z.string().min(1, "Business name is required"),
  business_type: z.string().min(1, "Business type is required"),
  business_description: z.string().optional().nullable(),
  product_name: z.string().min(1, "Product name is required"),
  product_description: z.string().optional().nullable(),
  support_email: z
    .string()
    .email("Invalid support email format")
    .nullable()
    .transform((val) => val ?? null),
  contacts: z.string().optional().nullable(),
  supported_languages: z
    .array(z.string().min(2))
    .nonempty("At least one language must be supported")
    .default(["en"]),
});

/* ---------------------------------------------
   Bot Settings Schema (DB validation - strict)
--------------------------------------------- */
export const BotSettingsSchema = z.object({
  bot_id: z.string().min(1),
  business_name: z.string().nullable(),
  business_type: z.string().nullable(),
  business_description: z.string().nullable(),
  product_name: z.string().nullable(),
  product_description: z.string().nullable(),
  support_email: z.string().nullable(),
  contacts: z.string().nullable(),
  supported_languages: z.array(z.string()).nullable(),
});

/* ---------------------------------------------
   Bot Runtime Settings Schema (Form validation)
   Note: Only read-only fields for UI display
--------------------------------------------- */
export const botRuntimeSettingsSchema = z.object({
  rate_limit_per_min: z.coerce.number().min(1).max(1000).default(60),
  token_quota: z.coerce.number().min(0).default(50000),
  api_calls_this_month: z.coerce.number().min(0).default(0),
});

/* ---------------------------------------------
   Bot Runtime Settings Schema (DB validation - strict)
   Note: Only read-only fields for UI display
--------------------------------------------- */
export const BotRuntimeSchema = z.object({
  bot_id: z.string().min(1),
  rate_limit_per_min: z.number().nullable(),
  token_quota: z.number().nullable(),
  api_calls_this_month: z.number().nullable(),
});

/* ---------------------------------------------
   Preview/UI Settings Schema (Frontend - camelCase)
   Matches the new simplified bot_ui_settings table
--------------------------------------------- */
export const previewSchema = z.object({
  chatbotName: z
    .string()
    .min(1, "Chatbot name is required")
    .max(25, "Chatbot name cannot be greater than 25 letters."),
  welcomeMessage: z.string().min(1, "Welcome message is required"),
  quickQuestions: z.array(z.string()).max(5, "Maximum 5 quick questions"),
  supportInfo: z.string().nullable(),
  position: z.enum(POSITION),
  autoOpenDelayMs: z.number().min(0, "Delay must be 0 or greater"),
  autoGreetOnOpen: z.boolean(),
  askEmailBeforeChat: z.boolean(),
  persistChat: z.boolean(),
  showTimestamps: z.boolean(),
});

/* ---------------------------------------------
   API Key Schema
--------------------------------------------- */
export const apiKeySchema = z.object({
  name: z.string().min(2, "Key name must be at least 2 characters"),
  permissions: z
    .array(z.enum(API_KEY_PERMISSIONS))
    .refine((value) => value.length > 0, {
      message: "You must select at least one environment (prod or dev).",
    }),
});

/* ---------------------------------------------
   Full Bot Schema (combined)
--------------------------------------------- */
export const fullBotSchema = z.object({
  bot_configs: botConfigSchema,
  bot_settings: botSettingsSchema,
  bot_runtime_settings: botRuntimeSettingsSchema,
});
