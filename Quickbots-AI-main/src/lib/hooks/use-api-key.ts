"use client";

import { useSupabase } from "@/providers/SupabaseProvider";
import { useUser } from "@clerk/nextjs";
import { apiKeySchema } from "@/schema";
import type { ApiKeyRow } from "@/types";
import { supabaseErrorToMessage } from "@/lib/supabase/error-mapper";
import type { Result } from "@/types/result";

export function useApiKeyActions() {
  const { supabase, isReady } = useSupabase();
  const { user } = useUser();

  const createApiKey = async (
    bot_id: string,
    name: string,
    permissions: string[]
  ): Promise<Result<ApiKeyRow & { raw_token: string }>> => {
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

    const parsed = apiKeySchema.safeParse({ name, permissions });
    if (!parsed.success) {
      return {
        ok: false,
        message: parsed.error.issues[0]?.message || "Invalid input",
      };
    }

    // Verify bot ownership
    const { data: bot, error: botError } = await supabase
      .from("bots")
      .select("bot_id")
      .eq("bot_id", bot_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (botError || !bot) {
      return { ok: false, message: "Bot not found or access denied" };
    }

    const { count, error: countErr } = await supabase
      .from("api_keys")
      .select("*", { count: "exact", head: true })
      .eq("bot_id", bot_id);

    if (countErr) {
      return { ok: false, message: supabaseErrorToMessage(countErr!) };
    }

    if ((count ?? 0) > 3) {
      return {
        ok: false,
        message: "You can only have a maximum of 3 API keys per bot.",
      };
    }

    // Generate raw API key: 32 random bytes encoded as base64url
    const rawTokenBytes = crypto.getRandomValues(new Uint8Array(32));
    const rawToken = btoa(String.fromCharCode(...rawTokenBytes))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

    // Hash the raw token using SHA-256 (hex encoding for storage)
    const encoder = new TextEncoder();
    const data = encoder.encode(rawToken);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const tokenHash = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const { data: insertedData, error } = await supabase
      .from("api_keys")
      .insert({
        bot_id,
        name: parsed.data.name,
        permissions: parsed.data.permissions,
        token_hash: tokenHash,
      })
      .select()
      .maybeSingle();

    if (error) {
      return { ok: false, message: supabaseErrorToMessage(error!) };
    }

    // Return the API key row with the raw token (shown once to user)
    return {
      ok: true,
      data: {
        ...insertedData,
        // Include raw token in response (shown once, never stored)
        raw_token: rawToken,
      } as ApiKeyRow & { raw_token: string },
    };
  };

  const deleteApiKey = async (api_id: string): Promise<Result<null>> => {
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

    // First, get the API key to verify ownership via bot
    const { data: apiKey, error: fetchError } = await supabase
      .from("api_keys")
      .select("bot_id, token_hash")
      .eq("api_id", api_id)
      .maybeSingle();

    if (fetchError || !apiKey) {
      return { ok: false, message: "API key not found" };
    }

    // Verify bot ownership
    const { data: bot, error: botError } = await supabase
      .from("bots")
      .select("bot_id")
      .eq("bot_id", apiKey.bot_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (botError || !bot) {
      return { ok: false, message: "Access denied" };
    }

    // Delete the API key
    const { error } = await supabase
      .from("api_keys")
      .delete()
      .eq("api_id", api_id)
      .select("*");

    if (error) {
      console.error("Error deleting API key:", error);
      return { ok: false, message: "Failed to delete API key" };
    }

    // Note: Cache deletion would need to be handled via API route if needed
    return { ok: true, data: null };
  };

  return { createApiKey, deleteApiKey };
}
