
import { useState, type FormEvent } from "react";

import {
  useCreateSales,
  useSalesDetail,
  useUpdateSales,
} from "../../features/sales/hooks/useSales";

import { usePlatforms } from "../../features/platform/hooks/usePlatforms";

import type {
  SalesSaveRequest,
  SalesType,
  SettlementStatus,
} from "../../features/sales/types/sales.types";

import "./SalesFormModal.css";

type Props = {
  quoteId: number;
  salesId: number | null;
  onClose: () => void;
};

type FormValues = {
  paymentPlatformId: string;
  salesType: SalesType;
  description: string;
  salesDate: string;
  settlementDate: string;
  totalSalesAmount: string;
  actualSettlementAmount: string;
  serviceFeeAmount: string;
  paymentFeeAmount: string;
  feeVatAmount: string;
  withholdingTaxAmount: string;
  otherDeductionAmount: string;
  settlementVatAmount: string;
  settlementStatus: SettlementStatus;
  memo: string;
};

const today = () => {
  const d = new Date();
  const local = new Date(
    d.getTime() - d.getTimezoneOffset() * 60_000,
  );
  return local.toISOString().slice(0, 10);
};

function emptyForm(): FormValues {
  return {
    paymentPlatformId: "",
    salesType: "FULL",
    description: "",
    salesDate: today(),
    settlementDate: "",
    totalSalesAmount: "",
    actualSettlementAmount: "",
    serviceFeeAmount: "",
    paymentFeeAmount: "",
    feeVatAmount: "",
    withholdingTaxAmount: "",
    otherDeductionAmount: "",
    settlementVatAmount: "",
    settlementStatus: "EXPECTED",
    memo: "",
  };
}

function toFormNumber(value: number | null): string {
  return value === null ? "" : String(value);
}

function toNullableNumber(value: string): number | null {
  return value.trim() === "" ? null : Number(value);
}

