import type {
  BotConfigType,
  BotRuntimeSettingsType,
  BotSettingsType,
} from "./bot.types";

export type ApiKeyCache = {
  api_id: string;
  permissions: string[];
  name: string;
};

export type BotProfile = {
  config: BotConfigType;
  runtime_settings: BotRuntimeSettingsType;
  settings: BotSettingsType;
  fetchedAt: number;
};
