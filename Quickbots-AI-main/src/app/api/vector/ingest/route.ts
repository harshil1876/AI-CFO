import { NextRequest, NextResponse } from "next/server";
import { ingestBotContent } from "@/lib/upstash/search";

/**
 * POST /api/vector/ingest
 * Triggers vector ingestion for a bot (non-blocking, best-effort)
 *
 * Body: { botId: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { botId } = body;

    if (!botId || typeof botId !== "string") {
      return NextResponse.json({ error: "Invalid botId" }, { status: 400 });
    }

    // Trigger ingestion (non-blocking, errors are caught internally)
    const result = await ingestBotContent(botId);

    if (!result.success) {
      // Log but still return 200 - this is best-effort
      console.error(
        `[Vector Ingestion API] Failed for bot ${botId}:`,
        result.error
      );
    }

    return NextResponse.json({ success: result.success });
  } catch (err) {
    // Never throw - this is best-effort
    console.error("[Vector Ingestion API] Error:", err);
    return NextResponse.json(
      { success: false, error: "Internal error" },
      { status: 500 }
    );
  }
}
