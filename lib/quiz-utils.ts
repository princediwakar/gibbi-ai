// lib/quiz-utils.ts
import React from "react";
import Katex from "@matejmazur/react-katex";
import { FlattenedQuestion, Quiz, Question, QuestionGroup, StructuredContent } from "@/types/quiz";
import { OptionSchema } from "@/lib/ai-utils";

// ======================== Type Definitions ========================
interface KatexProps {
  math: string;
  block?: boolean;
  key?: React.Key;
}

interface Option {
  key: string;
  value: string;
}

export interface GraphDataset {
  type: "bar" | "line" | "pie";
  title: string;
  labels: string[];
  datasets: { label: string; values: number[] }[];
}

interface TableData {
  headers: string[];
  rows: string[][];
}

// ======================== Option Parsing ========================
export const parseOptions = (options: string | Record<string, string>): Option[] => {
  let obj: unknown;
  if (typeof options === "string") {
    try {
      obj = JSON.parse(options);
    } catch (err) {
      console.error("Failed to parse options JSON:", err);
      obj = {};
    }
  } else {
    obj = options;
  }
  // Validate with Zod
  const parsed = OptionSchema.parse(obj);
  return Object.entries(parsed).map(([key, value]) => ({ key, value }));
};

// ======================== Quiz Flattening ========================
export const flattenQuizQuestions = (quiz: Quiz): FlattenedQuestion[] => {
  const flattened: FlattenedQuestion[] = [];

  quiz.questions?.forEach((question, index) => {
    if (isValidQuestion(question)) {
      flattened.push({
        question,
        supportingContent: null,
        source: "standalone",
        originalIndex: index,
      });
    }
  });

  quiz.question_groups?.forEach((group, groupIndex) => {
    if (!isValidQuestionGroup(group)) {
      console.warn(`Invalid question group at index ${groupIndex}`);
      return;
    }

    const supporting = group.supporting_content;
    if (!supporting) {
      console.warn(`Group ${group.group_id ?? groupIndex} missing supporting content.`);
      return;
    }

    const { content, type, caption } = supporting;
    // Validate graph/table content
    if (type === "graph" && !isValidGraphContent(content)) {
      console.error(`Invalid graph content in group ${group.group_id ?? groupIndex}`);
      return;
    }
    if (type === "table" && !isValidTableContent(content)) {
      console.error(`Invalid table content in group ${group.group_id ?? groupIndex}`);
      return;
    }

    const contentText =
      typeof content === "string" ? content.toLowerCase() : JSON.stringify(content).toLowerCase();

    group.questions.forEach((question, questionIndex) => {
      if (!isValidQuestion(question)) return;

      const qText = question.question_text.toLowerCase();
      const isRelevant = contentText
        .split(/\s+/)
        .some((word) => word.length > 3 && qText.includes(word));

      if (!isRelevant) {
        console.warn(
          `Question in group ${group.group_id ?? groupIndex} may not align with content: "${question.question_text}"`
        );
      }

      flattened.push({
        question,
        supportingContent: { content, type, caption: caption ?? "" },
        source: `group-${group.group_id ?? groupIndex}`,
        originalIndex: questionIndex,
      });
    });
  });

  return flattened;
};

// ======================== Graph Parsing ========================
export const parseGraphData = (content: string): GraphDataset | null => {
  try {
    const jsonData = JSON.parse(content) as Record<string, unknown>;
    if (jsonData && jsonData.type && Array.isArray(jsonData.labels) && Array.isArray(jsonData.datasets)) {
      const base = {
        type: jsonData.type as "bar" | "line" | "pie",
        title: (jsonData.title as string) || "Graph Data",
        labels: jsonData.labels.map(String),
      };

      if (jsonData.type === "pie") {
        return {
          ...base,
          datasets: [
            {
              label: (jsonData.datasets[0] as Record<string, unknown>)?.label as string || "Value",
              values: ((jsonData.datasets[0] as Record<string, unknown>)?.values as number[] || []).map(Number),
            },
          ],
        };
      }

      return {
        ...base,
        datasets: (jsonData.datasets as Record<string, unknown>[]).map((d: Record<string, unknown>) => ({
          label: d.label as string || "Series",
          values: (d.values as number[] || []).map(Number),
        })),
      };
    }
  } catch (error) {
    console.error("Graph JSON parse failed:", error);
  }
  return parseGraphDataFromText(content);
};

