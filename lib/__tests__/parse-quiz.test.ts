import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { cleanResponse, parseQuiz, parseWithRecovery } from "../parse/quiz";
import { QuestionSchema } from "../schemas/quiz";

// Dummy retry functions that throw — tests should succeed without needing retries
const failRetry = async (): Promise<string> => {
  throw new Error("should not retry");
};

const failRetry2 = async (): Promise<string> => {
  throw new Error("should not retry2");
};

// ============================================================
// Structural failure tests
// ============================================================

describe("parseWithRecovery — structural resilience", () => {
  it("handles truncated JSON mid-object by extracting partial valid questions", async () => {
    // Build a valid JSON with 3 questions, then truncate midway through the last one
    const fullJson = JSON.stringify({
      questions: [
        {
          question_text: "What is 2+2?",
          options: { A: "3", B: "4", C: "5", D: "6" },
          correct_option: "B",
          explanation: "Basic arithmetic.",
        },
        {
          question_text: "What is 3+3?",
          options: { A: "5", B: "6", C: "7", D: "8" },
          correct_option: "B",
          explanation: "More arithmetic.",
        },
        {
          question_text: "Broken question",
          options: { A: "x" },
        },
      ],
    });

    // Truncate mid-object: slice right after the beginning of the broken question
    const marker = '"question_text":"Broken question"';
    const truncated = fullJson.slice(0, fullJson.lastIndexOf(marker));

    const result = await parseWithRecovery(
      truncated,
      QuestionSchema,
      2,
      failRetry,
    );

    assert.ok(result.questions.length >= 1, "Should recover at least 1 valid question");
    // recovered may be false if recoverTruncatedJson balanced the braces successfully
    assert.equal(result.retried, false, "Should not have retried");
  });

  it("handles markdown-wrapped JSON", async () => {
    const raw = '```json\n{"questions":[{"question_text":"What is 2+2?","options":{"A":"3","B":"4","C":"5","D":"6"},"correct_option":"B","explanation":"Basic arithmetic."}]}\n```';

    const result = await parseWithRecovery(
      raw,
      QuestionSchema,
      1,
      failRetry,
    );

    assert.equal(result.questions.length, 1, "Should extract the question from markdown");
    assert.equal(result.recovered, false, "Full parse should succeed after cleaning");
    assert.equal(result.retried, false);
  });

  it("handles missing closing braces via safeParseJson recovery", async () => {
    // Missing the closing } on the options object and outer object
    const raw = '{"questions":[{"question_text":"What is 2+2?","options":{"A":"3","B":"4","C":"5","D":"6"},"correct_option":"B","explanation":"Math"}';

    const result = await parseWithRecovery(
      raw,
      QuestionSchema,
      1,
      failRetry,
    );

    assert.ok(result.questions.length >= 1, "Should recover via truncation");
  });

  it("handles trailing comma before }", async () => {
    const raw = '{"questions":[{"question_text":"What is 2+2?","options":{"A":"3","B":"4","C":"5","D":"6"},"correct_option":"B","explanation":"Math",}]}';

    const result = await parseWithRecovery(
      raw,
      QuestionSchema,
      1,
      failRetry,
    );

    assert.equal(result.questions.length, 1, "Should parse despite trailing comma");
    assert.equal(result.recovered, false, "Full parse should succeed after repair");
    assert.equal(result.retried, false);
  });

  it("happy path: valid nested question_groups", async () => {
    const raw = JSON.stringify({
      title: "Test Quiz",
      description: "A test",
      topic: "Testing",
      subject: "CS",
      language: "English",
      difficulty: "Easy",
      question_groups: [
        {
          group_id: "g1",
          group_title: "Passage 1",
          supporting_content: {
            type: "text",
            content: "Some passage text.",
          },
          questions: [
            {
              question_text: "What does the passage mean?",
              options: { A: "X", B: "Y", C: "Z", D: "W" },
              correct_option: "A",
              explanation: "Because.",
            },
          ],
        },
      ],
      questions: [
        {
          question_text: "Standalone Q",
          options: { A: "1", B: "2", C: "3", D: "4" },
          correct_option: "C",
          explanation: "Standalone.",
        },
      ],
    });

    const result = await parseWithRecovery(
      raw,
      QuestionSchema,
      2,
      failRetry,
    );

    assert.equal(result.questions.length, 2, "Should extract both grouped and standalone questions");
    assert.equal(result.recovered, false);
    assert.equal(result.retried, false);
  });

  it("empty questions array triggers extraction fallback", async () => {
    const raw = JSON.stringify({
      questions: [],
    });

    // Extraction of empty JSON objects may find no questions — should throw
    await assert.rejects(
      () => parseWithRecovery(raw, QuestionSchema, 1, failRetry),
      /Failed to parse or generate valid questions/,
    );
  });
});

