const KEY = "krim.auth.session";
export const AUTH_CHANGED = "krim:auth-changed";
export type Session = { accessToken: string; expiresAt: number };
export function readSession(): Session | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(KEY) ?? "null");
    if (typeof value?.accessToken === "string" && value.accessToken &&
        Number.isFinite(value.expiresAt) && value.expiresAt > Date.now()) return value;
  } catch { /* Invalid or unavailable storage. */ }
  return null;
}
export function clearSession() {
  try { sessionStorage.removeItem(KEY); } catch { /* Clear in-memory state too. */ }
  window.dispatchEvent(new Event(AUTH_CHANGED));
}
export function saveSession(session: Session) { sessionStorage.setItem(KEY, JSON.stringify(session)); }
