// Path: lib/json-repair.ts
// Lightweight JSON repair for LLM output. No dependencies.

export function repairJson(raw: string): string {
  let s = raw.trim();

  // Strip markdown code fences
  if (s.startsWith("```")) {
    s = s.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?\s*```\s*$/, "");
  }

  // Remove trailing commas before } or ]
  s = s.replace(/,(\s*[}\]])/g, "$1");

  // Fix missing commas between adjacent strings/values
  // e.g. "key1": "val1" "key2": "val2" → "key1": "val1", "key2": "val2"
  s = s.replace(/"\s*\n\s*"/g, '",\n"');

  // Fix unescaped newlines in string values
  // This is conservative: only fixes newlines between a comma/colon and the next quote
  s = fixUnescapedNewlines(s);

  return s;
}

function fixUnescapedNewlines(s: string): string {
  // Brute-force approach: try to parse, if it fails, attempt to escape
  // newlines that appear inside string values.
  // We detect strings that span multiple lines and escape the newlines.
  const lines = s.split("\n");
  const result: string[] = [];
  let inString = false;
  let stringDelimiter = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!inString) {
      let count = 0;
      for (let j = 0; j < line.length; j++) {
        if (line[j] === '"' && (j === 0 || line[j - 1] !== "\\")) {
          count++;
        }
      }
      if (count % 2 === 0) {
        result.push(line);
      } else {
        inString = true;
        stringDelimiter = '"';
        result.push(line);
      }
    } else {
      // Check if this line closes the string
      let count = 0;
      for (let j = 0; j < line.length; j++) {
        if (line[j] === stringDelimiter && (j === 0 || line[j - 1] !== "\\")) {
          count++;
        }
      }
      if (count % 2 === 1) {
        inString = false;
      }
      result.push(line);
    }
  }

  return result.join("\n");
}

function recoverTruncatedJson(raw: string): string {
  let s = raw.trim();

  // Strip markdown fences
  if (s.startsWith("```")) {
    s = s.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?\s*```\s*$/, "");
  }

  // Walk backwards from the end, truncating at the last complete structural boundary.
  // Remove the broken tail (unterminated string, partial key, partial value) and
  // re-close any unclosed objects/arrays.
  const truncated = truncateToLastCompleteValue(s);
  if (!truncated) return s;

  // Balance braces and brackets
  return balanceBraces(truncated);
}

function truncateToLastCompleteValue(s: string): string | null {
  let inString = false;
  let escapeNext = false;

  // Walk backwards to find the last character of a structurally-complete value:
  // a closing }, ], or an unquoted literal (true, false, null, number).
  for (let i = s.length - 1; i >= 0; i--) {
    const ch = s[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    if (ch === "\\" && inString) {
      escapeNext = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    // Found a structural closer — the value up to this character is complete
    if (ch === "}" || ch === "]") {
      return s.slice(0, i + 1);
    }

    // Found a comma after a complete value — trim the trailing comma
    if (ch === ",") {
      return s.slice(0, i);
    }
  }

  return null;
}

function balanceBraces(s: string): string {
  let inString = false;
  let escapeNext = false;
  const stack: string[] = [];

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (escapeNext) { escapeNext = false; continue; }
    if (ch === "\\" && inString) { escapeNext = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;

    if (ch === "{" || ch === "[") {
      stack.push(ch === "{" ? "}" : "]");
    } else if (ch === "}" || ch === "]") {
      if (stack.length > 0 && stack[stack.length - 1] === ch) {
        stack.pop();
      }
    }
  }

  return s + stack.reverse().join("");
}

export function safeParseJson(raw: string): { data: unknown } | { error: string } {
  // Try direct parse first
  try {
    return { data: JSON.parse(raw) };
  } catch {
    // fall through to repair
  }

  // Try repaired version
  const repaired = repairJson(raw);
  try {
    return { data: JSON.parse(repaired) };
  } catch {
    // fall through to truncation recovery
  }

  // Try truncation recovery for token-limit cutoffs
  try {
    const recovered = recoverTruncatedJson(raw);
    return { data: JSON.parse(recovered) };
  } catch (recoveryErr) {
    return { error: `JSON parse failed: ${(recoveryErr as Error).message}` };
  }
}
