/**
 * Chat API Route - Main endpoint for chatbot interactions
 *
 * This route handles:
 * - User message validation and processing
 * - RAG (Retrieval-Augmented Generation) context retrieval
 * - LLM invocation via Groq
 * - Response formatting and logging
 *
 * Key optimizations:
 * - Short-circuits LLM calls for obvious out-of-scope messages
 * - Caches Groq client to avoid per-request instantiation
 * - Limits token output to reduce latency and costs
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Groq } from "groq-sdk";

import { getBotProfile, lookupApiKey } from "@/lib/db/bot-queries";
import { buildSystemPrompt } from "@/lib/llm/system-prompt-builder";
import { logChat } from "@/lib/db/chat-logs";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isObviousGibberish } from "@/lib/validation/gibberish-detector";
import { retrieveContext } from "@/lib/upstash/search";
import { chatRateLimit } from "@/lib/upstash/rate-limit";

export const runtime = "nodejs";

/* -----------------------------
   Groq Client Cache
----------------------------- */

/**
 * Cached Groq client instance
 * Reused across requests to avoid per-request instantiation overhead
 * This is a micro-optimization that reduces object creation costs
 */
let groqClient: Groq | null = null;

/**
 * Gets or creates the cached Groq client
 * @returns Singleton Groq client instance
 * @throws Error if GROQ_API_KEY is not configured
 */
function getGroqClient(): Groq {
  if (!groqClient) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY not configured");
    }
    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groqClient;
}

/* -----------------------------
   Out-of-Scope Detection
----------------------------- */

/**
 * Detects if a message is obviously out of scope for the bot
 *
 * This function identifies messages that are clearly not questions or requests
 * that require the bot's knowledge. When no RAG context is available and the
 * message is out of scope, we can skip the LLM call entirely and return the
 * fallback message directly.
 *
 * Benefits:
 * - Saves tokens (no LLM invocation)
 * - Reduces latency (immediate response)
 * - Saves money (no API costs)
 * - Improves determinism (consistent fallback behavior)
 *
 * @param message - User's message to evaluate
 * @returns true if message is obviously out of scope, false otherwise
 */
function isObviousOutOfScope(message: string): boolean {
  const lowerMessage = message.toLowerCase().trim();

  // Very short messages (< 3 chars) are likely not meaningful questions
  // Examples: "a", "hi", "ok"
  if (lowerMessage.length < 3) {
    return true;
  }

  // Common out-of-scope patterns that don't require bot knowledge
  // These are social pleasantries, acknowledgments, or simple responses
  const outOfScopePatterns = [
    // Greetings without questions
    /^(hi|hello|hey|sup|yo|greetings|good (morning|afternoon|evening))[!.]?$/i,
    // Gratitude expressions
    /^(thanks?|thank you|thx|ty|appreciate it)[!.]?$/i,
    // Farewells
    /^(bye|goodbye|see ya|later|cya|farewell)[!.]?$/i,
    // Simple acknowledgments
    /^(ok|okay|k|alright|sure|got it|understood)[!.]?$/i,
    // Yes/no responses
    /^(yes|no|yep|nope|yeah|nah)[!.]?$/i,
    // Only punctuation/symbols (no actual text)
    /^[^a-z]*$/i,
  ];

  return outOfScopePatterns.some((pattern) => pattern.test(lowerMessage));
}

/* -----------------------------
   CORS Configuration
----------------------------- */

/**
 * CORS headers for cross-origin requests
 * Allows widget/iframe embedding from any origin
 */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Session-Id, X-Requested-With",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

/**
 * OPTIONS handler for CORS preflight requests
 * Required for browser-based cross-origin requests
 */