// ============================================================
// Content hallucination tests
// ============================================================

describe("parseWithRecovery — content coercion", () => {
  it("coerces string options into object format (array-style)", async () => {
    // options as an array of strings instead of {A: "..."}
    const raw = JSON.stringify({
      questions: [
        {
          question_text: "What is the capital?",
          options: ["Paris", "London", "Berlin", "Madrid"],
          correct_option: "A",
          explanation: "Paris is the capital of France.",
        },
      ],
    });

    const result = await parseWithRecovery(
      raw,
      QuestionSchema,
      1,
      failRetry,
    );

    assert.equal(result.questions.length, 1);
    const q = result.questions[0] as Record<string, unknown>;
    const opts = q.options as Record<string, string>;
    assert.equal(typeof opts, "object");
    assert.equal(opts.A, "Paris");
    assert.equal(opts.B, "London");
    assert.equal(result.recovered, false);
  });

  it("coerces number-as-string for time_estimate_seconds", async () => {
    const raw = JSON.stringify({
      questions: [
        {
          question_text: "Timed question",
          options: { A: "Fast", B: "Slow", C: "Medium", D: "None" },
          correct_option: "A",
          explanation: "Time matters.",
          time_estimate_seconds: "45",
        },
      ],
    });

    const result = await parseWithRecovery(
      raw,
      QuestionSchema,
      1,
      failRetry,
    );

    assert.equal(result.questions.length, 1);
    const q = result.questions[0] as Record<string, unknown>;
    assert.equal(typeof q.time_estimate_seconds, "number");
    assert.equal(q.time_estimate_seconds, 45);
  });

  it("rejects null options (missing required field)", async () => {
    const raw = JSON.stringify({
      questions: [
        {
          question_text: "A question without options",
          options: null,
          correct_option: "A",
          explanation: "Oops.",
        },
      ],
    });

    // This should fail — null options won't coerce, extraction finds no valid questions, retry fails
    await assert.rejects(
      () => parseWithRecovery(raw, QuestionSchema, 1, failRetry),
      /Failed to parse or generate valid questions/,
    );
  });

  it("wraps single topic string into array", async () => {
    const raw = JSON.stringify({
      questions: [
        {
          question_text: "Topic test",
          options: { A: "a", B: "b", C: "c", D: "d" },
          correct_option: "A",
          explanation: "Testing.",
          topics: "algebra",
        },
      ],
    });

    const result = await parseWithRecovery(
      raw,
      QuestionSchema,
      1,
      failRetry,
    );

    assert.equal(result.questions.length, 1);
    const q = result.questions[0] as Record<string, unknown>;
    assert.ok(Array.isArray(q.topics));
    assert.equal((q.topics as string[])[0], "algebra");
  });
});

// ============================================================
// parseQuiz direct validation
// ============================================================

describe("parseQuiz — strict parsing", () => {
  it("parses a valid complete quiz", () => {
    const raw = JSON.stringify({
      title: "Math Quiz",
      description: "Basic math questions",
      topic: "Arithmetic",
      subject: "Mathematics",
      language: "English",
      difficulty: "Easy",
      questions: [
        {
          question_text: "What is 1+1?",
          options: { A: "1", B: "2", C: "3", D: "4" },
          correct_option: "B",
          explanation: "1+1=2.",
        },
      ],
    });

    const quiz = parseQuiz(raw);
    assert.equal(quiz.title, "Math Quiz");
    assert.equal(quiz.questions?.length, 1);
  });

  it("throws on invalid JSON", () => {
    assert.throws(
      () => parseQuiz("not json at all {{{"),
      /Invalid JSON/,
    );
  });

  it("throws on quiz with invalid schema", () => {
    const raw = JSON.stringify({
      title: "Bad Quiz",
      description: "Missing required fields",
      // missing topic, subject, language, difficulty
    });

    assert.throws(
      () => parseQuiz(raw),
    );
  });
});

// ============================================================
// cleanResponse unit tests
// ============================================================

describe("cleanResponse", () => {
  it("strips markdown code fences", () => {
    const input = '```json\n{"key": "value"}\n```';
    const result = cleanResponse(input);
    assert.equal(result, '{"key": "value"}');
  });

  it("truncates at END_OF_JSON marker", () => {
    const input = '{"key": "value"}END_OF_JSON some trailing text';
    const result = cleanResponse(input);
    assert.equal(result, '{"key": "value"}');
  });

  it("removes control characters", () => {
    const input = '{"key":\x00 "value"\x1F}';
    const result = cleanResponse(input);
    assert.equal(result, '{"key": "value"}');
  });
});
