import { useEffect, useState, type PropsWithChildren } from "react";
import { AuthContext } from "./useAuth";
import { queryClient } from "../../services/queryClient";
import { getCurrentAdmin, loginApi, logoutApi } from "./api/authApi";
import { AUTH_CHANGED, clearSession, readSession, saveSession } from "./authSession";
import type { Admin, LoginRequest } from "./types/auth.types";
export function AuthProvider({ children }: PropsWithChildren) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(() => !!readSession());
  const [sessionError, setSessionError] = useState("");
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    const reset = () => {
      setAdmin(null); setExpiresAt(null);
      setSessionError("로그인이 만료되었습니다. 다시 로그인해주세요.");
      queryClient.clear();
    };
    window.addEventListener(AUTH_CHANGED, reset);
    const session = readSession();
    if (session) {
      getCurrentAdmin(controller.signal).then((current) => {
        if (controller.signal.aborted || readSession()?.accessToken !== session.accessToken) return;
        setAdmin(current); setExpiresAt(session.expiresAt);
      }).catch(() => {
        if (controller.signal.aborted) return;
        clearSession();
        setSessionError("로그인 상태를 확인하지 못했습니다. 다시 로그인해주세요.");
      }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    }
    return () => { controller.abort(); window.removeEventListener(AUTH_CHANGED, reset); };
  }, []);
  useEffect(() => {
    if (!expiresAt) return;
    const check = () => { if (Date.now() >= expiresAt) clearSession(); };
    const timer = window.setTimeout(check, Math.max(0, expiresAt - Date.now()));
    window.addEventListener("focus", check);
    return () => { window.clearTimeout(timer); window.removeEventListener("focus", check); };
  }, [expiresAt]);
  async function login(request: LoginRequest) {
    const result = await loginApi(request);
    const expiry = Date.now() + result.expiresIn * 1000;
    try { saveSession({ accessToken: result.accessToken, expiresAt: expiry }); }
    catch { throw new Error("브라우저의 저장소를 사용할 수 없습니다. 사이트 저장소 설정을 확인해주세요."); }
    queryClient.clear(); setSessionError(""); setExpiresAt(expiry); setAdmin(result.admin);
  }
  async function logout() {
    const token = readSession()?.accessToken;
    clearSession(); setSessionError("");
    if (token) { try { await logoutApi(token); } catch { /* Local logout succeeds even offline. */ } }
  }
  return <AuthContext.Provider value={{ admin, loading, sessionError, login, logout }}>{children}</AuthContext.Provider>;
}
