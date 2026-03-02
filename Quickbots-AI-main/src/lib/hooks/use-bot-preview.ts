"use client";

import { useSupabase } from "@/providers/SupabaseProvider";
import { useUser } from "@clerk/nextjs";
import { previewSchema } from "@/schema";
import type { PreviewType, BotUiSettingsRow } from "@/types";
import { toCamelCase, toSnakeCase } from "@/types/bot.types";
import { supabaseErrorToMessage } from "@/lib/supabase/error-mapper";
import type { PostgrestError } from "@supabase/supabase-js";

interface ActionResult {
  ok: boolean;
  message: string;
  data: PreviewType | null;
}

export function usePreviewActions() {
  const { supabase, isReady } = useSupabase();
  const { user } = useUser();

  const getPreview = async (botId: string): Promise<ActionResult> => {
    // Wait for system to be ready
    if (!isReady || !supabase) {
      return {
        ok: false,
        message: "System is initializing. Please wait...",
        data: null,
      };
    }

    // Check authentication after system is ready
    if (!user) {
      return {
        ok: false,
        message: "User authentication required",
        data: null,
      };
    }

    try {
      // Verify bot ownership
      const { data: bot, error: botError } = await supabase
        .from("bots")
        .select("bot_id")
        .eq("bot_id", botId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (botError || !bot) {
        return {
          ok: false,
          message: "Bot not found or access denied",
          data: null,
        };
      }

      const { data, error } = await supabase
        .from("bot_ui_settings")
        .select("*")
        .eq("bot_id", botId)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("GetPreview →", error);
        return {
          ok: false,
          message: supabaseErrorToMessage(error as PostgrestError),
          data: null,
        };
      }

      if (!data) {
        return {
          ok: true,
          message: "No preview data found",
          data: null,
        };
      }

      return {
        ok: true,
        message: "Preview settings retrieved",
        data: toCamelCase(data as BotUiSettingsRow),
      };
    } catch (error) {
      console.error("Error fetching preview:", error);
      return {
        ok: false,
        message: "Failed to fetch preview settings",
        data: null,
      };
    }
  };

  const updatePreview = async (
    botId: string,
    formData: PreviewType
  ): Promise<ActionResult> => {
    // Wait for system to be ready
    if (!isReady || !supabase) {
      return {
        ok: false,
        message: "System is initializing. Please wait...",
        data: null,
      };
    }

    // Check authentication after system is ready
    if (!user) {
      return {
        ok: false,
        message: "User authentication required",
        data: null,
      };
    }

    try {
      const parsed = previewSchema.safeParse(formData);

      if (!parsed.success) {
        return {
          ok: false,
          message: parsed.error.issues[0]?.message || "Invalid input",
          data: null,
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
        return {
          ok: false,
          message: "Bot not found or access denied",
          data: null,
        };
      }

      // Convert camelCase to snake_case for database
      const snakeCaseData = toSnakeCase(parsed.data);

      // Whitelist allowed fields only
      const allowed = [
        "chatbot_name",
        "welcome_message",
        "quick_questions",
        "support_info",
        "position",
        "auto_open_delay_ms",
        "auto_greet_on_open",
        "ask_email_before_chat",
        "persist_chat",
        "show_timestamps",
      ];

      const dbData = Object.fromEntries(
        Object.entries(snakeCaseData).filter(([k]) => allowed.includes(k))
      );

      // Only UPDATE - no INSERT
      const { data: updated, error } = await supabase
        .from("bot_ui_settings")
        .update(dbData)
        .eq("bot_id", botId)
        .select("*")
        .single();

      if (error) {
        console.error("UpdatePreview →", error);
        return {
          ok: false,
          message: supabaseErrorToMessage(error as PostgrestError),
          data: null,
        };
      }

      if (!updated) {
        return {
          ok: false,
          message: "No settings found to update. Please create settings first.",
          data: null,
        };
      }

      return {
        ok: true,
        message: "Preview settings updated successfully",
        data: toCamelCase(updated as BotUiSettingsRow),
      };
    } catch (error) {
      console.error("Error updating preview:", error);
      return {
        ok: false,
        message: "Failed to update preview settings",
        data: null,
      };
    }
  };

  return { getPreview, updatePreview };
}
