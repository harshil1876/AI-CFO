"server only";

import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { ApiKeyRow, BotConfigFull } from "@/types";
import {
  BotConfigsSchema,
  BotSettingsSchema,
  BotRuntimeSchema,
} from "@/schema";

/* ═══════════════════════════════════════════════════════════════════════
   BOT PROFILE OPERATIONS
════════════════════════════════════════════════════════════════════════ */

/**
 * Loads a complete bot profile from Supabase
 * Combines bot_configs, bot_settings, and bot_runtime_settings into a unified object
 *
 * @param botId - The bot ID to load
 * @returns BotConfigFull if all three tables have data, null otherwise
 */
export async function getBotProfile(
  botId: string
): Promise<BotConfigFull | null> {
  const supabaseAdmin = getSupabaseAdmin();
  // Fetch all three tables in parallel
  const [configRes, settingsRes, runtimeRes] = await Promise.all([
    supabaseAdmin.from("bot_configs").select("*").eq("bot_id", botId).single(),

    supabaseAdmin.from("bot_settings").select("*").eq("bot_id", botId).single(),

    supabaseAdmin
      .from("bot_runtime_settings")
      .select("*")
      .eq("bot_id", botId)
      .single(),
  ]);

  // Validate that all three queries succeeded
  if (configRes.error || settingsRes.error || runtimeRes.error) {
    return null;
  }

  // Validate and parse with Zod schemas
  const configParse = BotConfigsSchema.safeParse(configRes.data);
  const settingsParse = BotSettingsSchema.safeParse(settingsRes.data);
  const runtimeParse = BotRuntimeSchema.safeParse(runtimeRes.data);

  if (!configParse.success || !settingsParse.success || !runtimeParse.success) {
    console.error("Schema validation failed:", {
      config: configParse.error,
      settings: settingsParse.error,
      runtime: runtimeParse.error,
    });
    return null;
  }

  // Return unified bot profile
  return {
    bot_id: botId,
    config: configParse.data,
    settings: settingsParse.data,
    runtime: runtimeParse.data,
  };
}

/* ═══════════════════════════════════════════════════════════════════════
   ECDSA SIGNING UTILITIES
════════════════════════════════════════════════════════════════════════ */

/**
 * Canonical JSON stringifier - matches widget's implementation
 * Sorts keys deterministically for consistent signing
 */
function canonicalJSONStringify(obj: unknown): string {
  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return "[" + obj.map((v) => canonicalJSONStringify(v)).join(",") + "]";
  }

  const keys = Object.keys(obj as Record<string, unknown>).sort();
  const entries = keys.map(
    (k) =>
      JSON.stringify(k) +
      ":" +
      canonicalJSONStringify((obj as Record<string, unknown>)[k])
  );
  return "{" + entries.join(",") + "}";
}

/**
 * Signs a payload using ECDSA P-256 with SHA-256
 * Uses raw hex private key (64 hex chars = 32 bytes) converted to JWK format
 *
 * @param payload - The object to sign
 * @param rawHex - Raw hex-encoded ECDSA P-256 private key (64 hex characters)
 * @returns Base64-encoded ASN.1 DER signature
 */
export function signECDSAPayload(payload: object, rawHex: string): string {
  console.log("SIGNER: Raw hex key =", rawHex);

  if (!/^[0-9a-fA-F]{64}$/.test(rawHex)) {
    throw new Error("QUICKBOT_PRIVATE_KEY_RAW must be 64 hex chars (32 bytes)");
  }

  const dBytes = Buffer.from(rawHex, "hex");

  // Node.js requires x and y (public key) in JWK format
  // We need to derive the public key from the private key
  // Use ECDH to compute the public key point
  const ecdh = crypto.createECDH("prime256v1");
  ecdh.setPrivateKey(dBytes);
  const publicKey = ecdh.getPublicKey(); // Returns 65 bytes: 0x04 + 32-byte X + 32-byte Y

  // Extract X and Y coordinates (skip first byte 0x04)
  const x = publicKey.slice(1, 33);
  const y = publicKey.slice(33, 65);

  const jwk = {
    kty: "EC",
    crv: "P-256",
    d: dBytes.toString("base64url"), // Private key
    x: x.toString("base64url"), // Public key X coordinate
    y: y.toString("base64url"), // Public key Y coordinate
  };

  let privateKeyObj: crypto.KeyObject;
  try {
    privateKeyObj = crypto.createPrivateKey({ key: jwk, format: "jwk" });
    console.log("SIGNER: Successfully created private key from JWK");
  } catch (err) {
    console.error("SIGNER: JWK parsing failed:", err);
    throw new Error("Invalid raw hex EC private key");
  }

  const canonicalJson = canonicalJSONStringify(payload);
  console.log("SIGNER: Canonical JSON to sign:", canonicalJson);
  console.log("SIGNER: Canonical JSON length:", canonicalJson.length);
  const data = Buffer.from(canonicalJson, "utf8");

  const signer = crypto.createSign("SHA256");
  signer.update(data);
  signer.end();

  try {
    const signature = signer.sign(privateKeyObj, "base64");
    console.log("SIGNER: Signature generated (base64 length):", signature.length);
    return signature;
  } catch (err) {
    console.error("SIGNER: Signing failed:", err);
    throw new Error("ECDSA signing failed.");
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   API KEY OPERATIONS
════════════════════════════════════════════════════════════════════════ */

/**
 * Looks up an API key by raw token (matches against token_hash)
 * @param rawToken - The raw API token (will be hashed and matched)
 * @returns ApiKeyRow if found, null otherwise
 */
export async function lookupApiKey(
  rawToken: string
): Promise<ApiKeyRow | null> {
  const supabaseAdmin = getSupabaseAdmin();
  // Hash the raw token using SHA-256
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  const { data, error } = await supabaseAdmin
    .from("api_keys")
    .select("*")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  // Basic validation - ApiKeyRow type is already defined
  if (
    typeof data.id === "number" &&
    typeof data.api_id === "string" &&
    typeof data.bot_id === "string" &&
    typeof data.token_hash === "string"
  ) {
    return data as ApiKeyRow;
  }

  return null;
}

