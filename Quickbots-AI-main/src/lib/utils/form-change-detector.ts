/**
 * Normalizes a value for comparison by trimming and normalizing whitespace
 */
function normalizeValue(value: unknown): unknown {
  if (typeof value === "string") {
    // Trim and normalize whitespace (multiple spaces become single space)
    return value.trim().replace(/\s+/g, " ");
  }
  if (Array.isArray(value)) {
    return value.map(normalizeValue);
  }
  if (value && typeof value === "object") {
    const normalized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      normalized[key] = normalizeValue(val);
    }
    return normalized;
  }
  return value;
}

/**
 * Checks if two values are different after normalization
 * Returns true if there are actual content changes (ignoring whitespace)
 */
function hasContentChange(
  original: unknown,
  current: unknown
): boolean {
  const normalizedOriginal = normalizeValue(original);
  const normalizedCurrent = normalizeValue(current);

  // Deep comparison
  return JSON.stringify(normalizedOriginal) !== JSON.stringify(normalizedCurrent);
}

/**
 * Checks if form data has actual content changes compared to original data
 * This ignores whitespace-only changes (spaces, tabs, newlines)
 * 
 * @param originalData - The original/saved form data
 * @param currentData - The current form values
 * @returns true if there are actual content changes, false if only whitespace differences
 */
export function hasActualFormChanges<T extends Record<string, unknown>>(
  originalData: T,
  currentData: T
): boolean {
  // Get all keys from both objects
  const allKeys = new Set([
    ...Object.keys(originalData || {}),
    ...Object.keys(currentData || {}),
  ]);

  // Check each field for actual changes
  for (const key of allKeys) {
    const originalValue = originalData?.[key];
    const currentValue = currentData?.[key];

    // If values are different after normalization, there's a real change
    if (hasContentChange(originalValue, currentValue)) {
      return true;
    }
  }

  return false;
}

/**
 * Normalizes a single value for display/storage
 * Useful for trimming form fields before saving
 */
export function normalizeFormValue(value: unknown): unknown {
  return normalizeValue(value);
}

