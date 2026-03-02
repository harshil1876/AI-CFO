import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getBotProfile, signECDSAPayload } from "@/lib/db/bot-queries";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { BotUiSettingsRow } from "@/types";

export const runtime = "nodejs";

/* -----------------------------------------------------------
   CORS - Allow all origins (dev and prod)
----------------------------------------------------------- */
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Session-Id, X-Requested-With",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Max-Age": "86400",
  };
}

/* -----------------------------------------------------------
   OPTIONS Preflight
----------------------------------------------------------- */
export async function OPTIONS(_req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

/* -----------------------------------------------------------
   Validation Schema
----------------------------------------------------------- */
const BotIdSchema = z.object({
  bot_id: z.string().min(1),
});

/* -----------------------------------------------------------
   GET Handler
----------------------------------------------------------- */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ bot_id: string }> }
) {
  try {
    const { bot_id } = await params;

    // Validate bot_id
    const validationResult = BotIdSchema.safeParse({ bot_id });
    if (!validationResult.success) {
      return NextResponse.json(JSON.stringify({ error: "Invalid bot ID" }), {
        status: 400,
        headers: corsHeaders(),
      });
    }

    const { bot_id: validatedBotId } = validationResult.data;

    const PRIVATE_KEY_RAW = process.env.QUICKBOT_PRIVATE_KEY_RAW;
    if (!PRIVATE_KEY_RAW) {
      return new NextResponse(
        JSON.stringify({ error: "Missing QUICKBOT_PRIVATE_KEY_RAW" }),
        { status: 500, headers: corsHeaders() }
      );
    }

    // Fetch bot data
    const supabaseAdmin = getSupabaseAdmin();
    const [bot, uiSettingsRes] = await Promise.all([
      getBotProfile(validatedBotId),
      supabaseAdmin
        .from("bot_ui_settings")
        .select("*")
        .eq("bot_id", validatedBotId)
        .maybeSingle(),
    ]);

    if (!bot) {
      return new NextResponse(JSON.stringify({ error: "Bot not found" }), {
        status: 404,
        headers: corsHeaders(),
      });
    }

    const greeting = bot.config.greetings || "Hello there 👋";

    // Create default ui_settings if missing
    const rawUiSettings: BotUiSettingsRow =
      uiSettingsRes.data ||
      ({
        bot_id: validatedBotId,
        chatbot_name: "QuickBot Assistant",
        welcome_message: greeting,
        quick_questions: [],
        support_info: null,
        position: "bottom-right",
        auto_open_delay_ms: 0,
        auto_greet_on_open: false,
        ask_email_before_chat: false,
        persist_chat: true,
        show_timestamps: true,
        updated_at: new Date().toISOString(),
      } as BotUiSettingsRow);

    // Only allow safe fields
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

    const uiSettingsForSigning = Object.fromEntries(
      Object.entries(rawUiSettings).filter(([k]) => allowed.includes(k))
    );

    const payloadToSign = { ui_settings: uiSettingsForSigning };

    const signature = signECDSAPayload(payloadToSign, PRIVATE_KEY_RAW);

    // Filter out theme from response (legacy field, no longer used)
    const uiSettingsForResponse = Object.fromEntries(
      Object.entries(rawUiSettings).filter(([k]) => k !== "theme")
    );

    const responseBody = {
      ui_settings: uiSettingsForResponse,
      signature,
    };

    return new NextResponse(JSON.stringify(responseBody), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders(),
      },
    });
  } catch (err) {
    console.error("CONFIG ROUTE ERROR:", err);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: corsHeaders() }
    );
  }
}
