import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { fieldGenerationRateLimit } from "@/lib/upstash/rate-limit";
import type { FieldType } from "@/types/ai.types";

export const runtime = "nodejs";

/* -------------------------------------------------
   Fields that MUST NOT be AI-generated
------------------------------------------------- */

const DISABLED_AI_FIELDS: FieldType[] = [
  "business_name",
  "business_type",
  "product_name",
];

/* -------------------------------------------------
   Validation Schema
------------------------------------------------- */

const GenerateFieldSchema = z.object({
  botId: z.string().min(1),
  field: z.string(),
  context: z.object({
    userHint: z.string().optional(),
  }),
  currentValue: z.string().optional(),
});

/* -------------------------------------------------
   Field Temperatures
------------------------------------------------- */

const FIELD_TEMPERATURE: Record<
  Exclude<FieldType, (typeof DISABLED_AI_FIELDS)[number]>,
  number
> = {
  persona: 0.45,
  botthesis: 0.45,
  greetings: 0.4,
  fallback_message: 0.3,
  business_description: 0.5,
  product_description: 0.5,
  quick_questions: 0.35,
  welcome_message: 0.4,
};

/* -------------------------------------------------
   Input Validation
------------------------------------------------- */

function validateUserHint(userHint?: string): string | null {
  if (!userHint || !userHint.trim()) return null;

  const t = userHint.trim();
  if (t.length < 3) return "Input is too vague to generate meaningful content.";

  const alpha = (t.match(/[a-zA-Z0-9]/g) || []).length;
  const symbols = (t.match(/[^a-zA-Z0-9\s]/g) || []).length;

  if (symbols > t.length * 0.6)
    return "Input is too vague to generate meaningful content.";
  if (alpha < t.length * 0.3)
    return "Input is too vague to generate meaningful content.";
  if (/(.)\1{5,}/.test(t))
    return "Input is too vague to generate meaningful content.";
  if (!/[a-zA-Z]{2,}/.test(t))
    return "Input is too vague to generate meaningful content.";

  return null;
}

/* -------------------------------------------------
   Prompt Builder
------------------------------------------------- */
function buildPrompt(
  field: Exclude<FieldType, (typeof DISABLED_AI_FIELDS)[number]>,
  ctx: {
    business_name?: string;
    business_type?: string;
    business_description?: string;
    product_name?: string;
    product_description?: string;
    userHint?: string;
    currentValue?: string;
  }
): string {
  const baseContext = `
Business name: ${ctx.business_name || "N/A"}
Business type: ${ctx.business_type || "N/A"}
Product: ${ctx.product_name || "N/A"}

Existing content (if any):
${ctx.currentValue || "None"}

User instructions:
${ctx.userHint || "None"}
`;

  const instructionPriority = `
Instruction priority rules:
1. Content focus instructions (what to emphasize) take highest priority.
2. Clarity and correctness override stylistic preferences.
3. If length instructions conflict, choose the length that best preserves meaning (but never exceed 2000 tokens).
4. If tone instructions conflict, choose the most professional and confident option.
5. Never sacrifice important information to satisfy a weaker instruction.
6. CRITICAL: Your output MUST NOT exceed 2000 tokens. Keep responses concise.
`;

  const rejectionRule = `
If the information above is insufficient, irrelevant, or contradictory,
respond with exactly:
[REJECT]
`;

  const prompts: Record<typeof field, string> = {
    persona: `
Write a chatbot persona as natural, flowing prose.

${baseContext}

${instructionPriority}

What this persona should convey:
- How the assistant behaves
- How it communicates with users
- What it is especially good at helping with
- The tone users should expect

Guidance:
- Write in second person ("you")
- Expand naturally; do not pad or over-compress
- Avoid headings, labels, lists, names, or formatting
- This should read like behavioral guidance, not a profile card

${rejectionRule}
`,

    botthesis: `
Write a clear mission statement for the chatbot.

${baseContext}

${instructionPriority}

Guidance:
- Explain why the bot exists
- Focus on purpose and value
- Confident, direct language
- Plain paragraph only

${rejectionRule}
`,

    greetings: `
Write the first message the chatbot says to a user.

${baseContext}

${instructionPriority}

Guidance:
- Friendly but professional
- Invites conversation without overselling
- Short and human

${rejectionRule}
`,

    fallback_message: `
Write what the chatbot should say when it does not understand a request.

${baseContext}

${instructionPriority}

Guidance:
- Calm and helpful
- Encourages the user to rephrase
- One short sentence

${rejectionRule}
`,

    business_description: `
Write a concise description of the business.

${baseContext}

${instructionPriority}

Guidance:
- Focus on differentiation if instructed
- Reduce generic benefits unless they support the main focus
- Clear, factual, and grounded
- Avoid marketing fluff

${rejectionRule}
`,

    product_description: `
Write a description of the product.

${baseContext}

${instructionPriority}

Guidance:
- Explain what the product does and why it is useful
- Prioritize unique value when instructed
- Natural, readable paragraph
- Avoid buzzwords

${rejectionRule}
`,

    quick_questions: `
Generate common questions a customer might ask.

${baseContext}

${instructionPriority}

Guidance:
- Exactly 5 questions
- Short and natural
- From a customer perspective
- Return ONLY a valid JSON array of strings
- Each question must end with '?'

${rejectionRule}
`,

    welcome_message: `
Write a short welcome message shown when the chatbot loads.

${baseContext}

${instructionPriority}

Guidance:
- Warm and inviting
- Sets expectations for how the bot can help
- One clear sentence

${rejectionRule}
`,
  };

  return `
You are an AI assistant generating chatbot configuration content
that will be used directly in a production system.

CRITICAL: Your output is LIMITED to 2000 tokens maximum.
- Keep responses concise and within the token limit
- Prioritize essential information only
- If your response would exceed 2000 tokens, make it shorter
- Do not generate verbose or lengthy content

Do not explain your reasoning.
Do not include formatting or metadata.
Follow the task exactly.

${prompts[field]}
`;
}

