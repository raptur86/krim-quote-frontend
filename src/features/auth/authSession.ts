const KEY =
  "krim.auth.session";

export const AUTH_EXPIRED =
  "krim:auth-expired";

export type Session = {
  accessToken: string;
  expiresAt: number;
};

export function readSession():
  | Session
  | null {
  try {
    const value =
      JSON.parse(
        sessionStorage.getItem(KEY) ??
          "null",
      );

    if (
      typeof value?.accessToken ===
        "string" &&
      value.accessToken &&
      Number.isFinite(
        value.expiresAt,
      ) &&
      value.expiresAt > Date.now()
    ) {
      return value;
    }
  } catch {
    // Invalid or unavailable storage.
  }

  return null;
}

export function saveSession(
  session: Session,
) {
  sessionStorage.setItem(
    KEY,
    JSON.stringify(session),
  );
}

/**
 * 세션 데이터만 삭제한다.
 *
 * 정상 로그아웃에서도 사용하므로
 * 만료 이벤트를 발생시키지 않는다.
 */
export function clearSession() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Ignore storage error.
  }
}

/**
 * 인증이 실제로 만료되었을 때만 사용한다.
 */
export function expireSession() {
  clearSession();

  window.dispatchEvent(
    new Event(AUTH_EXPIRED),
  );
}