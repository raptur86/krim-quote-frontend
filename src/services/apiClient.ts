
import axios from "axios";

import {
  expireSession,
  readSession,
} from "../features/auth/authSession";

export const apiClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "/api/v1",

  timeout: 15000,
});

/**
 * Request Interceptor
 */
apiClient.interceptors.request.use((config) => {
  const isPublicRequest =
    config.url === "/auth/login" ||
    config.url?.startsWith("/public/");

  if (!isPublicRequest) {
    const session = readSession();

    if (
      session &&
      !config.headers.Authorization
    ) {
      config.headers.Authorization =
        `Bearer ${session.accessToken}`;
    }
  }

  return config;
});

/**
 * Response Interceptor
 */
apiClient.interceptors.response.use(
  (response) => response,

  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401
    ) {
      const currentSession = readSession();

      const requestAuthorization =
        error.config?.headers?.Authorization;

      /**
       * 현재 저장된 JWT로 요청한 경우에만
       * 세션 만료 처리한다.
       *
       * 연장 이전 JWT로 발생한 늦은 401은
       * 새 JWT를 무효화하지 않는다.
       */
      if (
        currentSession &&
        requestAuthorization ===
          `Bearer ${currentSession.accessToken}`
      ) {
        expireSession();
      }
    }

    return Promise.reject(error);
  },
);

/**
 * API Error Message
 */
export function apiErrorMessage(
  error: unknown,
): string {
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED") {
      return "서버 응답이 늦어지고 있습니다. 잠시 후 다시 시도해주세요.";
    }

    if (
      !error.response ||
      error.response.status >= 500
    ) {
      return "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.";
    }

    if (error.response.status === 401) {
      return "로그인이 만료되었거나 인증 정보가 올바르지 않습니다.";
    }

    if (error.response.status === 429) {
      return "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.";
    }

    return (
      error.response.data?.message ||
      "요청을 처리하지 못했습니다. 입력 내용을 확인해주세요."
    );
  }

  return error instanceof Error
    ? error.message
    : "요청을 처리하지 못했습니다.";
}
