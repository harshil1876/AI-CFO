"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/providers/SupabaseProvider";
import { useUser } from "@clerk/nextjs";

import {
  BotProvider,
  useBotConfigs,
  useBotSettings,
  useBotRuntimeSettings,
} from "@/components/bot-context";

import BotManagementDashboard from "@/components/bot-analytics";
import { TabsNavigation } from "@/components/tab-navigation";
import { Spinner } from "@/components/ui/spinner";
import { Toaster } from "@/components/ui/sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type {
  FullBotType,
  BotType,
  BotConfigType,
  BotSettingsType,
  BotRuntimeSettingsType,
  ApiKeyRow,
} from "@/types";

// ------------------------------
// HELPERS
// ------------------------------

async function fetchBot(
  client: NonNullable<ReturnType<typeof useSupabase>["supabase"]>,
  userId: string,
  botId: string
): Promise<FullBotType> {
  const [botRes, cfgRes, setRes, runtimeRes, apiRes] = await Promise.all([
    client
      .from("bots")
      .select()
      .eq("bot_id", botId)
      .eq("user_id", userId)
      .maybeSingle(),
    client.from("bot_configs").select().eq("bot_id", botId).maybeSingle(),
    client.from("bot_settings").select().eq("bot_id", botId).maybeSingle(),
    client
      .from("bot_runtime_settings")
      .select()
      .eq("bot_id", botId)
      .maybeSingle(),
    client.from("api_keys").select().eq("bot_id", botId),
  ]);

  const error =
    botRes.error ||
    cfgRes.error ||
    setRes.error ||
    runtimeRes.error ||
    apiRes.error;

  if (error) throw new Error(error.message);
  if (!botRes.data) throw new Error("Bot not found");

  return {
    bot: botRes.data as BotType,
    botConfigs: (cfgRes.data as BotConfigType) || {},
    botSettings: (setRes.data as BotSettingsType) || {},
    botRuntimeSettings: (runtimeRes.data as BotRuntimeSettingsType) || {},
    api: (apiRes.data || []) as ApiKeyRow[],
  };
}

// ------------------------------
// MAIN COMPONENT
// ------------------------------

export default function BotLayoutClient({
  botId,
  children,
}: {
  botId: string;
  children: React.ReactNode;
}) {
  const { supabase, isReady } = useSupabase();
  const { user } = useUser();
  const [data, setData] = useState<FullBotType | null>(null);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load bot data - wait for system readiness
  useEffect(() => {
    if (!isReady) return;

    const load = async () => {
      if (!supabase || !user) return;

      try {
        const result = await fetchBot(supabase, user.id, botId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, botId]);

  // ------------------------------
  // RENDER STATES
  // ------------------------------

  if (!user || !supabase || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-destructive">Error: {error}</p>
      </div>
    );
  }

  // ------------------------------
  // UI
  // ------------------------------

  return (
    <>
      <div className="bg-background max-w-[90rem] mx-auto overflow-x-hidden w-full min-w-0">
        <BotProvider initials={data}>
          <ContextUpdater botId={botId} />

          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 px-2 sm:px-3 md:px-4 lg:px-6 w-full min-w-0">
            {/* Sidebar */}
            <div className="hidden lg:flex lg:flex-col lg:w-[22rem] xl:w-sm lg:shrink-0">
              <BotManagementDashboard bot={data.bot} />
            </div>

            {/* Page content */}
            <div className="flex-1 min-w-0 space-y-4 sm:space-y-5 md:space-y-6">
              <TabsNavigation
                slug={botId}
                enableMobileAnalytics
                onOpenAnalytics={() => setIsAnalyticsOpen(true)}
              />

              <main className="flex-1 p-2 sm:p-3 md:p-4 w-full min-w-0">
                <div className="max-w-7xl mx-auto w-full min-w-0">{children}</div>
              </main>
            </div>
          </div>

          <Toaster position="bottom-right" duration={2000} richColors />
        </BotProvider>
      </div>

      {/* Analytics modal */}
      <Dialog open={isAnalyticsOpen} onOpenChange={setIsAnalyticsOpen}>
        <DialogContent className="sm:max-w-3xl w-[95vw] max-h-[90vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle>Bot analytics</DialogTitle>
          </DialogHeader>

          <div className="px-4 pb-6 max-h-[80vh] overflow-y-auto">
            <BotManagementDashboard bot={data.bot} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ------------------------------
// CONTEXT UPDATER
// ------------------------------

function ContextUpdater({ botId }: { botId: string }) {
  const { setConfigs } = useBotConfigs();
  const { setSettings } = useBotSettings();
  const { setRuntimeSettings } = useBotRuntimeSettings();

  useEffect(() => {
    const key = `generated_bot_data_${botId}`;
    const raw = sessionStorage.getItem(key);
    if (!raw) return;

    try {
      const data = JSON.parse(raw);
      if (data.bot_configs) setConfigs(data.bot_configs);
      if (data.bot_settings) setSettings(data.bot_settings);
      if (data.bot_runtime_settings)
        setRuntimeSettings(data.bot_runtime_settings);
    } catch {}
    sessionStorage.removeItem(key);
  }, [botId, setConfigs, setSettings, setRuntimeSettings]);

  return null;
}
