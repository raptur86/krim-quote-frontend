
import { useEffect, useState } from "react";
import {
  AlertCircle,
  Calculator,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  FilePenLine,
  Info,
  Save,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { QUOTE_DIFFICULTIES } from "../constants/quoteDifficulty";
import type { QuoteDraftItem } from "../types/quote.types";
import { Button } from "../../../components/ui/Button";

import "./QuoteItemEditor.css";

type Props = {
  item: QuoteDraftItem | null;
  onSave: (item: QuoteDraftItem) => void;
  onCancel: () => void;
};

export function QuoteItemEditor({
  item,
  onSave,
  onCancel,
}: Props) {
  const [form, setForm] = useState<QuoteDraftItem>(
    () => item ?? createEmptyItem()
  );

  const [errorMessage, setErrorMessage] = useState("");

  const itemType = form.itemType ?? "FEATURE";
  const isIncludedFeature = itemType === "INCLUDED_FEATURE";
  const isPackage = itemType === "PACKAGE";

  useEffect(() => {
    setForm(item ?? createEmptyItem());
    setErrorMessage("");
  }, [item]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [onCancel]);

  function update<K extends keyof QuoteDraftItem>(
    field: K,
    value: QuoteDraftItem[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrorMessage("");
  }

  function handleDifficultyChange(code: string) {
    const difficulty = QUOTE_DIFFICULTIES.find(
      (option) => option.code === code
    );

    if (!difficulty) {
      return;
    }

    setForm((previous) => ({
      ...previous,
      difficultyCode: difficulty.code,
      difficultyRate: difficulty.rate,
    }));

    setErrorMessage("");
  }

  function handleSave() {
    if (isIncludedFeature) {
      setErrorMessage(
        "패키지에 포함된 기능은 개별 수정할 수 없습니다. 패키지 구성을 변경해주세요."
      );
      return;
    }

    const featureName = form.featureName.trim();
    const unitName = form.unitName?.trim() ?? "";
    const adjustmentReason =
      form.adjustmentReason?.trim() || null;

    if (!featureName) {
      setErrorMessage("기능명을 입력해주세요.");
      return;
    }

    if (
      !Number.isFinite(form.quoteUnitPrice) ||
      form.quoteUnitPrice < 0
    ) {
      setErrorMessage(
        "단가는 0원 이상이어야 합니다."
      );
      return;
    }

    if (
      !Number.isFinite(form.quantity) ||
      form.quantity <= 0
    ) {
      setErrorMessage(
        "수량은 0보다 커야 합니다."
      );
      return;
    }

    if (
      !Number.isFinite(form.difficultyRate) ||
      form.difficultyRate <= 0
    ) {
      setErrorMessage(
        "난이도 계수는 0보다 커야 합니다."
      );
      return;
    }

    if (!unitName) {
      setErrorMessage(
        "단위를 입력해주세요."
      );
      return;
    }

    if (
      !Number.isFinite(
        form.adjustmentAmount ?? 0
      )
    ) {
      setErrorMessage(
        "조정금액을 확인해주세요."
      );
      return;
    }

    if (
      !Number.isFinite(
        form.estimatedHours ?? 0
      ) ||
      (form.estimatedHours ?? 0) < 0
    ) {
      setErrorMessage(
        "예상 작업시간은 0 이상이어야 합니다."
      );
      return;
    }

    if (
      (form.adjustmentAmount ?? 0) !== 0 &&
      !adjustmentReason
    ) {
      setErrorMessage(
        "조정금액이 있는 경우 조정사유를 입력해주세요."
      );
      return;
    }

    onSave({
      ...form,

      itemType,

      categoryName: nullableText(
        form.categoryName
      ),

      featureName,

      description: nullableText(
        form.description
      ),

      unitName,

      adjustmentAmount:
        form.adjustmentAmount ?? 0,

      adjustmentReason,

      estimatedHours:
        form.estimatedHours ?? 0,

      internalMemo: nullableText(
        form.internalMemo
      ),

      /*
       * 기존 패키지 관계 정보 보존
       */
      parentPackageClientId:
        form.parentPackageClientId ?? null,

      parentPackageItemIndex:
        form.parentPackageItemIndex ?? null,

      packageScopeSnapshot:
        form.packageScopeSnapshot ?? null,
    });
  }

  /*
   * 포함 기능은 패키지 가격에 이미 포함되므로
   * 개별 견적금액을 계산하지 않는다.
   */
  const previewAmount = isIncludedFeature
    ? 0
    : Number.isFinite(form.quoteUnitPrice) &&
        Number.isFinite(form.quantity) &&
        Number.isFinite(form.difficultyRate) &&
        Number.isFinite(
          form.adjustmentAmount ?? 0
        )
      ? Math.round(
          form.quoteUnitPrice *
            form.quantity *
            form.difficultyRate +
            (form.adjustmentAmount ?? 0)
        )
      : 0;

  return (
    <div
      className="quote-item-editor-backdrop"
      role="presentation"
    >
      <section
        className="quote-item-editor"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-item-editor-title"
        aria-describedby="quote-item-editor-description"
      >
        <header className="quote-item-editor-header">
          <div className="quote-item-editor-heading">
            <span className="quote-item-editor-heading-icon">
              <FilePenLine
                size={21}
                aria-hidden="true"
              />
            </span>

            <div>
              <h3 id="quote-item-editor-title">
                {item
                  ? isPackage
                    ? "패키지 견적 수정"
                    : isIncludedFeature
                      ? "패키지 포함 기능"
                      : "견적항목 수정"
                  : "직접 항목 추가"}
              </h3>

              <p id="quote-item-editor-description">
                {isIncludedFeature
                  ? "패키지에 포함된 기능은 개별 수정할 수 없다."
                  : "기능정보, 단가, 수량 및 난이도를 설정한다."}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="quote-item-editor-close"
            aria-label="모달 닫기"
            onClick={onCancel}
          >
            <X
              size={20}
              aria-hidden="true"
            />
          </button>
        </header>

        <div className="quote-item-editor-body">
          {errorMessage && (
            <div
              className="quote-item-editor-error"
              role="alert"
            >
              <AlertCircle
                size={18}
                aria-hidden="true"
              />
              <span>{errorMessage}</span>
            </div>
          )}

          {isIncludedFeature && (
            <div
              className="quote-item-editor-error"
              role="status"
            >
              <Info
                size={18}
                aria-hidden="true"
              />
              <span>
                이 기능은 패키지에 포함되어 있으며,
                별도의 견적금액이 발생하지 않는다.
              </span>
            </div>
          )}

          <fieldset
            disabled={isIncludedFeature}
            style={{
              border: 0,
              margin: 0,
              padding: 0,
              minWidth: 0,
            }}
          >
            <div className="quote-item-editor-section-title">
              <ClipboardList
                size={17}
                aria-hidden="true"
              />
              <h4>기능정보</h4>
            </div>

            <div className="quote-item-editor-grid">
              <div className="quote-item-editor-field">
                <label htmlFor="quote-item-category">
                  카테고리
                </label>

                <input
                  id="quote-item-category"
                  value={form.categoryName ?? ""}
                  placeholder="예 : API 연동"
                  onChange={(event) =>
                    update(
                      "categoryName",
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="quote-item-editor-field">
                <label htmlFor="quote-item-feature-name">
                  기능명 <em>*</em>
                </label>

                <input
                  id="quote-item-feature-name"
                  value={form.featureName}
                  placeholder="예 : 사용자 로그인 기능"
                  onChange={(event) =>
                    update(
                      "featureName",
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="quote-item-editor-field quote-item-editor-field-full">
                <label htmlFor="quote-item-description">
                  기능 설명
                </label>

                <textarea
                  id="quote-item-description"
                  rows={3}
                  value={form.description ?? ""}
                  placeholder="기능의 상세 작업 내용을 입력한다."
                  onChange={(event) =>
                    update(
                      "description",
                      event.target.value
                    )
                  }
                />
              </div>
            </div>

            <div className="quote-item-editor-divider" />

            <div className="quote-item-editor-section-title">
              <CircleDollarSign
                size={17}
                aria-hidden="true"
              />
              <h4>단가 및 수량</h4>
            </div>

            <div className="quote-item-editor-grid">
              <div className="quote-item-editor-field">
                <label htmlFor="quote-item-price">
                  견적 기준단가 <em>*</em>
                </label>

                <div className="quote-item-editor-input-suffix">
                  <input
                    id="quote-item-price"
                    type="number"
                    min={0}
                    step={1000}
                    value={form.quoteUnitPrice}
                    onChange={(event) =>
                      update(
                        "quoteUnitPrice",
                        Number(event.target.value)
                      )
                    }
                  />
                  <span>원</span>
                </div>
              </div>

              <div className="quote-item-editor-field">
                <label htmlFor="quote-item-quantity">
                  수량 <em>*</em>
                </label>

                <input
                  id="quote-item-quantity"
                  type="number"
                  min={0.01}
                  step={1}
                  value={form.quantity}
                  onChange={(event) =>
                    update(
                      "quantity",
                      Number(event.target.value)
                    )
                  }
                />
              </div>

              <div className="quote-item-editor-field">
                <label htmlFor="quote-item-unit">
                  단위 <em>*</em>
                </label>

                <input
                  id="quote-item-unit"
                  value={form.unitName ?? ""}
                  placeholder="건"
                  onChange={(event) =>
                    update(
                      "unitName",
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="quote-item-editor-field">
                <label htmlFor="quote-item-hours">
                  예상 작업시간
                </label>

                <div className="quote-item-editor-input-suffix">
                  <input
                    id="quote-item-hours"
                    type="number"
                    min={0}
                    step={0.5}
                    value={form.estimatedHours ?? 0}
                    onChange={(event) =>
                      update(
                        "estimatedHours",
                        Number(event.target.value)
                      )
                    }
                  />
                  <span>시간</span>
                </div>
              </div>
            </div>

            <div className="quote-item-editor-divider" />

            <div className="quote-item-editor-section-title">
              <SlidersHorizontal
                size={17}
                aria-hidden="true"
              />
              <h4>난이도 및 금액 조정</h4>
            </div>

            <div className="quote-item-editor-grid">
              <div className="quote-item-editor-field">
                <label htmlFor="quote-item-difficulty">
                  난이도
                </label>

                <select
                  id="quote-item-difficulty"
                  value={form.difficultyCode ?? "NORMAL"}
                  onChange={(event) =>
                    handleDifficultyChange(
                      event.target.value
                    )
                  }
                >
                  {QUOTE_DIFFICULTIES.map(
                    (difficulty) => (
                      <option
                        key={difficulty.code}
                        value={difficulty.code}
                      >
                        {difficulty.label} (
                        {difficulty.rate})
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="quote-item-editor-field">
                <label htmlFor="quote-item-difficulty-rate">
                  난이도 계수
                </label>

                <input
                  id="quote-item-difficulty-rate"
                  type="number"
                  min={0.01}
                  step={0.05}
                  value={form.difficultyRate}
                  onChange={(event) =>
                    update(
                      "difficultyRate",
                      Number(event.target.value)
                    )
                  }
                />
              </div>

              <div className="quote-item-editor-field">
                <label htmlFor="quote-item-adjustment">
                  조정금액
                </label>

                <div className="quote-item-editor-input-suffix">
                  <input
                    id="quote-item-adjustment"
                    type="number"
                    step={1000}
                    value={form.adjustmentAmount ?? 0}
                    onChange={(event) =>
                      update(
                        "adjustmentAmount",
                        Number(event.target.value)
                      )
                    }
                  />
                  <span>원</span>
                </div>

                <small>
                  음수는 할인, 양수는 추가금액으로 입력한다.
                </small>
              </div>

              <div className="quote-item-editor-field">
                <label htmlFor="quote-item-adjustment-reason">
                  조정사유
                  {(form.adjustmentAmount ?? 0) !== 0 && (
                    <em> *</em>
                  )}
                </label>

                <input
                  id="quote-item-adjustment-reason"
                  value={form.adjustmentReason ?? ""}
                  placeholder="예 : 작업 범위 확대"
                  onChange={(event) =>
                    update(
                      "adjustmentReason",
                      event.target.value
                    )
                  }
                />
              </div>
            </div>

            <div className="quote-item-editor-preview">
              <div className="quote-item-editor-preview-heading">
                <Calculator
                  size={18}
                  aria-hidden="true"
                />
                <span>예상 항목금액</span>
              </div>

              <strong>
                {isIncludedFeature
                  ? "포함"
                  : previewAmount.toLocaleString("ko-KR")}
                {!isIncludedFeature && (
                  <small>원</small>
                )}
              </strong>

              <p>
                {isIncludedFeature
                  ? "패키지 금액에 포함된 기능"
                  : "기준단가 × 수량 × 난이도 계수 + 조정금액"}
              </p>
            </div>

            <div className="quote-item-editor-divider" />

            <div className="quote-item-editor-section-title">
              <Clock3
                size={17}
                aria-hidden="true"
              />
              <h4>내부 관리정보</h4>
            </div>

            <div className="quote-item-editor-grid">
              <div className="quote-item-editor-field quote-item-editor-field-full">
                <label htmlFor="quote-item-internal-memo">
                  내부 메모
                </label>

                <textarea
                  id="quote-item-internal-memo"
                  rows={3}
                  value={form.internalMemo ?? ""}
                  placeholder="내부 검토 및 작업 관련 메모를 입력한다."
                  onChange={(event) =>
                    update(
                      "internalMemo",
                      event.target.value
                    )
                  }
                />

                <small>
                  <Info
                    size={13}
                    aria-hidden="true"
                  />
                  내부 업무 관리용 메모이다.
                </small>
              </div>
            </div>
          </fieldset>
        </div>

        <footer className="quote-item-editor-actions">
          <span className="quote-item-editor-required-guide">
            <em>*</em> 필수 입력
          </span>

          <div className="quote-item-editor-action-buttons">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              {isIncludedFeature ? "닫기" : "취소"}
            </Button>

            {!isIncludedFeature && (
              <Button
                type="button"
                variant="primary"
                onClick={handleSave}
              >
                <Save
                  size={16}
                  aria-hidden="true"
                />
                {item ? "수정하기" : "추가하기"}
              </Button>
            )}
          </div>
        </footer>
      </section>
    </div>
  );
}

function createEmptyItem(): QuoteDraftItem {
  return {
    clientId: createClientId(),
    standardRateId: null,
    categoryName: null,
    featureName: "",
    description: null,
    quoteUnitPrice: 0,
    quantity: 1,
    unitName: "건",
    difficultyCode: "NORMAL",
    difficultyRate: 1.0,
    adjustmentAmount: 0,
    adjustmentReason: null,
    estimatedHours: 0,
    internalMemo: null,
    sortOrder: 1,
    itemType: "FEATURE",
    parentPackageClientId: null,
    parentPackageItemIndex: null,
    packageScopeSnapshot: null,
  };
}

function createClientId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()}`;
}

function nullableText(
  value: string | null | undefined
): string | null {
  return value?.trim() || null;
}
