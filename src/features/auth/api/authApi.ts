import { z } from "zod";
import { apiClient } from "../../../services/apiClient";
import type { ApiResponse } from "../../../types/api.types";
import type { LoginRequest } from "../types/auth.types";
const adminSchema = z.object({ id: z.number(), email: z.string(), name: z.string() });
const loginResponseSchema = z.object({
  accessToken: z.string().min(1), tokenType: z.literal("Bearer"),
  expiresIn: z.number().positive(), admin: adminSchema,
});
function parseData<T>(response: ApiResponse<unknown>, schema: z.ZodType<T>): T {
  if (response?.code === "AUTH_INVALID_CREDENTIALS") throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
  if (!response?.success) throw new Error("요청을 처리하지 못했습니다. 입력 내용을 확인해주세요.");
  const parsed = schema.safeParse(response.data);
  if (!parsed.success) throw new Error("서버 응답 형식이 올바르지 않습니다. 관리자에게 문의해주세요.");
  return parsed.data;
}
export async function loginApi(request: LoginRequest) {
  const { data } = await apiClient.post<ApiResponse<unknown>>("/auth/login", request);
  return parseData(data, loginResponseSchema);
}
export async function getCurrentAdmin(signal?: AbortSignal) {
  const { data } = await apiClient.get<ApiResponse<unknown>>("/auth/me", { signal });
  const admin = parseData(data, adminSchema.extend({ status: z.string() }));
  if (admin.status !== "ACTIVE") throw new Error("사용할 수 없는 관리자 계정입니다.");
  return admin;
}
export async function logoutApi(accessToken: string) {
  // Explicit header survives immediate local session cleanup.
  await apiClient.post("/auth/logout", null, { headers: { Authorization: `Bearer ${accessToken}` } });
}