const parseGraphDataFromText = (content: string): GraphDataset | null => {
  const lines = content.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return null;

  const title = lines[0].includes(":") ? lines.shift()!.trim() : "Graph Data";
  const data: { label: string; value: number }[] = [];

  for (const line of lines) {
    const match = /([^:]+):\s*(\d+)/.exec(line) || /([^-]+)-\s*(\d+)/.exec(line);
    if (match) data.push({ label: match[1].trim(), value: Number(match[2]) });
  }

  if (data.length === 0) return null;
  return {
    type: "bar",
    title,
    labels: data.map((d) => d.label),
    datasets: [{ label: "Values", values: data.map((d) => d.value) }],
  };
};

// ======================== Table Parsing ========================
export const parseTableData = (content: string): TableData | null => {
  try {
    const jsonData = JSON.parse(content) as { headers: string[]; rows: unknown[][] };
    if (Array.isArray(jsonData.headers) && Array.isArray(jsonData.rows)) {
      return {
        headers: jsonData.headers.map(String),
        rows: jsonData.rows.map((r) => r.map(String)),
      };
    }
  } catch (error) {
    console.error("Table JSON parse failed:", error);
  }
  return parseTableDataFromText(content);
};

const parseTableDataFromText = (content: string): TableData | null => {
  const lines = content.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return null;

  const delimiters = ["|", ";", "\t", ","];
  let headers: string[] = [];
  let rows: string[][] = [];

  for (const delim of delimiters) {
    if (lines[0].includes(delim)) {
      headers = lines[0].split(delim).map((c) => c.trim());
      rows = lines.slice(1).map((line) => {
        const parts = line.split(delim).map((c) => c.trim());
        return parts.length < headers.length
          ? [...parts, ...Array(headers.length - parts.length).fill("")]
          : parts.slice(0, headers.length);
      });
      break;
    }
  }

  return headers.length && rows.length ? { headers, rows } : null;
};

// ======================== Validation Helpers ========================
const isValidQuestion = (q: Question): boolean =>
  typeof q.question_text === "string" &&
  typeof q.options === "object" &&
  q.options !== null &&
  typeof q.correct_option === "string";

const isValidQuestionGroup = (g: QuestionGroup): boolean =>
  Array.isArray(g.questions) &&
  g.questions.every(isValidQuestion) &&
  (!g.supporting_content ||
    (typeof g.supporting_content.content === "string" || typeof g.supporting_content.content === "object"));

const isValidGraphContent = (content: string | StructuredContent): boolean => {
  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content);
      return parsed && typeof parsed.type === 'string' && Array.isArray(parsed.labels) && Array.isArray(parsed.datasets);
    } catch {
      return false;
    }
  }
  return content && 'type' in content && 'labels' in content && 'datasets' in content && 
         typeof content.type === 'string' && Array.isArray(content.labels) && Array.isArray(content.datasets);
};

const isValidTableContent = (content: string | StructuredContent): boolean => {
  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content);
      return parsed && Array.isArray(parsed.headers) && Array.isArray(parsed.rows);
    } catch {
      return false;
    }
  }
  return content && 'headers' in content && 'rows' in content && 
         Array.isArray(content.headers) && Array.isArray(content.rows);
};

// ======================== Math Rendering ========================
export const renderMathContent = (text: string): React.ReactNode[] => {
  const parts = text.split(/(\$\$.*?\$\$|\$.*?\$)/g);
  return parts.map((part, idx) => {
    try {
      if (part.startsWith("$$") && part.endsWith("$$")) {
        return React.createElement(Katex as React.ComponentType<KatexProps>, {
          key: idx,
          math: part.slice(2, -2),
          block: true,
        });
      }
      if (part.startsWith("$") && part.endsWith("$")) {
        return React.createElement(Katex as React.ComponentType<KatexProps>, {
          key: idx,
          math: part.slice(1, -1),
        });
      }
      return React.createElement("span", { key: idx }, part);
    } catch (error) {
      console.error(`Math render error for part: ${part}`, error);
      return React.createElement("span", { key: idx, style: { color: "red" } }, part);
    }
  });
};
