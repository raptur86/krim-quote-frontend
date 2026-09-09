import axios from "axios";
import { clearSession, readSession } from "../features/auth/authSession";
export const apiClient = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1", timeout: 15000 });
apiClient.interceptors.request.use((config) => {
  if (config.url !== "/auth/login" && !config.url?.startsWith("/public/")) {
    const session = readSession();
    if (session && !config.headers.Authorization) config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});
apiClient.interceptors.response.use((response) => response, (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 401 &&
      error.config?.headers.Authorization &&
      error.config.headers.Authorization === `Bearer ${readSession()?.accessToken}`) clearSession();
  return Promise.reject(error);
});
export function apiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED") return "서버 응답이 늦어지고 있습니다. 잠시 후 다시 시도해주세요.";
    if (!error.response || error.response.status >= 500) return "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.";
    if (error.response.status === 401) return "이메일 또는 비밀번호가 올바르지 않습니다.";
    if (error.response.status === 429) return "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.";
    if (error.response.status === 404) return "로그인 서비스를 찾을 수 없습니다. 서버 연결 설정을 확인해주세요.";
    return "요청을 처리하지 못했습니다. 입력 내용을 확인하고 다시 시도해주세요.";
  }
  return error instanceof Error ? error.message : "요청을 처리하지 못했습니다.";
}
