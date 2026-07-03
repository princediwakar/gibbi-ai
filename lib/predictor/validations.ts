import { z } from "zod"

export const PredictorStartSchema = z.object({
  phone: z.string().min(10).max(15),
  exam_name: z.string().min(1),
  target_date: z.string().min(1),
})

export const PredictorVerifySchema = z.object({
  phone: z.string().min(10).max(15),
  otp: z.string().length(6),
})

export type PredictorStartInput = z.infer<typeof PredictorStartSchema>
export type PredictorVerifyInput = z.infer<typeof PredictorVerifySchema>
