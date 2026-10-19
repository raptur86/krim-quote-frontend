
import {
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Coins,
  History,
  Info,
  LoaderCircle,
  Plus,
  Save,
  Trash2,
  Wallet,
} from "lucide-react";

import { useCostSettings } from "../../features/cost/hooks/useCostSettings";
import { useCreateCostSetting } from "../../features/cost/hooks/useCreateCostSetting";

import type {
  CostSettingCreateRequest,
  FixedCostItemRequest,
} from "../../features/cost/types/cost.types";

import "./CostSettingsPage.css";

type FixedCostDraft = FixedCostItemRequest & {
  clientId: string;
};

function today(): string {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createClientId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function toNumber(value: string): number {
  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function CostSettingsPage() {
  const costSettings = useCostSettings();
  const createCostSetting = useCreateCostSetting();

  const [settingName, setSettingName] = useState("");
  const [internalHourlyCost, setInternalHourlyCost] =
    useState(30000);
  const [monthlyStandardHours, setMonthlyStandardHours] =
    useState(160);
  const [effectiveFrom, setEffectiveFrom] = useState(today());

  const [fixedCosts, setFixedCosts] =
    useState<FixedCostDraft[]>([]);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);
  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  const monthlyFixedCost = useMemo(() => {
    return fixedCosts.reduce(
      (sum, item) => sum + item.monthlyAmount,
      0
    );
  }, [fixedCosts]);

  const hourlyOverheadCost = useMemo(() => {
    if (monthlyStandardHours <= 0) {
      return 0;
    }

    return Math.round(
      monthlyFixedCost / monthlyStandardHours
    );
  }, [monthlyFixedCost, monthlyStandardHours]);

  const sortedSettings = useMemo(() => {
    return [...(costSettings.data ?? [])].sort(
      (a, b) =>
        b.effectiveFrom.localeCompare(a.effectiveFrom) ||
        b.id - a.id
    );
  }, [costSettings.data]);

  function handleAddFixedCost() {
    setFixedCosts((current) => [
      ...current,
      {
        clientId: createClientId(),
        costName: "",
        monthlyAmount: 0,
        sortOrder: current.length + 1,
      },
    ]);
  }

  function handleFixedCostNameChange(
    clientId: string,
    value: string
  ) {
    setFixedCosts((current) =>
      current.map((item) =>
        item.clientId === clientId
          ? { ...item, costName: value }
          : item
      )
    );
  }

  function handleFixedCostAmountChange(
    clientId: string,
    value: string
  ) {
    const amount = Math.max(0, toNumber(value));

    setFixedCosts((current) =>
      current.map((item) =>
        item.clientId === clientId
          ? { ...item, monthlyAmount: amount }
          : item
      )
    );
  }

  function handleRemoveFixedCost(clientId: string) {
    setFixedCosts((current) =>
      current
        .filter((item) => item.clientId !== clientId)
        .map((item, index) => ({
          ...item,
          sortOrder: index + 1,
        }))
    );
  }

  function validate(): string | null {
    if (!settingName.trim()) {
      return "설정명을 입력해주세요.";
    }

    if (internalHourlyCost < 0) {
      return "내부 시간단가는 0원 이상이어야 합니다.";
    }

    if (monthlyStandardHours <= 0) {
      return "월 기준 작업시간은 0보다 커야 합니다.";
    }

    if (!effectiveFrom) {
      return "적용 시작일을 입력해주세요.";
    }

    const invalidFixedCost = fixedCosts.find(
      (item) =>
        !item.costName.trim() ||
        item.monthlyAmount < 0
    );

    if (invalidFixedCost) {
      return "고정비의 비용명과 월 금액을 확인해주세요.";
    }

    return null;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage(null);
    setSuccessMessage(null);

    const validationError = validate();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    const request: CostSettingCreateRequest = {
      settingName: settingName.trim(),
      internalHourlyCost,
      monthlyStandardHours,
      effectiveFrom,
      fixedCosts: fixedCosts.map(
        ({ clientId: _clientId, ...item }, index) => ({
          ...item,
          costName: item.costName.trim(),
          sortOrder: index + 1,
        })
      ),
    };

    try {
      const result =
        await createCostSetting.mutateAsync(request);

      setSuccessMessage(
        `${result.settingName} 원가 설정이 저장되었습니다.`
      );

      // 원가 설정은 이력 방식으로 등록한다.
      // 저장 후 현재 입력값은 그대로 유지한다.
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "원가 설정 저장에 실패했습니다."
      );
    }
  }

  return (
    <main className="cost-settings-page">
      <header className="cost-settings-header">
        <div>
          <span className="cost-settings-eyebrow">
            KRIM QUOTE / COST MANAGEMENT
          </span>
          <h1>사업 원가 설정</h1>
          <p>
            견적 발행 시 내부 원가와 예상 수익성을
            계산하기 위한 사업 원가 기준을 관리한다.
          </p>
        </div>
      </header>

      <form
        className="cost-settings-form"
        onSubmit={(event) => void handleSubmit(event)}
      >
        <section className="cost-settings-section">
          <div className="cost-settings-section-header">
            <div className="cost-settings-section-heading">
              <span className="cost-settings-section-icon">
                <Clock3 size={20} aria-hidden="true" />
              </span>
              <div>
                <h2>원가 기준 설정</h2>
                <p>
                  내부 시간가치와 월 기준 작업시간을 설정한다.
                </p>
              </div>
            </div>
          </div>

          <div className="cost-settings-form-grid">
            <label className="cost-settings-field">
              <span>
                설정명 <strong>*</strong>
              </span>
              <input
                type="text"
                value={settingName}
                onChange={(event) =>
                  setSettingName(event.target.value)
                }
                placeholder="예 : 2026 하반기 기준"
                required
              />
            </label>

            <label className="cost-settings-field">
              <span>
                적용 시작일 <strong>*</strong>
              </span>
              <div className="cost-settings-date-input">
                <input
                  type="date"
                  value={effectiveFrom}
                  onChange={(event) =>
                    setEffectiveFrom(event.target.value)
                  }
                  required
                />
              </div>
            </label>

            <label className="cost-settings-field">
              <span>
                내부 시간단가 <strong>*</strong>
              </span>
              <div className="cost-settings-input-unit">
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={internalHourlyCost}
                  onChange={(event) =>
                    setInternalHourlyCost(
                      Math.max(
                        0,
                        Number(event.target.value) || 0
                      )
                    )
                  }
                  required
                />
                <span>원 / 시간</span>
              </div>
            </label>

            <label className="cost-settings-field">
              <span>
                월 기준 작업시간 <strong>*</strong>
              </span>
              <div className="cost-settings-input-unit">
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={monthlyStandardHours}
                  onChange={(event) =>
                    setMonthlyStandardHours(
                      Math.max(
                        0,
                        Number(event.target.value) || 0
                      )
                    )
                  }
                  required
                />
                <span>시간 / 월</span>
              </div>
            </label>
          </div>

          <div className="cost-settings-info">
            <Info size={17} aria-hidden="true" />
            <p>
              내부 시간단가는 견적 원가 계산에 사용하는
              시간당 내부 비용 기준이다.
            </p>
          </div>
        </section>

        <section className="cost-settings-section">
          <div className="cost-settings-section-header">
            <div className="cost-settings-section-heading">
              <span className="cost-settings-section-icon">
                <Wallet size={20} aria-hidden="true" />
              </span>
              <div>
                <h2>월 고정 사업비</h2>
                <p>
                  매월 반복적으로 발생하는 사업 운영비를
                  등록한다.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="cost-settings-add-button"
              onClick={handleAddFixedCost}
            >
              <Plus size={16} aria-hidden="true" />
              비용 항목 추가
            </button>
          </div>

          {fixedCosts.length === 0 ? (
            <div className="cost-settings-empty">
              <span className="cost-settings-empty-icon">
                <Wallet size={25} aria-hidden="true" />
              </span>
              <strong>등록된 고정비 항목이 없다.</strong>
              <p>
                비용 항목 추가 버튼을 눌러
                월 고정 사업비를 등록한다.
              </p>
            </div>
          ) : (
            <div className="cost-settings-fixed-costs">
              <div className="cost-settings-fixed-cost-header">
                <span>비용명</span>
                <span>월 금액</span>
                <span>관리</span>
              </div>

              {fixedCosts.map((item) => (
                <div
                  key={item.clientId}
                  className="cost-settings-fixed-cost-row"
                >
                  <input
                    type="text"
                    aria-label="비용명"
                    value={item.costName}
                    placeholder="예 : 사무실 월세"
                    onChange={(event) =>
                      handleFixedCostNameChange(
                        item.clientId,
                        event.target.value
                      )
                    }
                  />

                  <div className="cost-settings-input-unit">
                    <input
                      type="number"
                      aria-label="월 금액"
                      min={0}
                      step={1000}
                      value={item.monthlyAmount}
                      onChange={(event) =>
                        handleFixedCostAmountChange(
                          item.clientId,
                          event.target.value
                        )
                      }
                    />
                    <span>원</span>
                  </div>

                  <button
                    type="button"
                    className="cost-settings-remove-button"
                    aria-label={`${item.costName || "비용 항목"} 삭제`}
                    onClick={() =>
                      handleRemoveFixedCost(item.clientId)
                    }
                  >
                    <Trash2 size={15} aria-hidden="true" />
                    삭제
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="cost-settings-summary">
            <div className="cost-settings-summary-item">
              <span>
                <Wallet size={16} aria-hidden="true" />
                월 고정비 합계
              </span>
              <strong>
                {formatMoney(monthlyFixedCost)}
                <small>원</small>
              </strong>
            </div>

            <div className="cost-settings-summary-item">
              <span>
                <Coins size={16} aria-hidden="true" />
                시간당 공통비
              </span>
              <strong>
                {formatMoney(hourlyOverheadCost)}
                <small>원 / h</small>
              </strong>
            </div>

            <p>
              <Info size={15} aria-hidden="true" />
              시간당 공통비는 월 고정비 합계를
              월 기준 작업시간으로 나눈 금액이다.
            </p>
          </div>
        </section>

        {errorMessage && (
          <div
            className="cost-settings-message error"
            role="alert"
          >
            <AlertCircle size={17} aria-hidden="true" />
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div
            className="cost-settings-message success"
            role="status"
          >
            <CheckCircle2 size={17} aria-hidden="true" />
            {successMessage}
          </div>
        )}

        <div className="cost-settings-actions">
          <span className="cost-settings-actions-note">
            저장 시 새로운 원가 설정 이력이 등록된다.
          </span>

          <button
            type="submit"
            className="cost-settings-save-button"
            disabled={createCostSetting.isPending}
          >
            {createCostSetting.isPending ? (
              <>
                <LoaderCircle
                  size={17}
                  className="cost-settings-spinner"
                  aria-hidden="true"
                />
                저장 중...
              </>
            ) : (
              <>
                <Save size={17} aria-hidden="true" />
                원가 설정 저장
              </>
            )}
          </button>
        </div>
      </form>

      <section className="cost-settings-section cost-settings-history">
        <div className="cost-settings-section-header">
          <div className="cost-settings-section-heading">
            <span className="cost-settings-section-icon">
              <History size={20} aria-hidden="true" />
            </span>
            <div>
              <h2>원가 설정 이력</h2>
              <p>
                지금까지 등록된 사업 원가 기준을
                확인한다.
              </p>
            </div>
          </div>

          <span className="cost-settings-history-count">
            총 {sortedSettings.length}건
          </span>
        </div>

        {costSettings.isLoading ? (
          <div className="cost-settings-empty" role="status">
            <LoaderCircle
              size={26}
              className="cost-settings-spinner"
              aria-hidden="true"
            />
            <strong>원가 설정 이력을 불러오는 중이다.</strong>
          </div>
        ) : costSettings.isError ? (
          <div
            className="cost-settings-message error"
            role="alert"
          >
            <AlertCircle size={17} aria-hidden="true" />
            {costSettings.error instanceof Error
              ? costSettings.error.message
              : "원가 설정 이력을 불러오지 못했습니다."}
          </div>
        ) : sortedSettings.length === 0 ? (
          <div className="cost-settings-empty">
            <span className="cost-settings-empty-icon">
              <History size={25} aria-hidden="true" />
            </span>
            <strong>등록된 원가 설정 이력이 없다.</strong>
            <p>
              원가 기준을 저장하면 이곳에
              이력이 표시된다.
            </p>
          </div>
        ) : (
          <div className="cost-settings-history-list">
            {sortedSettings.map((setting) => (
              <article
                key={setting.id}
                className="cost-settings-history-item"
              >
                <div className="cost-settings-history-title">
                  <div>
                    <h3>{setting.settingName}</h3>
                    <span>
                      <CalendarDays
                        size={14}
                        aria-hidden="true"
                      />
                      {setting.effectiveFrom}
                      {" ~ "}
                      {setting.effectiveTo ?? "현재"}
                    </span>
                  </div>

                  <span
                    className={
                      setting.active
                        ? "cost-settings-status active"
                        : "cost-settings-status"
                    }
                  >
                    {setting.active ? "적용 중" : "종료"}
                  </span>
                </div>

                <div className="cost-settings-history-summary">
                  <div>
                    <span>내부 시간단가</span>
                    <strong>
                      {formatMoney(setting.internalHourlyCost)}
                      <small>원 / h</small>
                    </strong>
                  </div>

                  <div>
                    <span>월 기준 작업시간</span>
                    <strong>
                      {formatMoney(setting.monthlyStandardHours)}
                      <small>h</small>
                    </strong>
                  </div>

                  <div>
                    <span>월 고정비</span>
                    <strong>
                      {formatMoney(setting.monthlyFixedCost)}
                      <small>원</small>
                    </strong>
                  </div>

                  <div>
                    <span>시간당 공통비</span>
                    <strong>
                      {formatMoney(setting.hourlyOverheadCost)}
                      <small>원 / h</small>
                    </strong>
                  </div>
                </div>

                {setting.fixedCosts.length > 0 && (
                  <div className="cost-settings-history-costs">
                    <h4>고정비 상세내역</h4>

                    {setting.fixedCosts
                      .slice()
                      .sort(
                        (a, b) =>
                          a.sortOrder - b.sortOrder
                      )
                      .map((item) => (
                        <div key={item.id}>
                          <span>{item.costName}</span>
                          <strong>
                            {formatMoney(item.monthlyAmount)}
                            원
                          </strong>
                        </div>
                      ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