export async function OPTIONS(_req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

/* -----------------------------
   Validation Schemas
----------------------------- */

/**
 * URL parameter validation
 * Ensures bot_id is provided and non-empty
 */
const ParamsSchema = z.object({
  bot_id: z.string().min(1),
});

/**
 * Request body validation
 * - message: Required, non-empty user message
 * - chat_history: Optional array of previous messages (max 20 for performance)
 *   Used for conversation context, but limited to prevent token bloat
 */
const RequestSchema = z.object({
  message: z.string().min(1),
  chat_history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .max(20) // Limit history to prevent excessive token usage
    .default([]),
});

/**
 * LLM response validation
 * Ensures the model returns a properly formatted response
 * - answer: The bot's response text
 * - suggestedQuestions: Array of follow-up questions (0-3, must end with "?")
 */
const LLMResponseSchema = z.object({
  answer: z.string(),
  suggestedQuestions: z
    .array(z.string().refine((q) => q.endsWith("?")))
    .min(0)
    .max(3), // Limit to 3 questions for UI simplicity
});

/* -----------------------------
   POST Handler
----------------------------- */

/**
 * POST /api/chat/[bot_id]
 *
 * Main chat endpoint that processes user messages and returns bot responses
 *
 * Flow:
 * 1. Validate request (params, session, body)
 * 2. Authenticate (optional API key)
 * 3. Filter gibberish/spam
 * 4. Load bot configuration
 * 5. Retrieve RAG context (if available)
 * 6. Short-circuit for obvious out-of-scope messages
 * 7. Build system prompt with context
 * 8. Invoke LLM (Groq)
 * 9. Parse and validate response
 * 10. Log interaction
 * 11. Return formatted response
 *
 * @param req - Next.js request object
 * @param params - Route parameters containing bot_id
 * @returns JSON response with answer and suggested questions
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ bot_id: string }> }
) {
  const supabase = getSupabaseAdmin();
  const startTs = Date.now(); // Track total request time

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("[CHAT API] Request received");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  try {
    // Validate URL parameters
    const paramsData = await params;
    const paramsValidation = ParamsSchema.safeParse(paramsData);

    if (!paramsValidation.success) {
      console.error("[ERROR] Invalid bot_id parameter");
      return NextResponse.json(
        { error: "Invalid bot ID" },
        { status: 400, headers: corsHeaders }
      );
    }

    const { bot_id } = paramsValidation.data;
    console.log(`Bot ID: ${bot_id}`);

    // Validate session ID header (required for chat logging and tracking)
    // Format: alphanumeric + underscore/dash, 8-64 chars
    const sessionId = req.headers.get("x-session-id");
    if (!sessionId) {
      console.error("[ERROR] Missing x-session-id header");
      return NextResponse.json(
        { error: "Missing x-session-id header" },
        { status: 400, headers: corsHeaders }
      );
    } else if (!/^[a-zA-Z0-9_-]{8,64}$/.test(sessionId)) {
      return NextResponse.json(
        { error: "Invalid session id" },
        { status: 400, headers: corsHeaders }
      );
    }
    console.log(`Session ID: ${sessionId}`);

    /* Rate limit (per bot + session) */
    // Enforce rate limiting to prevent abuse and control costs
    // 20 requests per minute per session (sliding window)
    const rateKey = `bot:${bot_id}:session:${sessionId}`;
    const { success, remaining, reset } = await chatRateLimit.limit(rateKey);

    if (!success) {
      console.warn("[RATE LIMIT] Exceeded", {
        bot_id,
        sessionId,
        reset,
      });

      return NextResponse.json(
        {
          error: "Too many requests. Please slow down.",
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
            ...corsHeaders,
          },
        }
      );
    }

    // Validate and parse request body
    const body = RequestSchema.parse(await req.json());
    console.log(
      `Message: ${body.message.substring(0, 100)}${
        body.message.length > 100 ? "..." : ""
      }`
    );
    console.log(`Chat history length: ${body.chat_history.length}`);

    /* Optional API key authentication */
    // If Authorization header is provided, validate the API key
    // This allows programmatic access with API keys instead of session-based auth
    const auth = req.headers.get("authorization") ?? "";
    if (auth.toLowerCase().startsWith("bearer ")) {
      const token = auth.replace(/^bearer\s+/i, "").trim();
      const apiKey = await lookupApiKey(token);

      // API key must exist and belong to the requested bot
      if (!apiKey || apiKey.bot_id !== bot_id) {
        console.error("[ERROR] Invalid API key");
        return NextResponse.json(
          { error: "Invalid API key" },
          { status: 401, headers: corsHeaders }
        );
      }
      console.log("[OK] API key validated");
    }

    /* Gibberish/spam detection */
    // Filter out obviously meaningless messages to prevent abuse and reduce costs
    // Examples: random characters, repeated letters, etc.
    if (isObviousGibberish(body.message)) {
      console.warn("[WARN] Gibberish detected in message");
      return NextResponse.json(
        { error: "Message not understandable. Please rephrase." },
        { status: 400, headers: corsHeaders }
      );
    }

    /* Load bot configuration */
    // Fetch bot profile including config, settings, and metadata
    // This is the single source of truth for bot behavior
    const bot = await getBotProfile(bot_id);
    if (!bot) {
      console.error(`[ERROR] Bot not found: ${bot_id}`);
      return NextResponse.json(
        { error: "Bot not found" },
        { status: 404, headers: corsHeaders }
      );
    }
    console.log(`[OK] Bot loaded: ${bot.settings.business_name || bot_id}`);

    /* RAG: Retrieve relevant context from config search */
    // Search Upstash Search for relevant bot configuration chunks
    // This enhances responses with context from persona/botthesis fields
    // Failures are non-fatal - chat continues without RAG context
    let ragContext: string[] = [];
    try {
      ragContext = await retrieveContext(bot_id, body.message);
    } catch (ragErr) {
      // RAG failures must not break chat - gracefully degrade to base prompt
      console.error("[RAG] Error during retrieval (non-fatal):", ragErr);
      ragContext = [];
    }

    /* Performance optimization: Short-circuit LLM for obvious out-of-scope messages */
    // If no RAG context is available and the message is clearly out of scope,
    // skip the expensive LLM call and return the fallback message directly.
    // This saves tokens, latency, money, and improves determinism.
    const hasRagContext = ragContext.length > 0;
    if (!hasRagContext && isObviousOutOfScope(body.message)) {
      const fallbackMessage =
        bot.config.fallback_message?.trim() ||
        "I'm not able to help with that. Please contact support for assistance.";
      console.log("[CHAT] Short-circuit: out-of-scope message, skipping LLM");
      return NextResponse.json(
        {
          answer: fallbackMessage,
          suggestedQuestions: [],
        },
        { headers: corsHeaders }
      );
    }

    /* Build system prompt with RAG context (if available) */
    // The system prompt includes bot configuration, persona, and retrieved context
    // Context is truncated to prevent token bloat while maintaining relevance
    if (hasRagContext) {
      console.log(`[CHAT] Using RAG context (${ragContext.length} chunks)`);
    } else {
      console.log("[CHAT] No RAG context, calling LLM directly");
    }
    const MAX_CONTEXT_CHARS = 1500; // Limit context length to control token usage

    const safeRagContext = ragContext.map((c) =>
      c.length > MAX_CONTEXT_CHARS ? c.slice(0, MAX_CONTEXT_CHARS) : c
    );
    const systemPrompt = buildSystemPrompt(
      bot,
      safeRagContext.length > 0 ? safeRagContext : undefined
    );

    /* Reduce chat history to last 10 messages */
    // Limiting history prevents token bloat and reduces costs
    // Last 10 messages provide sufficient context for most conversations
    const trimmedHistory = body.chat_history.slice(-10);

    /* Groq LLM invocation */
    // Using Groq's native SDK for fast inference
    // Model: qwen/qwen3-32b (high-quality responses)
    // Alternative: llama-3.1-8b-instant (faster, lower quality)
    const groqModel = "qwen/qwen3-32b";
    // const groqModel = "llama-3.1-8b-instant";
    console.log(`[LLM] Using Groq (${groqModel})`);
    const llmStartTs = Date.now(); // Track LLM invocation time

    let result: z.infer<typeof LLMResponseSchema>;
    try {
      // Get cached Groq client (reused across requests)
      const groq = getGroqClient();

      /* Build message array for Groq API */
      // Format: system prompt + chat history + current user message
      // Groq expects messages in conversational format
      const messages: Array<{
        role: "system" | "user" | "assistant";
        content: string;
      }> = [
        { role: "system", content: systemPrompt },
        ...trimmedHistory.map((m) => ({
          role: m.role === "user" ? ("user" as const) : ("assistant" as const),
          content: m.content,
        })),
        { role: "user", content: body.message },
      ];

      /* Invoke Groq LLM with timeout protection */
      // Promise.race ensures we don't wait indefinitely if Groq is slow
      // 50s timeout is generous but prevents hanging requests
      const completion = await Promise.race([
        groq.chat.completions.create({
          model: groqModel,
          messages: messages,
          temperature: 0.3, // Lower temperature = more deterministic, focused responses
          max_completion_tokens: 512, // Clamped to 512 for SaaS bot (reduces latency & costs)
          reasoning_effort: "none", // Disable reasoning for faster responses
          response_format: { type: "json_object" }, // Force JSON output for structured responses
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("LLM timeout")), 50_000)
        ),
      ]);

      const content = completion.choices[0]?.message?.content || "";

      /* Parse JSON response from LLM */
      // LLM is instructed to return JSON, but we handle parsing errors gracefully
      // Fallback: extract JSON object from text if response is wrapped in markdown/code
      let parsed: any;
      try {
        // First, try to clean the content (remove markdown code blocks, whitespace)
        let cleanedContent = content.trim();

        // Remove markdown code blocks if present
        cleanedContent = cleanedContent
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "");
        cleanedContent = cleanedContent.replace(/\s*```$/i, "");
        cleanedContent = cleanedContent.trim();

        // Try parsing the cleaned content
        parsed = JSON.parse(cleanedContent);
      } catch (parseErr) {
        // Fallback: try to extract JSON from text (handles markdown code blocks, etc.)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsed = JSON.parse(jsonMatch[0]);
          } catch {
            console.error(
              "[JSON Parse] Failed to parse extracted JSON:",
              jsonMatch[0].substring(0, 200)
            );
            throw new Error(
              "Invalid JSON response from Groq - failed to parse extracted JSON"
            );
          }
        } else {
          console.error(
            "[JSON Parse] No JSON object found in response. Content:",
            content.substring(0, 300)
          );
          throw new Error(
            "Invalid JSON response from Groq - no JSON object found"
          );
        }
      }

      /* Validate response structure with Zod */
      // Ensures response matches expected schema (answer + suggestedQuestions)
      // Throws if structure is invalid (safety check)
      result = LLMResponseSchema.parse(parsed);
      const llmTimeMs = Date.now() - llmStartTs;
      console.log(`[LLM] Response received in ${llmTimeMs}ms`);
    } catch (err) {
      // LLM invocation failed - return error to user
      // This could be due to: timeout, API error, invalid response format, etc.
      const llmTimeMs = Date.now() - llmStartTs;
      console.error(
        `[ERROR] Groq invocation failed after ${llmTimeMs}ms:`,
        err
      );

      // Check if it's a JSON validation error from Groq
      // Groq returns this when the model fails to generate valid JSON
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (
        errorMessage.includes("json_validate_failed") ||
        errorMessage.includes("Failed to generate JSON")
      ) {
        console.error(
          "[ERROR] Groq JSON validation failed - model returned invalid JSON format"
        );
        // Return fallback message instead of generic error for better UX
        const fallbackMessage =
          bot.config.fallback_message?.trim() ||
          "I'm not able to help with that. Please contact support for assistance.";
        return NextResponse.json(
          {
            answer: fallbackMessage,
            suggestedQuestions: [],
          },
          { headers: corsHeaders }
        );
      }

      return NextResponse.json(
        { error: "Model invocation failed" },
        { status: 500, headers: corsHeaders }
      );
    }

    /* Final cleanup: Handle edge case where LLM returns nested JSON */
    // Sometimes the LLM returns JSON inside the answer field
    // This extracts the actual answer if it's double-encoded
    if (
      result.answer.trim().startsWith("{") &&
      result.answer.trim().endsWith("}")
    ) {
      try {
        const parsed = JSON.parse(result.answer.trim());
        if (typeof parsed.answer === "string") {
          result.answer = parsed.answer.trim();
        }
        if (Array.isArray(parsed.suggestedQuestions)) {
          result.suggestedQuestions = parsed.suggestedQuestions;
        }
      } catch {
        // If parsing fails, keep original answer (not critical)
      }
    }

    /* Logging and metrics */
    // Calculate response metrics for monitoring and analytics
    const responseTimeMs = Date.now() - startTs; // Total request time
    // Rough token estimation: ~3.5 chars per token (English average)
    const estimatedTokensUsed = Math.ceil(
      (result.answer.length + body.message.length) / 3.5
    );

    console.log(`[STATS] Response stats:`);
    console.log(`   - Answer length: ${result.answer.length} chars`);
    console.log(
      `   - Suggested questions: ${result.suggestedQuestions.length}`
    );
    console.log(`   - Estimated tokens: ${estimatedTokensUsed}`);
    console.log(`   - Total response time: ${responseTimeMs}ms`);

    /* Log chat interaction to database */
    // Non-blocking: failures don't affect response
    // Used for analytics, debugging, and conversation history
    await logChat({
      supabase,
      botId: bot_id,
      sessionId,
      role: "assistant",
      message: result.answer,
      tokensUsed: estimatedTokensUsed,
      responseTimeMs,
      model: groqModel,
      history: [],
    }).catch((logErr) => {
      // Log failures are non-critical - don't break the response
      console.warn("[WARN] Failed to log chat:", logErr);
    });

    console.log("[OK] Response sent successfully");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    /* Return formatted response */
    // Response format matches frontend expectations
    return NextResponse.json(
      {
        answer: result.answer,
        suggestedQuestions: result.suggestedQuestions,
      },
      { headers: corsHeaders }
    );
  } catch (err) {
    /* Global error handler */
    // Catches any unhandled errors in the request flow
    // Returns generic error message to prevent information leakage
    const errorTimeMs = Date.now() - startTs;
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error(`[ERROR] [CHAT API] Error after ${errorTimeMs}ms:`, err);
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
