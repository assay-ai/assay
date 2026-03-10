/**
 * Safely extracts and parses JSON from LLM responses that may contain
 * markdown fences, surrounding text, or minor formatting issues.
 */

/**
 * Strip markdown code fences from a string.
 * Handles ```json, ```, and triple-backtick variants.
 */
function stripCodeFences(text: string): string {
  const fencePattern = /```(?:json|JSON)?\s*\n?([\s\S]*?)```/;
  const match = fencePattern.exec(text);
  if (match?.[1]) {
    return match[1].trim();
  }
  return text;
}

/**
 * Remove trailing commas before closing braces/brackets.
 * Handles nested structures.
 */
function removeTrailingCommas(text: string): string {
  return text.replace(/,\s*([\]}])/g, "$1");
}

/**
 * Attempt to extract the first JSON object or array from a string
 * by finding balanced braces/brackets.
 */
function extractJsonSubstring(text: string): string | null {
  const startChars = ["{", "["];

  for (const startChar of startChars) {
    const endChar = startChar === "{" ? "}" : "]";
    const startIdx = text.indexOf(startChar);
    if (startIdx === -1) continue;

    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let i = startIdx; i < text.length; i++) {
      const char = text[i];

      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === "\\") {
        escaped = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        continue;
      }

      if (inString) continue;

      if (char === startChar) {
        depth++;
      } else if (char === endChar) {
        depth--;
        if (depth === 0) {
          return text.slice(startIdx, i + 1);
        }
      }
    }
  }

  return null;
}

/**
 * Attempt to extract JSON using regex patterns for common LLM output formats.
 */
function regexFallback(text: string): unknown | null {
  // Try to find a JSON-like object pattern
  const patterns = [
    /\{[\s\S]*"[\w]+"[\s\S]*:[\s\S]*\}/,
    /\[[\s\S]*\{[\s\S]*\}[\s\S]*\]/,
    /\[[\s\S]*"[\s\S]*"\s*(?:,\s*"[\s\S]*")*\s*\]/,
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match) {
      try {
        return JSON.parse(removeTrailingCommas(match[0]));
      } catch {
        // Continue to next pattern
      }
    }
  }

  return null;
}

export interface ParseJsonOptions {
  /** If true, returns null instead of throwing on failure */
  silent?: boolean;
}

/**
 * Parse JSON from an LLM response string. Applies multiple strategies:
 * 1. Direct JSON.parse
 * 2. Strip markdown code fences, then parse
 * 3. Remove trailing commas, then parse
 * 4. Extract JSON substring by balanced braces
 * 5. Regex fallback extraction
 *
 * @throws {Error} if all strategies fail and `silent` is not set
 */
export function parseJson<T = unknown>(text: string, options: ParseJsonOptions = {}): T | null {
  const trimmed = text.trim();

  // Strategy 1: Direct parse
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    // Continue
  }

  // Strategy 2: Strip code fences
  const stripped = stripCodeFences(trimmed);
  try {
    return JSON.parse(stripped) as T;
  } catch {
    // Continue
  }

  // Strategy 3: Remove trailing commas from stripped text
  const cleaned = removeTrailingCommas(stripped);
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // Continue
  }

  // Strategy 4: Extract JSON substring by balanced braces
  const extracted = extractJsonSubstring(trimmed);
  if (extracted) {
    try {
      return JSON.parse(removeTrailingCommas(extracted)) as T;
    } catch {
      // Continue
    }
  }

  // Strategy 5: Regex fallback
  const regexResult = regexFallback(trimmed);
  if (regexResult !== null) {
    return regexResult as T;
  }

  if (options.silent) {
    return null;
  }

  throw new Error(
    `Failed to parse JSON from LLM response. Input (first 200 chars): ${trimmed.slice(0, 200)}`,
  );
}

/**
 * Convenience wrapper that always returns null on failure.
 */
export function tryParseJson<T = unknown>(text: string): T | null {
  return parseJson<T>(text, { silent: true });
}
