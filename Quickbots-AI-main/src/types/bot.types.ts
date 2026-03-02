import type { z } from "zod";
import {
  botSchema,
  botConfigSchema,
  botSettingsSchema,
  botRuntimeSettingsSchema,
  previewSchema,
  apiKeySchema,
  fullBotSchema,
  BotConfigsSchema,
  BotSettingsSchema,
  BotRuntimeSchema,
} from "@/schema/zod";
import type { Position, ApiKeyPermission } from "@/schema/constants";

/* ---------------------------------------------
   Bot Types
--------------------------------------------- */
export type BotFormInputType = z.infer<typeof botSchema>;

export type BotType = {
  id?: number;
  bot_id?: string;
  name: string;
  description: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
};

/* ---------------------------------------------
   Bot Config Types
--------------------------------------------- */
export type BotConfigType = z.infer<typeof botConfigSchema>;
export type BotConfigs = z.infer<typeof BotConfigsSchema>;

/* ---------------------------------------------
   Bot Settings Types
--------------------------------------------- */
export type BotSettingsType = z.infer<typeof botSettingsSchema>;
export type BotSettings = z.infer<typeof BotSettingsSchema>;

/* ---------------------------------------------
   Bot Runtime Settings Types
--------------------------------------------- */
export type BotRuntimeSettingsType = z.infer<typeof botRuntimeSettingsSchema>;
export type BotRuntime = z.infer<typeof BotRuntimeSchema>;

/* ---------------------------------------------
   Preview/UI Settings Types
--------------------------------------------- */
export type PreviewType = z.infer<typeof previewSchema> & {
  updatedAt?: string; // Not in schema, but included from DB
};

// Database row type (snake_case) - matches new simplified table
export interface BotUiSettingsRow {
  id?: number;
  bot_id: string;
  chatbot_name: string;
  welcome_message: string;
  quick_questions: string[];
  support_info: string | null;
  position: string;
  auto_open_delay_ms: number;
  auto_greet_on_open: boolean;
  ask_email_before_chat: boolean;
  persist_chat: boolean;
  show_timestamps: boolean;
  created_at?: string;
  updated_at: string;
}

/* ---------------------------------------------
   API Key Types
--------------------------------------------- */
export type ApiKeyFormType = z.infer<typeof apiKeySchema>;

export type ApiKeyRow = {
  id: number;
  bot_id: string;
  user_id: string;
  name: string;
  token_hash: string;
  permissions: ApiKeyPermission[];
  created_at: string;
  api_id: string;
};

/* ---------------------------------------------
   Full Bot Types
--------------------------------------------- */
export type FullBotPayload = z.infer<typeof fullBotSchema>;

/**
 * Unified bot configuration type
 * This is the canonical type for a complete bot profile
 */
export interface BotConfigFull {
  bot_id: string;
  config: BotConfigs;
  settings: BotSettings;
  runtime: BotRuntime;
}

export interface FullBotType {
  bot: BotType;
  botConfigs: BotConfigType;
  botSettings: BotSettingsType;
  botRuntimeSettings: BotRuntimeSettingsType;
  api: ApiKeyRow[];
}

/* ---------------------------------------------
   Preview Converter Functions
--------------------------------------------- */
export function toCamelCase(dbRow: BotUiSettingsRow): PreviewType {
  return {
    chatbotName: dbRow.chatbot_name,
    welcomeMessage: dbRow.welcome_message,
    quickQuestions: dbRow.quick_questions || [],
    supportInfo: dbRow.support_info,
    position: dbRow.position as Position,
    autoOpenDelayMs: dbRow.auto_open_delay_ms,
    autoGreetOnOpen: dbRow.auto_greet_on_open,
    askEmailBeforeChat: dbRow.ask_email_before_chat,
    persistChat: dbRow.persist_chat,
    showTimestamps: dbRow.show_timestamps,
    updatedAt: dbRow.updated_at,
  };
}

export function toSnakeCase(formData: PreviewType): Partial<BotUiSettingsRow> {
  // Filter empty strings from arrays
  const filteredQuickQuestions = formData.quickQuestions.filter(
    (q) => q.trim() !== ""
  );

  return {
    chatbot_name: formData.chatbotName,
    welcome_message: formData.welcomeMessage,
    quick_questions: filteredQuickQuestions,
    support_info: formData.supportInfo || null,
    position: formData.position,
    auto_open_delay_ms: formData.autoOpenDelayMs,
    auto_greet_on_open: formData.autoGreetOnOpen,
    ask_email_before_chat: formData.askEmailBeforeChat,
    persist_chat: formData.persistChat,
    show_timestamps: formData.showTimestamps,
  };
}

/* ---------------------------------------------
   Chat Log Types
--------------------------------------------- */
export type ChatLogRow = {
  id: number;
  bot_id: string;
  user_session_id: string;
  message_role: "user" | "assistant" | "system";
  message: string;
  chat_history: Array<{
    role: string;
    content: string;
    timestamp: string;
  }>;
  created_at: string;
};
