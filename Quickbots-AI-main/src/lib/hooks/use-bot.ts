"use client";

import { useSupabase } from "@/providers/SupabaseProvider";
import { useUser } from "@clerk/nextjs";
import { supabaseErrorToMessage } from "@/lib/supabase/error-mapper";
import { botSchema } from "@/schema";
import type { BotType } from "@/types";
import type { PostgrestError } from "@supabase/supabase-js";
import type { Result } from "@/types/result";
import { getDefaultBotData } from "@/lib/utils";

export function useBotActions() {
  const { supabase, isReady } = useSupabase();
  const { user } = useUser();

  async function addBot(
    name: string,
    description: string
  ): Promise<Result<BotType>> {
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

    // Check bot limit (max 2 bots per user)
    const { count, error: countError } = await supabase
      .from("bots")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (countError) {
      console.error("Count Bots Error →", countError);
      return {
        ok: false,
        message: "Failed to verify bot limit",
      };
    }

    if (count !== null && count >= 2) {
      return {
        ok: false,
        message:
          "Bot limit reached. You can create a maximum of 2 bots per account.",
      };
    }

    const parsed = botSchema.safeParse({ name, description });

    if (!parsed.success) {
      return {
        ok: false,
        message: parsed.error.issues[0]?.message ?? "Invalid input",
      };
    }

    const { data, error } = await supabase
      .from("bots")
      .insert({
        ...parsed.data,
        user_id: user.id,
      })
      .select("*")
      .maybeSingle();

    if (error) {
      console.error("AddBot →", error);
      return {
        ok: false,
        message: supabaseErrorToMessage(error as PostgrestError),
      };
    }

    // Insert default configuration data
    if (data) {
      const defaults = getDefaultBotData();

      try {
        await Promise.all([
          supabase.from("bot_configs").insert({
            bot_id: data.bot_id,
            ...defaults.bot_configs,
          }),
          supabase.from("bot_settings").insert({
            bot_id: data.bot_id,
            ...defaults.bot_settings,
          }),
          supabase.from("bot_runtime_settings").insert({
            bot_id: data.bot_id,
            ...defaults.bot_runtime_settings,
          }),
          supabase.from("bot_ui_settings").insert({
            bot_id: data.bot_id,
            ...defaults.bot_ui_settings,
          }),
        ]);
      } catch (e) {
        console.error("Default insert error →", e);
      }
    }

    return { ok: true, data };
  }

  async function getBots(): Promise<Result<BotType[]>> {
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

    const { error, data } = await supabase
      .from("bots")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.error("Get All Bots →", error);
      return {
        ok: false,
        message: supabaseErrorToMessage(error as PostgrestError),
      };
    }

    return { ok: true, data: data as BotType[] };
  }

  async function deleteBot(bot_id: string): Promise<Result<null>> {
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

    const { data: bot, error: botError } = await supabase
      .from("bots")
      .select("bot_id")
      .eq("bot_id", bot_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (botError || !bot) {
      return {
        ok: false,
        message: "Bot not found or access denied",
      };
    }

    const { error } = await supabase.from("bots").delete().eq("bot_id", bot_id);

    if (error) {
      console.error("DeleteBot →", error);
      return {
        ok: false,
        message: supabaseErrorToMessage(error as PostgrestError),
      };
    }

    return { ok: true, data: null };
  }

  async function deleteAllBots(): Promise<Result<null>> {
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

    const { error } = await supabase
      .from("bots")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      console.error("DeleteAllBots →", error);
      return {
        ok: false,
        message: supabaseErrorToMessage(error as PostgrestError),
      };
    }

    return { ok: true, data: null };
  }

  return {
    addBot,
    getBots,
    deleteBot,
    deleteAllBots,
    isReady,
  };
}
