
import { useState } from "react";
import {
  AlertCircle,
  ArrowDownToLine,
  CalendarDays,
  CheckCircle2,
  CirclePlus,
  ClipboardList,
  CreditCard,
  FileText,
  LoaderCircle,
  Pencil,
  RefreshCw,
  Wallet,
} from "lucide-react";

import { useQuoteSales } from "../../features/sales/hooks/useSales";
import type {
  SalesType,
  SettlementStatus,
} from "../../features/sales/types/sales.types";

import { Button } from "../../components/ui/Button";
import { SalesFormModal } from "../sales/SalesFormModal";

import "./QuoteSalesSection.css";

type Props = {
  quoteId: number;
  canCreate: boolean;
};

const salesTypeLabels: Record<SalesType, string> = {
  FULL: "전체",
  DEPOSIT: "계약금",
  INTERIM: "중도금",
  BALANCE: "잔금",
  OTHER: "기타",
};

const settlementLabels: Record<SettlementStatus, string> = {
  EXPECTED: "정산 예정",
  SETTLED: "정산 완료",
  CANCELLED: "취소",
};

function money(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}

export function QuoteSalesSection({
  quoteId,
  canCreate,
}: Props) {
  const salesQuery = useQuoteSales(quoteId);

  // undefined : 닫힘
  // null      : 신규 등록
  // number    : 기존 매출 수정
  const [editingSalesId, setEditingSalesId] =
    useState<number | null | undefined>(undefined);

  const sales = salesQuery.data ?? [];

  const effectiveSales = sales.filter(
    (item) => item.settlementStatus !== "CANCELLED"
  );

  const totalSales = effectiveSales.reduce(
    (sum, item) => sum + item.totalSalesAmount,
    0
  );

  const settledAmount = effectiveSales
    .filter(
      (item) => item.settlementStatus === "SETTLED"
    )
    .reduce(
      (sum, item) =>
        sum + (item.actualSettlementAmount ?? 0),
      0
    );

  return (
    <section className="quote-detail-section quote-sales-section">
      <div className="quote-sales-header">
        <div className="quote-sales-heading">
          <span className="quote-sales-heading-icon">
            <Wallet size={19} aria-hidden="true" />
          </span>

          <div>
            <h2>매출·정산 내역</h2>
            <p>
              이 견적에 연결된 매출과 실제 정산 현황을
              관리한다.
            </p>
          </div>
        </div>

        {canCreate && (
          <Button
            type="button"
            variant="primary"
            onClick={() => setEditingSalesId(null)}
          >
            <CirclePlus size={16} aria-hidden="true" />
            매출 등록
          </Button>
        )}
      </div>

      {salesQuery.isPending ? (
        <div className="quote-sales-feedback" role="status">
          <LoaderCircle
            size={25}
            className="quote-sales-spin"
            aria-hidden="true"
          />
          <strong>매출 내역을 불러오는 중</strong>
          <p>잠시만 기다려 주세요.</p>
        </div>
      ) : salesQuery.isError ? (
        <div
          className="quote-sales-feedback quote-sales-feedback-error"
          role="alert"
        >
          <AlertCircle size={26} aria-hidden="true" />
          <strong>매출 내역을 불러오지 못했습니다.</strong>
          <p>잠시 후 다시 조회해 주세요.</p>

          <Button
            type="button"
            variant="outline"
            onClick={() => void salesQuery.refetch()}
          >
            <RefreshCw size={15} aria-hidden="true" />
            다시 조회
          </Button>
        </div>
      ) : (
        <>
          <div className="quote-sales-summary">
            <div className="quote-sales-summary-card">
              <div className="quote-sales-summary-label">
                <span>매출 건수</span>
                <span className="quote-sales-summary-icon neutral">
                  <ClipboardList
                    size={18}
                    aria-hidden="true"
                  />
                </span>
              </div>

              <strong>
                {effectiveSales.length}
                <small>건</small>
              </strong>

              <p>취소된 매출 제외</p>
            </div>

            <div className="quote-sales-summary-card">
              <div className="quote-sales-summary-label">
                <span>매출 합계</span>
                <span className="quote-sales-summary-icon green">
                  <CreditCard
                    size={18}
                    aria-hidden="true"
                  />
                </span>
              </div>

              <strong>{money(totalSales)}</strong>

              <p>취소 제외 · VAT 포함</p>
            </div>

            <div className="quote-sales-summary-card">
              <div className="quote-sales-summary-label">
                <span>정산 완료 실입금 합계</span>
                <span className="quote-sales-summary-icon green">
                  <ArrowDownToLine
                    size={18}
                    aria-hidden="true"
                  />
                </span>
              </div>

              <strong>{money(settledAmount)}</strong>

              <p>정산 완료된 실제 입금액 기준</p>
            </div>
          </div>

          {sales.length === 0 ? (
            <div className="quote-sales-empty">
              <span className="quote-sales-empty-icon">
                <FileText size={27} aria-hidden="true" />
              </span>

              <strong>등록된 매출이 없습니다.</strong>

              <p>
                견적에 연결된 매출을 등록하면
                이곳에서 정산 내역을 확인할 수 있다.
              </p>

              {canCreate && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingSalesId(null)}
                >
                  <CirclePlus
                    size={16}
                    aria-hidden="true"
                  />
                  첫 매출 등록
                </Button>
              )}
            </div>
          ) : (
            <div className="quote-sales-table-wrap">
              <table className="quote-sales-table">
                <thead>
                  <tr>
                    <th scope="col">매출일</th>
                    <th scope="col">유형</th>
                    <th scope="col">설명</th>
                    <th scope="col">결제 플랫폼</th>
                    <th scope="col" className="quote-sales-align-right">
                      결제금액
                    </th>
                    <th scope="col" className="quote-sales-align-right">
                      실제 정산액
                    </th>
                    <th scope="col" className="quote-sales-align-center">
                      정산 상태
                    </th>
                    <th scope="col" className="quote-sales-align-center">
                      관리
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {sales.map((item) => (
                    <tr
                      key={item.id}
                      className={
                        item.settlementStatus === "CANCELLED"
                          ? "quote-sales-row-cancelled"
                          : ""
                      }
                    >
                      <td>
                        <span className="quote-sales-date">
                          <CalendarDays
                            size={14}
                            aria-hidden="true"
                          />
                          {item.salesDate}
                        </span>
                      </td>

                      <td>
                        <span className="quote-sales-type">
                          {salesTypeLabels[item.salesType]}
                        </span>
                      </td>

                      <td>
                        <span className="quote-sales-description">
                          {item.description ?? "-"}
                        </span>
                      </td>

                      <td>
                        <span className="quote-sales-platform">
                          {item.paymentPlatformName ?? "-"}
                        </span>
                      </td>

                      <td className="quote-sales-align-right quote-sales-amount">
                        {money(item.totalSalesAmount)}
                      </td>

                      <td className="quote-sales-align-right quote-sales-settled-amount">
                        {item.actualSettlementAmount === null
                          ? (
                            <span className="quote-sales-not-entered">
                              미입력
                            </span>
                          )
                          : money(item.actualSettlementAmount)}
                      </td>

                      <td className="quote-sales-align-center">
                        <span
                          className={[
                            "quote-sales-status",
                            item.settlementStatus.toLowerCase(),
                          ].join(" ")}
                        >
                          {item.settlementStatus === "SETTLED" && (
                            <CheckCircle2
                              size={13}
                              aria-hidden="true"
                            />
                          )}
                          {settlementLabels[item.settlementStatus]}
                        </span>
                      </td>

                      <td className="quote-sales-align-center">
                        <button
                          type="button"
                          className="quote-sales-edit-button"
                          onClick={() =>
                            setEditingSalesId(item.id)
                          }
                          aria-label={`${item.salesDate} 매출 수정`}
                          title="매출 수정"
                        >
                          <Pencil
                            size={15}
                            aria-hidden="true"
                          />
                          수정
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {sales.length > 0 && (
            <div className="quote-sales-table-footer">
              <span>
                전체 {sales.length}건 · 취소 제외{" "}
                {effectiveSales.length}건
              </span>

              <span>
                <CheckCircle2
                  size={14}
                  aria-hidden="true"
                />
                정산금액은 실제 입금액 기준이다.
              </span>
            </div>
          )}
        </>
      )}

      {editingSalesId !== undefined && (
        <SalesFormModal
          key={editingSalesId ?? "new"}
          quoteId={quoteId}
          salesId={editingSalesId}
          onClose={() => setEditingSalesId(undefined)}
        />
      )}
    </section>
  );
}
