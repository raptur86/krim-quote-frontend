import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../../features/dashboard/hooks/useDashboard";
import "./DashboardPage.css";

const krw = (value: number | null | undefined) => `${(value ?? 0).toLocaleString("ko-KR")}원`;
const labels: Record<string, string> = {
  DRAFT: "작성 중", ISSUED: "발행", EXPIRED: "만료", CANCELLED: "취소",
  FULL: "전체", DEPOSIT: "계약금", INTERIM: "중도금", BALANCE: "잔금", OTHER: "기타",
};
const label = (value: string) => labels[value] ?? value;

export function DashboardPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });
  const query = useDashboard(period.year, period.month);
  const changeMonth = (offset: number) => {
    const date = new Date(period.year, period.month - 1 + offset, 1);
    setPeriod({ year: date.getFullYear(), month: date.getMonth() + 1 });
  };

  return (
    <main className="krim-dashboard">
      <header className="krim-dashboard-header">
        <div>
          <h1>대시보드</h1>
          <p>견적·매출·정산 및 수익성 현황</p>
        </div>
        <div className="krim-dashboard-period" aria-label="조회 월">
          <button type="button" onClick={() => changeMonth(-1)} aria-label="이전 달">‹</button>
          <strong>{period.year}년 {period.month}월</strong>
          <button type="button" onClick={() => changeMonth(1)} aria-label="다음 달">›</button>
        </div>
      </header>

      {query.isPending && <div className="krim-dashboard-state">대시보드 정보를 불러오고 있습니다.</div>}
      {query.isError && (
        <div className="krim-dashboard-state krim-dashboard-error" role="alert">
          <p>{query.error instanceof Error ? query.error.message : "대시보드 조회에 실패했습니다."}</p>
          <button type="button" onClick={() => query.refetch()}>다시 조회</button>
        </div>
      )}
      {query.data && (() => {
        const d = query.data;
        return (
          <>
            <section className="krim-dashboard-cards" aria-label="월간 핵심 지표">
              <SummaryCard title="발행 견적금액" value={krw(d.quoteSummary.issuedAmount)} note="실제 매출과 별개" />
              <SummaryCard title="월 매출 (VAT 포함)" value={krw(d.salesSummary.totalSalesAmount)} note="매출일 기준" />
              <SummaryCard title="실제 정산액" value={krw(d.salesSummary.actualSettlementAmount)} note="확인된 실입금액" />
              <SummaryCard title="정산 차감액" value={krw(d.salesSummary.actualDeductionAmount)} note="매출액 − 실제 정산액" />
            </section>

            <div className="krim-dashboard-columns">
              <section className="krim-dashboard-panel">
                <h2>견적 현황</h2>
                <div className="krim-dashboard-stats">
                  <Stat label="전체" value={`${d.quoteSummary.totalCount}건`} />
                  <Stat label="작성 중" value={`${d.quoteSummary.draftCount}건`} />
                  <Stat label="발행" value={`${d.quoteSummary.issuedCount}건`} />
                  <Stat label="만료" value={`${d.quoteSummary.expiredCount}건`} />
                  <Stat label="취소" value={`${d.quoteSummary.cancelledCount}건`} />
                </div>
              </section>
              <section className="krim-dashboard-panel">
                <h2>월 매출 구성</h2>
                <div className="krim-dashboard-stats">
                  <Stat label="공급가액" value={krw(d.salesSummary.supplyAmount)} />
                  <Stat label="매출 VAT" value={krw(d.salesSummary.salesVatAmount)} />
                  <Stat label="매출 합계" value={krw(d.salesSummary.totalSalesAmount)} />
                </div>
              </section>
              <section className="krim-dashboard-panel">
                <h2>예상 수익성</h2>
                <div className="krim-dashboard-stats">
                  <Stat label="예상 내부 원가" value={krw(d.profitabilitySummary.estimatedCostAmount)} />
                  <Stat label="예상 내부 이익" value={krw(d.profitabilitySummary.estimatedProfitAmount)} />
                  <Stat label="예상 이익률" value={`${d.profitabilitySummary.estimatedProfitRate.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}%`} />
                </div>
                <p className="krim-dashboard-footnote">실제 회계상 순이익이 아닌 내부 원가 기준 추정치이다.</p>
              </section>
              <section className="krim-dashboard-panel">
                <h2>연간·분기 실적</h2>
                <div className="krim-dashboard-stats">
                  <Stat label="연간 매출" value={krw(d.yearSummary.totalSalesAmount)} />
                  <Stat label="연간 매출 VAT" value={krw(d.yearSummary.salesVatAmount)} />
                  <Stat label="연간 정산액" value={krw(d.yearSummary.actualSettlementAmount)} />
                  <Stat label={`${d.quarterSummary.quarter}분기 매출`} value={krw(d.quarterSummary.totalSalesAmount)} />
                  <Stat label={`${d.quarterSummary.quarter}분기 매출 VAT`} value={krw(d.quarterSummary.salesVatAmount)} />
                </div>
              </section>
            </div>

            <section className="krim-dashboard-panel">
              <h2>플랫폼별 매출·정산</h2>
              <div className="krim-dashboard-table-wrap">
                <table><thead><tr><th>플랫폼</th><th>매출액</th><th>실제 정산액</th><th>차감액</th></tr></thead>
                  <tbody>{d.platformSummary.length === 0 ? <tr><td colSpan={4}>조회된 플랫폼별 매출이 없습니다.</td></tr> :
                    d.platformSummary.map((p, index) => <tr key={`${p.platformId ?? "none"}-${index}`}>
                      <td>{p.platformName}</td><td>{krw(p.totalSalesAmount)}</td>
                      <td>{krw(p.actualSettlementAmount)}</td><td>{krw(p.actualDeductionAmount)}</td>
                    </tr>)}</tbody>
                </table>
              </div>
            </section>

            <div className="krim-dashboard-columns">
              <section className="krim-dashboard-panel">
                <div className="krim-dashboard-panel-heading"><h2>최근 견적</h2><button type="button" onClick={() => navigate("/quote/quotes")}>전체 보기 →</button></div>
                <div className="krim-dashboard-table-wrap">
                  <table><thead><tr><th>견적</th><th>상태</th><th>금액</th></tr></thead>
                    <tbody>{d.recentQuotes.length === 0 ? <tr><td colSpan={3}>최근 견적이 없습니다.</td></tr> :
                      d.recentQuotes.map((q) => <tr key={q.id}>
                        <td><button type="button" className="krim-dashboard-link" onClick={() => navigate(`/quote/quotes/${q.id}`)}>{q.quoteNumber}<small>{q.title} · {q.customerName}</small></button></td>
                        <td>{label(q.status)}</td><td>{krw(q.totalAmount)}</td>
                      </tr>)}</tbody>
                  </table>
                </div>
              </section>
              <section className="krim-dashboard-panel">
                <div className="krim-dashboard-panel-heading"><h2>최근 매출</h2><button type="button" onClick={() => navigate("/quote/sales")}>전체 보기 →</button></div>
                <div className="krim-dashboard-table-wrap">
                  <table><thead><tr><th>견적번호</th><th>유형</th><th>매출액</th><th>정산액</th></tr></thead>
                    <tbody>{d.recentSales.length === 0 ? <tr><td colSpan={4}>최근 매출이 없습니다.</td></tr> :
                      d.recentSales.map((s) => <tr key={s.id}>
                        <td><button type="button" className="krim-dashboard-link" onClick={() => navigate(`/quote/quotes/${s.quoteId}`)}>{s.quoteNumber}</button></td>
                        <td>{label(s.salesType)}</td><td>{krw(s.totalSalesAmount)}</td>
                        <td>{s.actualSettlementAmount === null ? "미정" : krw(s.actualSettlementAmount)}</td>
                      </tr>)}</tbody>
                  </table>
                </div>
              </section>
            </div>
          </>
        );
      })()}
    </main>
  );
}

function SummaryCard({ title, value, note }: { title: string; value: string; note: string }) {
  return <div className="krim-dashboard-card"><span>{title}</span><strong>{value}</strong><small>{note}</small></div>;
}
function Stat({ label, value }: { label: string; value: string }) {
  return <div className="krim-dashboard-stat"><span>{label}</span><strong>{value}</strong></div>;
}
