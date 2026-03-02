"server only";

import type { SupabaseClient } from "@supabase/supabase-js";

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

export type ChatLogInsert = {
  bot_id: string;
  user_session_id: string;
  message_role: "user" | "assistant" | "system";
  message: string;
  chat_history: Array<{
    role: string;
    content: string;
    timestamp: string;
  }>;
};

/**
 * Log a chat message to the bot_chat_logs table
 * Includes retry mechanism for schema cache delays
 */
export async function logChat({
  supabase,
  botId,
  sessionId,
  role,
  message,
  history,
  tokensUsed,
  responseTimeMs,
  model,
  isError,
}: {
  supabase: SupabaseClient;
  botId: string;
  sessionId: string;
  role: "user" | "assistant" | "system";
  message: string;
  history: Array<{
    role: string;
    content: string;
    timestamp: string;
  }>;
  tokensUsed?: number;
  responseTimeMs?: number;
  model?: string;
  isError?: boolean;
}): Promise<{ success: boolean; error?: unknown }> {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const { error } = await supabase
        .from("bot_chat_logs")
        .insert({
          bot_id: botId,
          user_session_id: sessionId,
          message_role: role,
          message: message,
          chat_history: history,
          tokens_used: tokensUsed ?? null,
          response_time_ms: responseTimeMs ?? null,
          model: model ?? null,
          error: isError ?? false,
        })
        .select()
        .single();

      if (error) {
        // Check if it's a schema cache error (common in Supabase)
        if (
          error.message?.includes("relation") ||
          error.message?.includes("column") ||
          error.code === "PGRST116"
        ) {
          retryCount++;
          if (retryCount < maxRetries) {
            // Wait before retrying (exponential backoff)
            await new Promise((resolve) =>
              setTimeout(resolve, Math.pow(2, retryCount) * 100)
            );
            continue;
          }
        }

        console.error("Failed to log chat:", error);
        return { success: false, error };
      }

      return { success: true };
    } catch (err) {
      retryCount++;
      if (retryCount < maxRetries) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, retryCount) * 100)
        );
        continue;
      }

      console.error("Exception while logging chat:", err);
      return { success: false, error: err };
    }
  }

  return {
    success: false,
    error: new Error("Max retries exceeded for chat logging"),
  };
}

/**
 * Fetch chat logs for a specific bot
 */
export async function getChatLogs(
  supabase: SupabaseClient,
  botId: string,
  limit = 100
): Promise<{ data: ChatLogRow[] | null; error: unknown }> {
  try {
    const { data, error } = await supabase
      .from("bot_chat_logs")
      .select("*")
      .eq("bot_id", botId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return { data: null, error };
    }

    return { data: data as ChatLogRow[], error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Fetch chat logs grouped by session ID (conversations)
 */
export async function getChatLogsBySession(
  supabase: SupabaseClient,
  botId: string
): Promise<{
  data: Record<string, ChatLogRow[]> | null;
  error: unknown;
}> {
  try {
    const { data, error } = await supabase
      .from("bot_chat_logs")
      .select("*")
      .eq("bot_id", botId)
      .order("created_at", { ascending: true });

    if (error) {
      return { data: null, error };
    }

    // Group by user_session_id
    const grouped = (data as ChatLogRow[]).reduce((acc, log) => {
      const sessionId = log.user_session_id;
      if (!acc[sessionId]) {
        acc[sessionId] = [];
      }
      acc[sessionId].push(log);
      return acc;
    }, {} as Record<string, ChatLogRow[]>);

    return { data: grouped, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}