function money(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

const deductionFields = [
  { key: "serviceFeeAmount", label: "서비스 수수료" },
  { key: "paymentFeeAmount", label: "결제 수수료" },
  { key: "feeVatAmount", label: "수수료 VAT" },
  { key: "withholdingTaxAmount", label: "원천징수" },
  { key: "otherDeductionAmount", label: "기타 차감" },
  { key: "settlementVatAmount", label: "정산 VAT" },
] as const;

export function SalesFormModal({
  quoteId,
  salesId,
  onClose,
}: Props) {
  const editing = salesId !== null;

  const detailQuery = useSalesDetail(salesId);
  const platformsQuery = usePlatforms();

  const createSales = useCreateSales();
  const updateSales = useUpdateSales();

  const [draft, setDraft] = useState<FormValues | null>(null);
  const [error, setError] = useState("");

  const detail = detailQuery.data;

  const initialValues: FormValues = detail
    ? {
        paymentPlatformId:
          detail.paymentPlatform?.id?.toString() ?? "",
        salesType: detail.salesType,
        description: detail.description ?? "",
        salesDate: detail.salesDate,
        settlementDate: detail.settlementDate ?? "",
        totalSalesAmount: String(detail.totalSalesAmount),
        actualSettlementAmount: toFormNumber(
          detail.actualSettlementAmount,
        ),
        serviceFeeAmount: toFormNumber(
          detail.serviceFeeAmount,
        ),
        paymentFeeAmount: toFormNumber(
          detail.paymentFeeAmount,
        ),
        feeVatAmount: toFormNumber(detail.feeVatAmount),
        withholdingTaxAmount: toFormNumber(
          detail.withholdingTaxAmount,
        ),
        otherDeductionAmount: toFormNumber(
          detail.otherDeductionAmount,
        ),
        settlementVatAmount: toFormNumber(
          detail.settlementVatAmount,
        ),
        settlementStatus: detail.settlementStatus,
        memo: detail.memo ?? "",
      }
    : emptyForm();

  // 상세 조회가 완료된 뒤에는 기존 데이터를 기본값으로 사용한다.
  // 사용자가 수정하기 시작하면 draft를 유지한다.
  const form = draft ?? initialValues;

  const setField = <K extends keyof FormValues>(
    key: K,
    value: FormValues[K],
  ) => {
    setDraft((previous) => ({
      ...(previous ?? initialValues),
      [key]: value,
    }));
    setError("");
  };

  const total = Number(form.totalSalesAmount || 0);
  const settlement = toNullableNumber(
    form.actualSettlementAmount,
  );

  const supplyAmount = Math.round(total / 1.1);
  const salesVatAmount = total - supplyAmount;

  const actualDeduction =
    settlement === null ? null : total - settlement;

  const isPending =
    createSales.isPending || updateSales.isPending;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (
      !form.salesDate ||
      !form.totalSalesAmount.trim() ||
      !Number.isSafeInteger(total) ||
      total < 0
    ) {
      setError("매출일과 올바른 고객 결제금액을 입력해야 한다.");
      return;
    }

    const amountFields = [
      form.actualSettlementAmount,
      ...deductionFields.map(({ key }) => form[key]),
    ];

    if (
      amountFields.some((value) => {
        const n = toNullableNumber(value);
        return (
          n !== null &&
          (!Number.isSafeInteger(n) || n < 0)
        );
      })
    ) {
      setError("금액은 0 이상의 정수로 입력해야 한다.");
      return;
    }

    const platformId = toNullableNumber(
      form.paymentPlatformId,
    );

    const request: SalesSaveRequest = {
      paymentPlatformId: platformId,
      salesType: form.salesType,
      description: form.description.trim() || null,
      salesDate: form.salesDate,
      settlementDate: form.settlementDate || null,
      totalSalesAmount: total,
      actualSettlementAmount: settlement,
      serviceFeeAmount: toNullableNumber(
        form.serviceFeeAmount,
      ),
      paymentFeeAmount: toNullableNumber(
        form.paymentFeeAmount,
      ),
      feeVatAmount: toNullableNumber(form.feeVatAmount),
      withholdingTaxAmount: toNullableNumber(
        form.withholdingTaxAmount,
      ),
      otherDeductionAmount: toNullableNumber(
        form.otherDeductionAmount,
      ),
      settlementVatAmount: toNullableNumber(
        form.settlementVatAmount,
      ),
      settlementStatus: form.settlementStatus,
      memo: form.memo.trim() || null,
    };

    try {
      if (salesId === null) {
        await createSales.mutateAsync({
          quoteId,
          request,
        });
      } else {
        await updateSales.mutateAsync({
          salesId,
          quoteId,
          request,
        });
      }

      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "매출 저장에 실패했습니다.",
      );
    }
  };

  if (editing && detailQuery.isPending) {
    return (
      <div className="sales-modal-backdrop">
        <div className="sales-modal">
          <p>매출 정보를 불러오고 있습니다.</p>
          <button type="button" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    );
  }

  if (editing && (detailQuery.isError || !detail)) {
    return (
      <div className="sales-modal-backdrop">
        <div className="sales-modal">
          <p>매출 정보를 불러오지 못했습니다.</p>
          <button type="button" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sales-modal-backdrop">
      <section
        className="sales-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sales-modal-title"
      >
        <header className="sales-modal-header">
          <div>
            <h2 id="sales-modal-title">
              {editing ? "매출·정산 수정" : "매출 등록"}
            </h2>
            <p>고객 결제금액과 정산 정보를 관리한다.</p>
          </div>

          <button
            type="button"
            className="sales-modal-close"
            onClick={onClose}
            disabled={isPending}
            aria-label="닫기"
          >
            ×
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="sales-modal-body">
            <h3>매출 기본 정보</h3>

            <div className="sales-form-grid">
              <label className="sales-field">
                <span>매출 유형</span>
                <select
                  value={form.salesType}
                  onChange={(e) =>
                    setField(
                      "salesType",
                      e.target.value as SalesType,
                    )
                  }
                >
                  <option value="FULL">전체</option>
                  <option value="DEPOSIT">계약금</option>
                  <option value="INTERIM">중도금</option>
                  <option value="BALANCE">잔금</option>
                  <option value="OTHER">기타</option>
                </select>
              </label>

              <label className="sales-field">
                <span>결제 플랫폼</span>
                <select
                  value={form.paymentPlatformId}
                  onChange={(e) =>
                    setField(
                      "paymentPlatformId",
                      e.target.value,
                    )
                  }
                  disabled={platformsQuery.isPending}
                >
                  <option value="">선택 안 함</option>
                  {(platformsQuery.data ?? [])
                    .filter(
                      (platform) =>
                        platform.active ||
                        String(platform.id) ===
                          form.paymentPlatformId,
                    )
                    .map((platform) => (
                      <option
                        key={platform.id}
                        value={platform.id}
                      >
                        {platform.name}
                      </option>
                    ))}
                </select>
              </label>

              <label className="sales-field sales-field-full">
                <span>매출 설명</span>
                <input
                  value={form.description}
                  onChange={(e) =>
                    setField("description", e.target.value)
                  }
                  placeholder="예 : 계약금"
                />
              </label>

              <label className="sales-field">
                <span>매출일</span>
                <input
                  type="date"
                  value={form.salesDate}
                  onChange={(e) =>
                    setField("salesDate", e.target.value)
                  }
                  required
                />
              </label>

              <label className="sales-field">
                <span>정산일</span>
                <input
                  type="date"
                  value={form.settlementDate}
                  onChange={(e) =>
                    setField(
                      "settlementDate",
                      e.target.value,
                    )
                  }
                />
              </label>
            </div>

            <h3>매출 및 정산 금액</h3>

            <div className="sales-form-grid">
              <label className="sales-field">
                <span>고객 결제금액 (VAT 포함)</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.totalSalesAmount}
                  onChange={(e) =>
                    setField(
                      "totalSalesAmount",
                      e.target.value,
                    )
                  }
                  required
                />
              </label>

              <label className="sales-field">
                <span>실제 정산액</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.actualSettlementAmount}
                  onChange={(e) =>
                    setField(
                      "actualSettlementAmount",
                      e.target.value,
                    )
                  }
                  placeholder="정산 전이면 비워둔다"
                />
              </label>
            </div>

            <div className="sales-amount-summary">
              <div>
                <span>공급가액 (예상)</span>
                <strong>{money(supplyAmount)}</strong>
              </div>
              <div>
                <span>매출 VAT (예상)</span>
                <strong>{money(salesVatAmount)}</strong>
              </div>
              <div>
                <span>실제 정산 차감액</span>
                <strong>
                  {actualDeduction === null
                    ? "미정"
                    : money(actualDeduction)}
                </strong>
              </div>
            </div>

            <h3>상세 차감 항목 (선택)</h3>

            <div className="sales-form-grid">
              {deductionFields.map(({ key, label }) => (
                <label className="sales-field" key={key}>
                  <span>{label}</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form[key]}
                    onChange={(e) =>
                      setField(key, e.target.value)
                    }
                    placeholder="미입력 가능"
                  />
                </label>
              ))}
            </div>

            <h3>정산 상태 및 메모</h3>

            <div className="sales-form-grid">
              <label className="sales-field">
                <span>정산 상태</span>
                <select
                  value={form.settlementStatus}
                  onChange={(e) =>
                    setField(
                      "settlementStatus",
                      e.target.value as SettlementStatus,
                    )
                  }
                >
                  <option value="EXPECTED">정산 예정</option>
                  <option value="SETTLED">정산 완료</option>
                  <option value="CANCELLED">취소</option>
                </select>
              </label>

              <label className="sales-field sales-field-full">
                <span>메모</span>
                <textarea
                  rows={3}
                  value={form.memo}
                  onChange={(e) =>
                    setField("memo", e.target.value)
                  }
                  placeholder="정산 내역 및 참고사항"
                />
              </label>
            </div>

            {error && (
              <p className="sales-form-error" role="alert">
                {error}
              </p>
            )}
          </div>

          <footer className="sales-modal-footer">
            <button
              type="button"
              className="sales-button-secondary"
              onClick={onClose}
              disabled={isPending}
            >
              취소
            </button>
            <button
              type="submit"
              className="sales-button-primary"
              disabled={
                isPending || platformsQuery.isPending
              }
            >
              {isPending
                ? "저장 중..."
                : editing
                  ? "수정 저장"
                  : "매출 등록"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
