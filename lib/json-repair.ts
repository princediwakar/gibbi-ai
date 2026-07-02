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
  } catch (repairErr) {
    return { error: `JSON parse failed: ${(repairErr as Error).message}` };
  }
}
