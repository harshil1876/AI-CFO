"use server";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getSearchClient } from "./client";

const INDEX_NAME = "bot-configs";

export async function ingestBotContent(
  botId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`[Search][Ingest] Upserting config for bot ${botId}`);

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("bot_configs")
      .select("persona, botthesis")
      .eq("bot_id", botId)
      .single();

    if (error || !data) {
      return {
        success: false,
        error: `Failed to fetch bot config`,
      };
    }

    const search = getSearchClient();
    if (!search) {
      console.warn(
        "[Search][Ingest] Search not configured, skipping ingestion"
      );
      return { success: false, error: "Search not configured" };
    }

    const index = search.index<
      { text: string },
      { botId: string; field: string }
    >(INDEX_NAME);

    if (data.persona?.trim()) {
      await index.upsert({
        id: `bot:${botId}:persona`,
        content: { text: data.persona.trim() },
        metadata: { botId, field: "persona" },
      });
    }

    if (data.botthesis?.trim()) {
      await index.upsert({
        id: `bot:${botId}:botthesis`,
        content: { text: data.botthesis.trim() },
        metadata: { botId, field: "botthesis" },
      });
    }

    console.log("[Search][Ingest] Completed");
    return { success: true };
  } catch (err) {
    console.error("[Search][Ingest] Fatal error:", err);
    return { success: false };
  }
}
