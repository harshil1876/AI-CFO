/**
 * Gibberish Detection Utility
 * Detects nonsensical, gibberish, or meaningless input patterns
 */

/**
 * Detects obvious gibberish patterns in user input
 * Returns true if the input appears to be nonsensical gibberish
 */
const placeholderWords = new Set([
  "asdf",
  "asf",
  "asfd",
  "qwerty",
  "qwer",
  "zxcv",
  "test",
  "testing",
  "sample",
  "samples",
  "lorem",
  "ipsum",
  "placeholder",
  "dummy",
  "foobar",
  "abc",
  "abcd",
  "xxx",
  "zzzz",
  "aaaa",
  "bbbb",
  "cccc",
  "none",
  "na",
  "notavailable",
]);

const allowedShortWords = new Set([
  "ai",
  "ml",
  "hr",
  "it",
  "pr",
  "ux",
  "saas",
  "crm",
  "erp",
]);

function normalizeText(text: string): string {
  return text.trim().toLowerCase();
}

function isPlaceholderString(text: string): boolean {
  const normalized = normalizeText(text);
  if (!normalized) return true;

  if (placeholderWords.has(normalized)) return true;

  if (
    normalized.length <= 2 &&
    !allowedShortWords.has(normalized) &&
    /^[a-z]+$/.test(normalized)
  ) {
    return true;
  }

  // Same character repeated
  if (/^(.)\1{3,}$/.test(normalized)) {
    return true;
  }

  // Repeating syllable patterns (e.g., "abcabcabc")
  if (/^([a-z]{1,3})\1{2,}$/i.test(normalized)) {
    return true;
  }

  // Common keyboard mashes
  if (/^(asdf|qwer|zxcv|wasd|hjkl|dfghj)$/i.test(normalized)) {
    return true;
  }

  return false;
}

export function isObviousGibberish(text: string): boolean {
  const trimmed = text.trim();

  // Too short to be meaningful (less than 2 characters)
  if (trimmed.length < 2) return false; // Let other checks handle very short inputs

  // Check for excessive repeated characters (e.g., "aaaaaa", "123123123")
  const repeatedCharPattern = /(.)\1{4,}/;
  if (repeatedCharPattern.test(trimmed)) return true;

  // Check for random character sequences (high ratio of non-alphanumeric)
  const alphanumericCount = (trimmed.match(/[a-zA-Z0-9]/g) || []).length;
  const totalChars = trimmed.length;
  if (totalChars > 10 && alphanumericCount / totalChars < 0.3) return true;

  // Check for excessive random capitalization (e.g., "aBcDeFgHiJkL")
  const randomCasePattern = /[a-z][A-Z][a-z][A-Z][a-z][A-Z]/;
  if (randomCasePattern.test(trimmed) && trimmed.length > 20) return true;

  // Check for keyboard mashing patterns (common adjacent keys)
  const keyboardMashPattern =
    /(asdf|qwert|zxcv|hjkl|fdsa|trewq|vcxz|lkjh){2,}/i;
  if (keyboardMashPattern.test(trimmed)) return true;

  // Check for excessive numbers with no context (e.g., "123456789012345")
  const numberOnlyPattern = /^\d{15,}$/;
  if (numberOnlyPattern.test(trimmed)) return true;

  return false;
}

/**
 * Detects if multiple text fields together form gibberish
 * Checks if values are unrelated and don't form a coherent business context
 */
export function isGibberishBusinessData(data: {
  business_name?: string;
  business_type?: string;
  business_description?: string;
  product_name?: string;
  product_description?: string;
  target_audience?: string;
  problem?: string;
  brand_voice?: string;
}): { isGibberish: boolean; reason?: string } {
  const fields = [
    data.business_name,
    data.business_type,
    data.business_description,
    data.product_name,
    data.product_description,
    data.target_audience,
    data.problem,
    data.brand_voice,
  ].filter(Boolean) as string[];

  // Check each field individually for obvious gibberish
  for (const field of fields) {
    if (isObviousGibberish(field)) {
      return {
        isGibberish: true,
        reason: `The field "${field.substring(
          0,
          30
        )}..." contains nonsensical content.`,
      };
    }

    if (isPlaceholderString(field)) {
      return {
        isGibberish: true,
        reason:
          "The provided information appears to contain placeholder text. Please describe your real business details.",
      };
    }
  }

  // Detect if multiple fields are using the exact same placeholder or value
  const normalizedValues = fields
    .map((value) => normalizeText(value))
    .filter(Boolean);

  if (normalizedValues.length > 0) {
    const counts = normalizedValues.reduce<Map<string, number>>(
      (map, value) => map.set(value, (map.get(value) || 0) + 1),
      new Map()
    );

    const maxCount = Math.max(...counts.values());
    if (maxCount >= 4 && maxCount >= normalizedValues.length / 2) {
      return {
        isGibberish: true,
        reason:
          "Each field should describe a different aspect of your business. Please provide distinct, meaningful details for every question.",
      };
    }
  }

  // Check if critical fields are missing or too short
  const criticalFields = [
    data.business_name,
    data.business_type,
    data.product_name,
  ];

  const missingCritical = criticalFields.filter(
    (f) => !f || f.trim().length < 2
  );

  if (missingCritical.length > 0) {
    return {
      isGibberish: false, // Not gibberish, just incomplete
      reason: "Missing critical business information",
    };
  }

  // Check for patterns that suggest the data is unrelated
  // If business_name and product_name are completely different random strings
  if (
    data.business_name &&
    data.product_name &&
    data.business_name.length > 5 &&
    data.product_name.length > 5
  ) {
    // Check if they're both gibberish-like (high ratio of random chars)
    const businessNameChars = (data.business_name.match(/[a-zA-Z0-9]/g) || [])
      .length;
    const productNameChars = (data.product_name.match(/[a-zA-Z0-9]/g) || [])
      .length;

    if (
      businessNameChars / data.business_name.length < 0.5 &&
      productNameChars / data.product_name.length < 0.5
    ) {
      return {
        isGibberish: true,
        reason: "Business and product names appear to be nonsensical.",
      };
    }
  }

  return { isGibberish: false };
}

/**
 * Validates business data for gibberish before processing
 * Returns error message if gibberish is detected, null otherwise
 */
export function validateBusinessDataForGibberish(data: {
  business_name?: string;
  business_type?: string;
  business_description?: string;
  product_name?: string;
  product_description?: string;
  target_audience?: string;
  problem?: string;
  brand_voice?: string;
}): string | null {
  const result = isGibberishBusinessData(data);

  if (result.isGibberish) {
    return (
      result.reason ||
      "The provided business information appears to be nonsensical or unclear. Please provide clear, meaningful information about your business."
    );
  }

  return null;
}
