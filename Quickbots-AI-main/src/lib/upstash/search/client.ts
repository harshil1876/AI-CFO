import { Search } from "@upstash/search";

/**
 * Centralized Upstash Search client
 * Uses fixed index: "bot-configs"
 * Returns null if not configured (non-blocking)
 */
let searchClient: Search | null = null;

export function getSearchClient(): Search | null {
  if (searchClient) {
    return searchClient;
  }

  try {
    searchClient = Search.fromEnv();
    console.log("[Search] Client initialized");
    console.log("[Search] Using index: bot-configs");
    return searchClient;
  } catch (err) {
    console.warn("[Search] Not configured, skipping Search features:", err);
    return null;
  }
}
