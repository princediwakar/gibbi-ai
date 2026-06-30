// Path: lib/validations/tutor.ts
import { z } from "zod";
import taxonomy from "@/lib/taxonomies.json";

type TaxonomyData = Record<string, Record<string, string[]>>;
const taxonomyData = taxonomy as unknown as TaxonomyData;
const EXAM_NAMES = Object.keys(taxonomyData).filter((k) => k !== "_schema_version");
const ANSWER_OPTIONS = ["A", "B", "C", "D"] as const;
const ASSESSMENT_LEVELS = ["weak", "okay", "strong"] as const;

export const SessionStartSchema = z.object({
  exam_profile_id: z.string().uuid("Enter a valid exam profile ID"),
  question_count: z
    .number()
    .int("Question count must be a whole number")
    .min(3, "Enter at least 3 questions")
    .max(50, "Enter at most 50 questions")
    .default(10),
  focus_domains: z
    .array(z.string().min(1, "Domain name cannot be empty"))
    .optional(),
});
export type SessionStartInput = z.infer<typeof SessionStartSchema>;

export const SessionAnswerSchema = z.object({
  session_id: z.string().uuid("Enter a valid session ID"),
  question_id: z.string().min(1, "Enter a question ID"),
  selected_option: z
    .enum(ANSWER_OPTIONS)
    .nullable(),
  time_to_answer_ms: z
    .number()
    .int("Response time must be a whole number of milliseconds")
    .positive("Response time must be greater than 0"),
  was_revealed: z.boolean(),
});
export type SessionAnswerInput = z.infer<typeof SessionAnswerSchema>;

export const SessionCompleteSchema = z.object({
  session_id: z.string().uuid("Enter a valid session ID"),
});
export type SessionCompleteInput = z.infer<typeof SessionCompleteSchema>;

export const ExamProfileSchema = z
  .object({
    exam_name: z.enum(EXAM_NAMES as [string, ...string[]], {
      errorMap: () => ({ message: "Enter a valid exam name" }),
    }),
    target_date: z.string().refine(
      (date) => {
        const parsed = Date.parse(date);
        if (isNaN(parsed)) return false;
        return new Date(parsed) > new Date();
      },
      "Enter a future date in ISO format (e.g. 2026-12-31)"
    ),
    self_assessments: z
      .record(
        z.string().min(1, "Subject name cannot be empty"),
        z.enum(ASSESSMENT_LEVELS, {
          errorMap: () => ({ message: "Self-assessment must be weak, okay, or strong" }),
        })
      )
      .refine(
        (assessments) => Object.keys(assessments).length > 0,
        "Add at least one self-assessment"
      ),
  })
  .refine(
    (data) => {
      const examSubjects = Object.keys(
        taxonomyData[data.exam_name] || {}
      );
      const assessedSubjects = Object.keys(data.self_assessments);
      return assessedSubjects.every((subject) => examSubjects.includes(subject));
    },
    {
      message: "Each self-assessed subject must belong to the selected exam",
      path: ["self_assessments"],
    }
  );
export type ExamProfileInput = z.infer<typeof ExamProfileSchema>;
