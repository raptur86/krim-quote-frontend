import { z } from "zod";

export const quoteBasicSchema = z.object({
  customerId: z
    .number()
    .int()
    .positive("고객을 선택해주세요."),

  inquiryPlatformId: z
    .number()
    .int()
    .positive()
    .nullable(),

  title: z
    .string()
    .trim()
    .min(1, "견적명을 입력해주세요."),

  writtenDate: z
    .string()
    .min(1, "작성일을 입력해주세요."),

  validUntil: z
    .string()
    .nullable(),

  expectedDuration: z
    .string()
    .nullable(),

  customerNote: z
    .string()
    .nullable(),

  internalMemo: z
    .string()
    .nullable(),
});

export type QuoteBasicFormValues =
  z.infer<typeof quoteBasicSchema>;