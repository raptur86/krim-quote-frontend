
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";

import { AuthContext } from "./useAuth";
import { queryClient } from "../../services/queryClient";

import {
  extendLoginApi,
  getCurrentAdmin,
  loginApi,
  logoutApi,
} from "./api/authApi";

import {
  AUTH_EXPIRED,
  clearSession,
  expireSession,
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
  const [admin, setAdmin] = useState<Admin | null>(null);

  const [loading, setLoading] = useState(
    () => !!readSession(),
  );

  const [sessionError, setSessionError] = useState("");

  const [expiresAt, setExpiresAt] = useState<number | null>(
    null,
  );

  const [extending, setExtending] = useState(false);

  const extendingRef = useRef(false);

  /**
   * 초기 로그인 상태 복원
   */
  useEffect(() => {
    const controller = new AbortController();

    function handleExpired() {
      setAdmin(null);
      setExpiresAt(null);
      setExtending(false);

      setSessionError(
        "로그인이 만료되었습니다. 다시 로그인해주세요.",
      );

      queryClient.clear();
    }

    window.addEventListener(
      AUTH_EXPIRED,
      handleExpired,
    );

    const session = readSession();

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

    getCurrentAdmin(controller.signal)
      .then((current) => {
        if (controller.signal.aborted) return;

        const latestSession = readSession();

        if (
          latestSession?.accessToken !==
          session.accessToken
        ) {
          return;
        }

        setAdmin(current);
        setExpiresAt(session.expiresAt);
      })
      .catch(() => {
        if (controller.signal.aborted) return;

        clearSession();

        setAdmin(null);
        setExpiresAt(null);

        setSessionError(
          "로그인 상태를 확인하지 못했습니다. 다시 로그인해주세요.",
        );

        queryClient.clear();
      })
      .finally(() => {
        if (!controller.signal.aborted) {
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

  /**
   * JWT 만료 타이머
   */
  useEffect(() => {
    if (!expiresAt) return;

    function checkExpiration() {
      const session = readSession();

      if (!session) {
        expireSession();
        return;
      }

      if (Date.now() >= session.expiresAt) {
        expireSession();
      }
    }

    const timer = window.setTimeout(
      checkExpiration,
      Math.max(0, expiresAt - Date.now()),
    );

    window.addEventListener(
      "focus",
      checkExpiration,
    );

    document.addEventListener(
      "visibilitychange",
      checkExpiration,
    );

    return () => {
      window.clearTimeout(timer);

      window.removeEventListener(
        "focus",
        checkExpiration,
      );

      document.removeEventListener(
        "visibilitychange",
        checkExpiration,
      );
    };
  }, [expiresAt]);

  /**
   * 로그인
   */
  const login = useCallback(
    async (request: LoginRequest) => {
      const result = await loginApi(request);

      const expiry =
        Date.now() + result.expiresIn * 1000;

      try {
        saveSession({
          accessToken: result.accessToken,
          expiresAt: expiry,
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
    },
    [],
  );

  /**
   * 로그인 연장
   */
  const extendLogin = useCallback(async () => {
    if (extendingRef.current) return;

    const session = readSession();

    if (!session) {
      expireSession();
      throw new Error(
        "로그인이 만료되었습니다. 다시 로그인해주세요.",
      );
    }

    const remaining = session.expiresAt - Date.now();

    if (remaining > 600_000) {
      throw new Error(
        "로그인 연장은 만료 10분 전부터 가능합니다.",
      );
    }

    extendingRef.current = true;
    setExtending(true);

    try {
      const result = await extendLoginApi(
        session.accessToken,
      );

      const currentSession = readSession();

      if (
        !currentSession ||
        currentSession.accessToken !==
          session.accessToken
      ) {
        throw new Error(
          "로그인 상태가 변경되었습니다. 다시 확인해주세요.",
        );
      }

      const newExpiry =
        Date.now() + result.expiresIn * 1000;

      saveSession({
        accessToken: result.accessToken,
        expiresAt: newExpiry,
      });

      setAdmin(result.admin);
      setExpiresAt(newExpiry);
      setSessionError("");
    } finally {
      extendingRef.current = false;
      setExtending(false);
    }
  }, []);

  /**
   * 로그아웃
   */
  const logout = useCallback(async () => {
    const token = readSession()?.accessToken;

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
  }, []);

  return (
    <AuthContext.Provider
      value={{
        admin,
        loading,
        sessionError,
        expiresAt,
        extending,
        login,
        logout,
        extendLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
