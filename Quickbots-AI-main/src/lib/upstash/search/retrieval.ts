"use server";

import { getSearchClient } from "./client";

const INDEX_NAME = "bot-configs";

export async function retrieveContext(
  botId: string,
  query: string
): Promise<string[]> {
  try {
    console.log(`[Search][RAG] Searching config for bot ${botId}`);

    const search = getSearchClient();
    if (!search) {
      console.warn("[Search][RAG] Search not configured, skipping RAG");
      return [];
    }

    const index = search.index<{ text: string }, { botId: string }>(INDEX_NAME);

    const results = await index.search({
      query,
      limit: 3,
      filter: {
        "@metadata.botId": {
          equals: botId,
        },
      },
    });

    const contexts = results
      .map((hit) => {
        const content = hit.content as { text?: string };
        return typeof content?.text === "string" ? content.text.trim() : null;
      })
      .filter((v): v is string => Boolean(v));

    console.log(`[Search][RAG] Retrieved ${contexts.length} results`);
    return contexts;
  } catch (err) {
    console.error(`[Search][RAG] Error, skipping RAG:`, err);
    return [];
  }
}

