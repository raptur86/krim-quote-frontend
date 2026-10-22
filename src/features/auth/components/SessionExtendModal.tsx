
import {
  useEffect,
  useState,
} from "react";

import {
  Clock3,
  ShieldAlert,
  RefreshCw,
} from "lucide-react";

import { useAuth } from "../useAuth";
import { apiErrorMessage } from "../../../services/apiClient";

import "./SessionExtendModal.css";

const WARNING_SECONDS = 600;

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds,
  ).padStart(2, "0")}`;
}

export function SessionExtendModal() {
  const {
    admin,
    expiresAt,
    extending,
    extendLogin,
  } = useAuth();

  const [now, setNow] = useState(Date.now());
  const [dismissedExpiry, setDismissedExpiry] =
    useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!admin || !expiresAt) return;

    setNow(Date.now());

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [admin, expiresAt]);

  useEffect(() => {
    setError("");
  }, [expiresAt]);

  if (!admin || !expiresAt) {
    return null;
  }

  const remainingSeconds = Math.max(
    0,
    Math.ceil((expiresAt - now) / 1000),
  );

  const isWarningTime =
    remainingSeconds > 0 &&
    remainingSeconds <= WARNING_SECONDS;

  if (
    !isWarningTime ||
    dismissedExpiry === expiresAt
  ) {
    return null;
  }

  async function handleExtend() {
    setError("");

    try {
      await extendLogin();
    } catch (caught) {
      setError(apiErrorMessage(caught));
    }
  }

  function handleDismiss() {
    setDismissedExpiry(expiresAt);
  }

  return (
    <div className="session-extend-overlay">
      <section
        className="session-extend-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-extend-title"
        aria-describedby="session-extend-description"
      >
        <div className="session-extend-icon">
          <ShieldAlert size={27} />
        </div>

        <h2 id="session-extend-title">
          로그인 시간이 곧 만료된다
        </h2>

        <p id="session-extend-description">
          보안을 위해 로그인 시간이 만료되면
          자동으로 로그아웃된다.
          <br />
          작업을 계속하려면 로그인 시간을 연장한다.
        </p>

        <div className="session-extend-timer">
          <div className="session-extend-timer-label">
            <Clock3 size={16} />
            남은 로그인 시간
          </div>

          <strong aria-live="off">
            {formatTime(remainingSeconds)}
          </strong>
        </div>

        {error && (
          <p
            className="session-extend-error"
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="session-extend-actions">
          <button
            type="button"
            className="session-extend-later"
            onClick={handleDismiss}
            disabled={extending}
          >
            나중에
          </button>

          <button
            type="button"
            className="session-extend-confirm"
            onClick={() => void handleExtend()}
            disabled={extending}
          >
            <RefreshCw
              size={16}
              className={
                extending ? "session-extend-spin" : ""
              }
            />

            {extending
              ? "연장 중..."
              : "로그인 연장"}
          </button>
        </div>

        <p className="session-extend-footnote">
          연장하면 현재 작성 중인 화면을 유지한다.
        </p>
      </section>
    </div>
  );
}
