
import { useState, type FormEvent } from "react";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  LoaderCircle,
  Save,
  X,
} from "lucide-react";

import {
  useCreatePlatform,
  useUpdatePlatform,
  useChangePlatformActive,
} from "../../features/platform/hooks/usePlatforms";

import type {
  PlatformListItem,
  PlatformSaveRequest,
  PlatformType,
} from "../../features/platform/types/platform.types";

import "./PlatformFormModal.css";

type Props = {
  platform: PlatformListItem | null;
  onClose: () => void;
};

export function PlatformFormModal({
  platform,
  onClose,
}: Props) {
  const isEdit = platform !== null;

  const createPlatform = useCreatePlatform();
  const updatePlatform = useUpdatePlatform();
  const changeActive = useChangePlatformActive();

  const [code, setCode] = useState(platform?.code ?? "");
  const [name, setName] = useState(platform?.name ?? "");
  const [platformType, setPlatformType] =
    useState<PlatformType>(
      platform?.platformType ?? "PLATFORM"
    );
  const [memo, setMemo] = useState(platform?.memo ?? "");
  const [error, setError] = useState("");

  const pending =
    createPlatform.isPending ||
    updatePlatform.isPending ||
    changeActive.isPending;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    setError("");

    const normalizedCode = code.trim().toUpperCase();
    const normalizedName = name.trim();

    if (!/^[A-Z0-9_]{1,50}$/.test(normalizedCode)) {
      setError(
        "코드는 영문 대문자, 숫자, 밑줄(_)로 50자 이내로 입력한다."
      );
      return;
    }

    if (!normalizedName || normalizedName.length > 100) {
      setError("플랫폼명은 1~100자로 입력한다.");
      return;
    }

    const request: PlatformSaveRequest = {
      code: normalizedCode,
      name: normalizedName,
      platformType,
      memo: memo.trim() || null,
    };

    try {
      if (platform) {
        await updatePlatform.mutateAsync({
          platformId: platform.id,
          request,
        });
      } else {
        await createPlatform.mutateAsync(request);
      }

      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "플랫폼 저장에 실패했습니다."
      );
    }
  }

  async function handleActiveChange() {
    if (!platform || pending) return;

    const active = !platform.active;

    if (
      !window.confirm(
        `${platform.name} 플랫폼을 ${
          active ? "사용" : "미사용"
        } 상태로 변경하시겠습니까?`
      )
    ) {
      return;
    }

    try {
      setError("");

      await changeActive.mutateAsync({
        platformId: platform.id,
        active,
      });

      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "상태 변경에 실패했습니다."
      );
    }
  }

  return (
    <div className="platform-modal-backdrop">
      <section
        className="platform-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="platform-modal-title"
      >
        <header className="platform-modal-header">
          <div className="platform-modal-header-content">
            <span className="platform-modal-header-icon">
              <Building2 size={20} aria-hidden="true" />
            </span>

            <div>
              <h2 id="platform-modal-title">
                {isEdit ? "플랫폼 수정" : "플랫폼 등록"}
              </h2>
              <p>
                의뢰 플랫폼의 기본정보를 입력하고 관리한다.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="platform-modal-close"
            onClick={onClose}
            disabled={pending}
            aria-label="닫기"
          >
            <X size={19} aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="platform-modal-body">
            {error && (
              <div className="platform-modal-error" role="alert">
                <AlertCircle
                  size={16}
                  aria-hidden="true"
                />
                {error}
              </div>
            )}

            <div className="platform-modal-field">
              <label htmlFor="platform-code">
                플랫폼 코드 <em>*</em>
              </label>

              <input
                id="platform-code"
                value={code}
                maxLength={50}
                onChange={(event) =>
                  setCode(event.target.value.toUpperCase())
                }
                placeholder="ELANCER"
                required
              />

              <small>
                영문 대문자, 숫자, 밑줄(_)을 사용한다.
                기존 코드를 변경할 때는 주의한다.
              </small>
            </div>

            <div className="platform-modal-field">
              <label htmlFor="platform-name">
                플랫폼명 <em>*</em>
              </label>

              <input
                id="platform-name"
                value={name}
                maxLength={100}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="이랜서"
                required
              />
            </div>

            <div className="platform-modal-field">
              <label htmlFor="platform-type">
                플랫폼 유형 <em>*</em>
              </label>

              <select
                id="platform-type"
                value={platformType}
                onChange={(event) =>
                  setPlatformType(
                    event.target.value as PlatformType
                  )
                }
              >
                <option value="PLATFORM">외주 플랫폼</option>
                <option value="DIRECT">직접 의뢰</option>
                <option value="OTHER">기타</option>
              </select>
            </div>

            <div className="platform-modal-field">
              <label htmlFor="platform-memo">
                내부 메모
              </label>

              <textarea
                id="platform-memo"
                value={memo}
                rows={4}
                onChange={(event) =>
                  setMemo(event.target.value)
                }
                placeholder="관리용 메모를 입력한다."
              />

              {isEdit && (
                <small>
                  현재 목록 API에서 기존 메모를 제공하지
                  않으므로 수정 시 메모를 다시 입력해야 한다.
                </small>
              )}
            </div>

            {platform && (
              <div className="platform-modal-current-status">
                <span>현재 사용 상태</span>
                <strong
                  className={
                    platform.active
                      ? "platform-modal-status-active"
                      : ""
                  }
                >
                  <CheckCircle2
                    size={15}
                    aria-hidden="true"
                  />
                  {platform.active ? "사용 중" : "미사용"}
                </strong>
              </div>
            )}
          </div>

          <footer className="platform-modal-footer">
            <div className="platform-modal-status-action">
              {platform && (
                <button
                  type="button"
                  className="platform-modal-button platform-modal-button--outline"
                  onClick={() => void handleActiveChange()}
                  disabled={pending}
                >
                  {platform.active
                    ? "미사용으로 변경"
                    : "사용으로 변경"}
                </button>
              )}
            </div>

            <div className="platform-modal-actions">
              <button
                type="button"
                className="platform-modal-button platform-modal-button--outline"
                onClick={onClose}
                disabled={pending}
              >
                취소
              </button>

              <button
                type="submit"
                className="platform-modal-button platform-modal-button--primary"
                disabled={pending}
              >
                {pending ? (
                  <>
                    <LoaderCircle
                      size={16}
                      className="platform-modal-spinner"
                      aria-hidden="true"
                    />
                    처리 중...
                  </>
                ) : (
                  <>
                    <Save size={16} aria-hidden="true" />
                    저장
                  </>
                )}
              </button>
            </div>
          </footer>
        </form>
      </section>
    </div>
  );
}
