"use client";

import { useSupabase } from "@/providers/SupabaseProvider";
import { useUser } from "@clerk/nextjs";
import { botRuntimeSettingsSchema } from "@/schema";
import type { BotRuntimeSettingsType } from "@/types";
import { supabaseErrorToMessage } from "@/lib/supabase/error-mapper";
import type { Result } from "@/types/result";

export function useRuntimeActions() {
  const { supabase, isReady } = useSupabase();
  const { user } = useUser();

  const updateBotRuntimeSettings = async (
    botId: string,
    config: BotRuntimeSettingsType
  ): Promise<Result<BotRuntimeSettingsType>> => {
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
    const parsed = botRuntimeSettingsSchema.safeParse(config);

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
      .from("bot_runtime_settings")
      .update(parsed.data)
      .eq("bot_id", botId)
      .select()
      .maybeSingle();

    if (error) {
      console.error("UpdateSettings →", error);
      return { ok: false, message: supabaseErrorToMessage(error) };
    }

    return { ok: true, data: data };
  };

  return { updateBotRuntimeSettings };
}
