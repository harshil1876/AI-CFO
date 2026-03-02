"use client";

import { useSupabase } from "@/providers/SupabaseProvider";
import { useUser } from "@clerk/nextjs";
import { botConfigSchema } from "@/schema";
import type { BotConfigType } from "@/types";
import { supabaseErrorToMessage } from "@/lib/supabase/error-mapper";
import type { Result } from "@/types/result";

export function useConfigActions() {
  const { supabase, isReady } = useSupabase();
  const { user } = useUser();

  const updateBotConfig = async (
    botId: string,
    config: BotConfigType
  ): Promise<Result<BotConfigType>> => {
    // Wait for system to be ready
    if (!isReady || !supabase) {
      return {
        ok: false,
        message: "System is initializing. Please wait...",
      };
    }

    // Check authentication after system is ready
    if (!user) {
      return {
        ok: false,
        message: "User authentication required",
      };
    }

    // validate
    const parsed = botConfigSchema.safeParse(config);

    if (!parsed.success) {
      return {
        ok: false,
        message: parsed.error.issues[0]?.message ?? "Invalid input",
      };
    }

    // Verify bot ownership
    const { data: bot, error: botError } = await supabase
      .from("bots")
      .select("bot_id")
      .eq("bot_id", botId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (botError || !bot) {
      return { ok: false, message: "Bot not found or access denied" };
    }

    // db call
    const { data, error } = await supabase
      .from("bot_configs")
      .update(parsed.data)
      .eq("bot_id", botId)
      .select()
      .maybeSingle();

    if (error) {
      console.error("UpdateConfigs →", error);
      return { ok: false, message: supabaseErrorToMessage(error) };
    }

    // Sync welcome_message to bot_ui_settings if greetings changed
    if (parsed.data.greetings !== undefined) {
      await supabase
        .from("bot_ui_settings")
        .update({ welcome_message: parsed.data.greetings })
        .eq("bot_id", botId);
    }

    // Trigger search ingestion (non-blocking, best-effort)
    // Fire and forget - failures don't affect the response
    fetch("/api/vector/ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ botId }),
    }).catch((err) => {
      // Silently handle errors - this is best-effort
      console.error("[Search Ingestion] Background trigger failed:", err);
    });

    return { ok: true, data: data };
  };

  return { updateBotConfig };
}
