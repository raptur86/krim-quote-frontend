import { useState } from "react";
import { useQuoteSales } from "../../features/sales/hooks/useSales";
import { SalesFormModal } from "../sales/SalesFormModal";
import type { SalesType, SettlementStatus } from "../../features/sales/types/sales.types";
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

export function QuoteSalesSection({ quoteId, canCreate }: Props) {
  const salesQuery = useQuoteSales(quoteId);
  const [editingSalesId, setEditingSalesId] = useState<number | null | undefined>(undefined);

  const sales = salesQuery.data ?? [];
  const effectiveSales = sales.filter((item) => item.settlementStatus !== "CANCELLED");
  const totalSales = effectiveSales.reduce((sum, item) => sum + item.totalSalesAmount, 0);
  const settledAmount = effectiveSales
    .filter((item) => item.settlementStatus === "SETTLED")
    .reduce((sum, item) => sum + (item.actualSettlementAmount ?? 0), 0);

  return (
    <section className="quote-detail-section quote-sales-section">
      <div className="quote-sales-header">
        <div>
          <h2>매출·정산 내역</h2>
          <p>이 견적에 연결된 매출과 실제 정산 현황을 관리한다.</p>
        </div>
        {canCreate && (
          <button type="button" className="btn btn-primary" onClick={() => setEditingSalesId(null)}>
            + 매출 등록
          </button>
        )}
      </div>

      {salesQuery.isPending ? (
        <p className="quote-sales-message">매출 내역을 불러오고 있습니다.</p>
      ) : salesQuery.isError ? (
        <div className="quote-sales-message" role="alert">
          <p>매출 내역을 불러오지 못했습니다.</p>
          <button type="button" onClick={() => void salesQuery.refetch()}>다시 조회</button>
        </div>
      ) : (
        <>
          <div className="quote-sales-summary">
            <div><span>매출 건수 (취소 제외)</span><strong>{effectiveSales.length}건</strong></div>
            <div><span>매출 합계 (VAT 포함)</span><strong>{money(totalSales)}</strong></div>
            <div><span>정산 완료 실입금 합계</span><strong>{money(settledAmount)}</strong></div>
          </div>

          {sales.length === 0 ? (
            <p className="quote-sales-message">등록된 매출이 없습니다.</p>
          ) : (
            <div className="quote-detail-table-wrap">
              <table className="quote-detail-table quote-sales-table">
                <thead>
                  <tr>
                    <th>매출일</th><th>유형</th><th>설명</th><th>결제 플랫폼</th>
                    <th>결제금액</th><th>실제 정산액</th><th>정산 상태</th><th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((item) => (
                    <tr key={item.id}>
                      <td>{item.salesDate}</td>
                      <td>{salesTypeLabels[item.salesType]}</td>
                      <td>{item.description ?? "-"}</td>
                      <td>{item.paymentPlatformName ?? "-"}</td>
                      <td>{money(item.totalSalesAmount)}</td>
                      <td>{item.actualSettlementAmount === null ? "미입력" : money(item.actualSettlementAmount)}</td>
                      <td>{settlementLabels[item.settlementStatus]}</td>
                      <td>
                        <button type="button" onClick={() => setEditingSalesId(item.id)}>수정</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
