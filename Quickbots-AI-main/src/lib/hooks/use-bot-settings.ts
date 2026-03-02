"use client";

import { useSupabase } from "@/providers/SupabaseProvider";
import { useUser } from "@clerk/nextjs";
import { botSettingsSchema } from "@/schema";
import type { BotSettingsType } from "@/types";
import { supabaseErrorToMessage } from "@/lib/supabase/error-mapper";
import type { Result } from "@/types/result";

export function useSettingsActions() {
  const { supabase, isReady } = useSupabase();
  const { user } = useUser();

  const updateBotSettings = async (
    botId: string,
    config: BotSettingsType
  ): Promise<Result<BotSettingsType>> => {
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
    const parsed = botSettingsSchema.safeParse(config);

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
      .from("bot_settings")
      .update(parsed.data)
      .eq("bot_id", botId)
      .select()
      .maybeSingle();

    if (error) {
      console.error("UpdateSettings →", error);
      return { ok: false, message: supabaseErrorToMessage(error) };
    }

    // Sync to bot_ui_settings if relevant fields changed
    const uiUpdates: Record<string, unknown> = {};
    if (parsed.data.product_name !== undefined) {
      uiUpdates.chatbot_name = parsed.data.product_name;
    }
    if (parsed.data.support_email !== undefined) {
      uiUpdates.support_info = parsed.data.support_email;
    }

    if (Object.keys(uiUpdates).length > 0) {
      await supabase
        .from("bot_ui_settings")
        .update(uiUpdates)
        .eq("bot_id", botId);
    }

    return { ok: true, data: data };
  };

  return { updateBotSettings };
}
