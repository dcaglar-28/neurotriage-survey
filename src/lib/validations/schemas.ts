import { z } from "zod";

export const questionTypeSchema = z.enum([
  "short_text",
  "long_text",
  "multiple_choice",
  "multiple_select",
  "dropdown",
  "yes_no",
  "rating",
]);

export const answerSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.string()),
  z.null(),
]);

export const createTemplateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  slug: z.string().optional(),
});

export const saveResponseSchema = z.object({
  questionId: z.string().min(1),
  instanceKey: z.string().nullable().optional(),
  value: answerSchema,
  currentQuestionKey: z.string().nullable().optional(),
  complete: z.boolean().optional(),
});

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
