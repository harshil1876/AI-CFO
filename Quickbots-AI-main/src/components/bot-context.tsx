"use client";

import {
  type ApiKeyRow,
  type BotConfigType,
  type BotType,
  type BotRuntimeSettingsType,
  type BotSettingsType,
  type FullBotType,
} from "@/types";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useMemo,
  useState,
} from "react";

type ChatHistoryEntry = {
  user?: string;
  bot?: string;
  timestamp?: string;
};

type BotContextType = {
  bot: BotType;
  setBot: Dispatch<SetStateAction<BotType>>;

  configs: BotConfigType;
  setConfigs: Dispatch<SetStateAction<BotConfigType>>;

  settings: BotSettingsType;
  setSettings: Dispatch<SetStateAction<BotSettingsType>>;

  runtimeSettings: BotRuntimeSettingsType;
  setRuntimeSettings: Dispatch<SetStateAction<BotRuntimeSettingsType>>;

  api: ApiKeyRow[];
  setApi: Dispatch<SetStateAction<ApiKeyRow[]>>;

  chatHistory: ChatHistoryEntry[];
  setChatHistory: Dispatch<SetStateAction<ChatHistoryEntry[]>>;
};
const BotContext = createContext<BotContextType | null>(null);

export function BotProvider({
  initials,
  children,
}: {
  initials: FullBotType & { chatHistory?: ChatHistoryEntry[] };
  children: React.ReactNode;
}) {
  const [bot, setBot] = useState(initials.bot);
  const [configs, setConfigs] = useState(initials.botConfigs);
  const [settings, setSettings] = useState(initials.botSettings);
  const [api, setApi] = useState<ApiKeyRow[]>(initials.api);
  const [runtimeSettings, setRuntimeSettings] = useState(
    initials.botRuntimeSettings
  );
  const [chatHistory, setChatHistory] = useState<ChatHistoryEntry[]>(
    initials.chatHistory || []
  );

  const values = useMemo<BotContextType>(
    () => ({
      bot,
      setBot,
      configs,
      setConfigs,
      settings,
      setSettings,
      runtimeSettings,
      setRuntimeSettings,
      api,
      setApi,
      chatHistory,
      setChatHistory,
    }),
    [bot, configs, settings, api, runtimeSettings, chatHistory]
  );
  // console.log(
  //   "DATA ONLY",
  //   JSON.stringify(
  //     {
  //       bot: values.bot,
  //       configs: values.configs,
  //       settings: values.settings,
  //       api: values.api,
  //     },
  //     null,
  //     2
  //   )
  // );

  return <BotContext.Provider value={values}>{children}</BotContext.Provider>;
}

function useBot(): BotContextType {
  const ctx = useContext(BotContext);
  if (!ctx) throw new Error("useBot must be used within a <BotProvider>");
  return ctx;
}

export function useBotData() {
  const { bot, setBot } = useBot();
  return { bot, setBot };
}

export function useBotConfigs() {
  const { configs, setConfigs } = useBot();
  return { configs, setConfigs };
}

export function useBotSettings() {
  const { settings, setSettings } = useBot();
  return { settings, setSettings };
}

export function useBotRuntimeSettings() {
  const { runtimeSettings, setRuntimeSettings } = useBot();
  return { runtimeSettings, setRuntimeSettings };
}

export function useBotApi() {
  const { api, setApi } = useBot();
  return { api, setApi };
}

export function useChatHistory() {
  const { chatHistory, setChatHistory } = useBot();
  return { chatHistory, setChatHistory };
}