/* -------------------------------------------------
   Gemini Generator
------------------------------------------------- */

/**
 * Generates content using Google Gemini
 * @param prompt - The prompt to send to Gemini
 * @param temperature - Temperature setting (0.0-2.0)
 * @returns Generated text content
 */
async function generateWithGemini(
  prompt: string,
  temperature: number
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash", // Fast and efficient for content generation
    generationConfig: {
      temperature,
      maxOutputTokens: 2000, // Limit output length
      topP: 0.9,
    },
  });

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text.trim();
  } catch (err) {
    console.error("[Gemini] Generation failed:", err);
    throw new Error("Gemini generation failed");
  }
}

/* -------------------------------------------------
   Route Handler
------------------------------------------------- */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = GenerateFieldSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { botId, field, context, currentValue } = parsed.data;
    const typedField = field as FieldType;

    /* Rate limit (per bot) */
    const rateKey = `bot:${botId}`;
    const { success, remaining, reset } = await fieldGenerationRateLimit.limit(rateKey);

    if (!success) {
      console.warn("[RATE LIMIT] Field generation exceeded", {
        botId,
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
          },
        }
      );
    }

    if (DISABLED_AI_FIELDS.includes(typedField)) {
      return NextResponse.json(
        { error: "AI generation is disabled for this field." },
        { status: 400 }
      );
    }

    // Narrow the type after checking disabled fields
    const allowedField = typedField as Exclude<
      FieldType,
      (typeof DISABLED_AI_FIELDS)[number]
    >;

    const validationError = validateUserHint(context.userHint);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: settings } = await supabaseAdmin
      .from("bot_settings")
      .select("*")
      .eq("bot_id", botId)
      .single();

    const prompt = buildPrompt(allowedField, {
      business_name: settings?.business_name ?? undefined,
      business_type: settings?.business_type ?? undefined,
      business_description: settings?.business_description ?? undefined,
      product_name: settings?.product_name ?? undefined,
      product_description: settings?.product_description ?? undefined,
      userHint: context.userHint,
      currentValue,
    });

    const output = await generateWithGemini(
      prompt,
      FIELD_TEMPERATURE[allowedField]
    );

    if (output === "[REJECT]") {
      return NextResponse.json(
        { error: "Cannot generate this field from the provided input." },
        { status: 400 }
      );
    }

    // Persona formatting guard
    if (
      allowedField === "persona" &&
      /[*#:_\-]{2,}|name:|role:|description:/i.test(output)
    ) {
      return NextResponse.json(
        { error: "Persona format violation. Please retry." },
        { status: 422 }
      );
    }

    let value: string | string[] = output;

    if (allowedField === "quick_questions") {
      try {
        const parsed = JSON.parse(output);
        if (!Array.isArray(parsed) || parsed.length !== 5) throw new Error();
        value = parsed;
      } catch {
        value = [
          "What does your product do?",
          "How can I get started?",
          "What pricing plans are available?",
          "Can I customize the chatbot?",
          "How do I contact support?",
        ];
      }
    }

    return NextResponse.json({ field: allowedField, value });
  } catch (err) {
    console.error("FIELD GENERATION ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
