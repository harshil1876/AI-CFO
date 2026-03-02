import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ bot_id: string }> }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { bot_id } = await params;
    if (!bot_id) {
      return NextResponse.json({ error: "Missing bot_id" }, { status: 400 });
    }

    // 1) total conversations (count of assistant messages or distinct conversation ids)
    const { count: totalConversations, error: convErr } = await supabaseAdmin
      .from("bot_chat_logs")
      .select("id", { count: "exact", head: true })
      .eq("bot_id", bot_id);

    if (convErr) throw convErr;

    // 2) active users (unique session ids in last 24h)
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recentSessions, error: sessErr } = await supabaseAdmin
      .from("bot_chat_logs")
      .select("user_session_id")
      .eq("bot_id", bot_id)
      .gte("created_at", since24h);

    if (sessErr) throw sessErr;
    const activeUsers = new Set(
      (recentSessions || []).map((r) => r.user_session_id)
    ).size;

    // 3) average response time for assistant messages (ms)
    const { data: avgResData, error: avgErr } = await supabaseAdmin
      .rpc("avg_response_time_for_bot", { p_bot_id: bot_id })
      .limit(1);
    // Note: fallback to query if RPC not present — compute via SQL below

    let avgResponseTimeMs: number | null = null;
    if (
      !avgErr &&
      Array.isArray(avgResData) &&
      avgResData.length > 0 &&
      typeof avgResData[0] === "object" &&
      avgResData[0] !== null &&
      "avg" in avgResData[0]
    ) {
      const avgValue = (avgResData[0] as { avg: unknown }).avg;
      avgResponseTimeMs = Math.round(Number(avgValue));
    } else {
      // Fallback: compute via select
      const { data: avgRows, error: avgRowsErr } = await supabaseAdmin
        .from("bot_chat_logs")
        .select("response_time_ms")
        .eq("bot_id", bot_id)
        .not("response_time_ms", "is", null);

      if (avgRowsErr) {
        console.warn(
          "Failed to compute avg response time via fallback:",
          avgRowsErr
        );
      } else {
        const vals = (avgRows || [])
          .map((r) => r.response_time_ms)
          .filter((v) => typeof v === "number");
        if (vals.length > 0) {
          avgResponseTimeMs = Math.round(
            vals.reduce((a, b) => a + b, 0) / vals.length
          );
        }
      }
    }

    // 4) success rate (non-error assistant messages / total assistant messages * 100)
    // For success rate we need counts: total assistant messages and error assistant messages
    const { count: totalAssistant, error: totalAssistantErr } =
      await supabaseAdmin
        .from("bot_chat_logs")
        .select("id", { count: "exact", head: true })
        .eq("bot_id", bot_id)
        .eq("message_role", "assistant");

    if (totalAssistantErr) throw totalAssistantErr;

    const { count: errorAssistant, error: errorAssistantErr } =
      await supabaseAdmin
        .from("bot_chat_logs")
        .select("id", { count: "exact", head: true })
        .eq("bot_id", bot_id)
        .eq("message_role", "assistant")
        .eq("error", true);

    if (errorAssistantErr) throw errorAssistantErr;

    const successRate =
      totalAssistant && totalAssistant > 0
        ? Math.round(
            ((totalAssistant - (errorAssistant || 0)) / totalAssistant) * 10000
          ) / 100
        : 100;

    // 5) token usage: sum tokens_used (assistant messages)
    const { data: tokensAgg, error: tokensAggErr } = await supabaseAdmin.rpc(
      "sum_tokens_for_bot",
      { p_bot_id: bot_id }
    );

    let tokensUsed = 0;
    if (
      !tokensAggErr &&
      tokensAgg &&
      Array.isArray(tokensAgg) &&
      tokensAgg.length > 0 &&
      typeof tokensAgg[0] === "object" &&
      tokensAgg[0] !== null &&
      "sum" in tokensAgg[0]
    ) {
      const sumValue = (tokensAgg[0] as { sum: unknown }).sum;
      tokensUsed = Number(sumValue) || 0;
    } else {
      // Fallback compute manually
      const { data: tokenRowsManual, error: tokenRowsManualErr } =
        await supabaseAdmin
          .from("bot_chat_logs")
          .select("tokens_used")
          .eq("bot_id", bot_id)
          .not("tokens_used", "is", null);

      if (!tokenRowsManualErr && tokenRowsManual) {
        tokensUsed = (tokenRowsManual || []).reduce(
          (acc, r) => acc + (Number(r.tokens_used) || 0),
          0
        );
      }
    }

    // tokens_limit: attempt to read from runtime settings (token_quota)
    const { data: runtimeRows, error: runtimeErr } = await supabaseAdmin
      .from("bot_runtime_settings")
      .select("token_quota")
      .eq("bot_id", bot_id)
      .maybeSingle();

    const tokensLimit =
      runtimeErr || !runtimeRows?.token_quota
        ? 1_000_000
        : Number(runtimeRows.token_quota);

    const tokensUsedPercent =
      tokensLimit > 0
        ? Math.round((tokensUsed / tokensLimit) * 10000) / 100
        : 0;

    return NextResponse.json({
      total_conversations: totalConversations || 0,
      active_users: activeUsers,
      avg_response_time_ms: avgResponseTimeMs ?? 0,
      success_rate: successRate,
      tokens_used: tokensUsed,
      tokens_limit: tokensLimit,
      tokens_used_percent: tokensUsedPercent,
    });
  } catch (err: unknown) {
    console.error("ANALYTICS ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
