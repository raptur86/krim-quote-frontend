import {
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";

import { AuthContext } from "./useAuth";

import {
  queryClient,
} from "../../services/queryClient";

import {
  getCurrentAdmin,
  loginApi,
  logoutApi,
} from "./api/authApi";

import {
  AUTH_EXPIRED,
  clearSession,
  readSession,
  saveSession,
} from "./authSession";

import type {
  Admin,
  LoginRequest,
} from "./types/auth.types";


export function AuthProvider({
  children,
}: PropsWithChildren) {
  const [admin, setAdmin] =
    useState<Admin | null>(null);

  const [loading, setLoading] =
    useState(
      () => !!readSession(),
    );

  const [
    sessionError,
    setSessionError,
  ] = useState("");

  const [
    expiresAt,
    setExpiresAt,
  ] = useState<number | null>(
    null,
  );


  /* =========================================================
   * Initial Session
   * ========================================================= */

  useEffect(() => {
    const controller =
      new AbortController();

    function handleExpired() {
      setAdmin(null);
      setExpiresAt(null);

      setSessionError(
        "로그인이 만료되었습니다. 다시 로그인해주세요.",
      );

      queryClient.clear();
    }

    window.addEventListener(
      AUTH_EXPIRED,
      handleExpired,
    );

    const session =
      readSession();

    if (!session) {
      setLoading(false);

      return () => {
        controller.abort();

        window.removeEventListener(
          AUTH_EXPIRED,
          handleExpired,
        );
      };
    }

    getCurrentAdmin(
      controller.signal,
    )
      .then((current) => {
        if (
          controller.signal.aborted
        ) {
          return;
        }

        const latestSession =
          readSession();

        if (
          latestSession
            ?.accessToken !==
          session.accessToken
        ) {
          return;
        }

        setAdmin(current);

        setExpiresAt(
          session.expiresAt,
        );
      })
      .catch(() => {
        if (
          controller.signal.aborted
        ) {
          return;
        }

        clearSession();

        setAdmin(null);

        setExpiresAt(null);

        setSessionError(
          "로그인 상태를 확인하지 못했습니다. 다시 로그인해주세요.",
        );
      })
      .finally(() => {
        if (
          !controller.signal.aborted
        ) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();

      window.removeEventListener(
        AUTH_EXPIRED,
        handleExpired,
      );
    };
  }, []);


  /* =========================================================
   * Expiration Timer
   * ========================================================= */

  useEffect(() => {
    if (!expiresAt) {
      return;
    }

    function checkExpiration() {
      if (
        expiresAt &&
        Date.now() >= expiresAt
      ) {
        clearSession();

        setAdmin(null);

        setExpiresAt(null);

        setSessionError(
          "로그인이 만료되었습니다. 다시 로그인해주세요.",
        );

        queryClient.clear();
      }
    }

    const timer =
      window.setTimeout(
        checkExpiration,
        Math.max(
          0,
          expiresAt - Date.now(),
        ),
      );

    window.addEventListener(
      "focus",
      checkExpiration,
    );

    return () => {
      window.clearTimeout(timer);

      window.removeEventListener(
        "focus",
        checkExpiration,
      );
    };
  }, [expiresAt]);


  /* =========================================================
   * Login
   * ========================================================= */

  async function login(
    request: LoginRequest,
  ) {
    const result =
      await loginApi(request);

    const expiry =
      Date.now() +
      result.expiresIn * 1000;

    try {
      saveSession({
        accessToken:
          result.accessToken,

        expiresAt:
          expiry,
      });
    } catch {
      throw new Error(
        "브라우저의 저장소를 사용할 수 없습니다. 사이트 저장소 설정을 확인해주세요.",
      );
    }

    queryClient.clear();

    setSessionError("");

    setExpiresAt(expiry);

    setAdmin(result.admin);
  }


  /* =========================================================
   * Logout
   * ========================================================= */

  async function logout() {
    const token =
      readSession()?.accessToken;

    /**
     * 정상 로그아웃.
     *
     * AUTH_EXPIRED를 발생시키지 않는다.
     */
    clearSession();

    setAdmin(null);
    setExpiresAt(null);
    setSessionError("");

    queryClient.clear();

    if (token) {
      try {
        await logoutApi(token);
      } catch {
        // 서버 로그아웃 실패와 관계없이
        // 로컬 로그아웃은 완료한다.
      }
    }
  }


  return (
    <AuthContext.Provider
      value={{
        admin,
        loading,
        sessionError,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}