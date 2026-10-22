
const KEY = "krim.auth.session";

export const AUTH_EXPIRED = "krim:auth-expired";

export type Session = {
  accessToken: string;
  expiresAt: number;
};

export function readSession(): Session | null {
  try {
    const value = JSON.parse(
      sessionStorage.getItem(KEY) ?? "null",
    );

    if (
      typeof value?.accessToken === "string" &&
      value.accessToken &&
      Number.isFinite(value.expiresAt) &&
      value.expiresAt > Date.now()
    ) {
      return value as Session;
    }
  } catch {
    // 저장소 접근 실패 또는 잘못된 데이터
  }

  return null;
}

export function saveSession(session: Session) {
  sessionStorage.setItem(
    KEY,
    JSON.stringify(session),
  );
}

export function clearSession() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // 저장소 접근 실패 무시
  }
}

/**
 * 인증 만료 처리
 *
 * 정상 로그아웃과 구분하여
 * AuthProvider에 만료 이벤트를 전달한다.
 */
export function expireSession() {
  clearSession();

  window.dispatchEvent(
    new Event(AUTH_EXPIRED),
  );
}
