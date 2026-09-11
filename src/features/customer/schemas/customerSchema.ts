import { z } from "zod";

export const customerSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(1, "고객명을 입력해주세요.")
    .max(100, "고객명은 100자 이하로 입력해주세요."),

  companyName: z
    .string()
    .trim()
    .max(150, "회사명은 150자 이하로 입력해주세요."),

  contactName: z
    .string()
    .trim()
    .max(100, "담당자명은 100자 이하로 입력해주세요."),

  phone: z
    .string()
    .trim()
    .max(50, "연락처는 50자 이하로 입력해주세요."),

  email: z
    .string()
    .trim()
    .max(150, "이메일은 150자 이하로 입력해주세요.")
    .refine(
      (value) =>
        value === "" ||
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      "올바른 이메일 형식으로 입력해주세요.",
    ),

  businessNumber: z
    .string()
    .trim()
    .max(30, "사업자등록번호는 30자 이하로 입력해주세요."),

  address: z
    .string()
    .trim()
    .max(500, "주소는 500자 이하로 입력해주세요."),

  initialSource: z.string().trim(),

  memo: z.string().trim(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;