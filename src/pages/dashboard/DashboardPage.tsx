
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Receipt,
  Wallet,
  TrendingDown,
} from "lucide-react";

import { useDashboard } from "../../features/dashboard/hooks/useDashboard";
import { Button } from "../../components/ui/Button";
import { Badge, type BadgeVariant } from "../../components/ui/Badge";
import { Card, CardHeader, CardBody, StatCard } from "../../components/ui/Card";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  TableEmpty,
} from "../../components/ui/Table";

import "./DashboardPage.css";

const krw = (value: number | null | undefined) =>
  `${(value ?? 0).toLocaleString("ko-KR")}원`;

const labels: Record<string, string> = {
  DRAFT: "작성 중",
  ISSUED: "발행",
  EXPIRED: "만료",
  CANCELLED: "취소",
  FULL: "전체",
  DEPOSIT: "계약금",
  INTERIM: "중도금",
  BALANCE: "잔금",
  OTHER: "기타",
};

const label = (value: string) => labels[value] ?? value;

const quoteStatusVariants: Record<string, BadgeVariant> = {
  DRAFT: "neutral",
  ISSUED: "info",
  EXPIRED: "warning",
  CANCELLED: "danger",
};

function quoteStatusVariant(status: string): BadgeVariant {
  return quoteStatusVariants[status] ?? "neutral";
}

export function DashboardPage() {
  const navigate = useNavigate();

  const [period, setPeriod] = useState(() => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    };
  });

  const query = useDashboard(period.year, period.month);

  const changeMonth = (offset: number) => {
    const date = new Date(
      period.year,
      period.month - 1 + offset,
      1
    );

    setPeriod({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
    });
  };

  return (
    <main className="krim-dashboard">
      <header className="krim-dashboard-header">
        <div className="krim-dashboard-header__text">
          <h1>대시보드</h1>
          <p>견적·매출·정산 및 수익성 현황</p>
        </div>

        <div
          className="krim-dashboard-period"
          aria-label="조회 월"
        >
          <button
            type="button"
            className="krim-dashboard-period__button"
            onClick={() => changeMonth(-1)}
            aria-label="이전 달"
          >
            <ChevronLeft size={19} />
          </button>

          <strong className="krim-dashboard-period__label">
            {period.year}년 {period.month}월
          </strong>

          <button
            type="button"
            className="krim-dashboard-period__button"
            onClick={() => changeMonth(1)}
            aria-label="다음 달"
          >
            <ChevronRight size={19} />
          </button>
        </div>
      </header>

      {query.isPending && (
        <div className="krim-dashboard-state" role="status">
          대시보드 정보를 불러오고 있습니다.
        </div>
      )}

      {query.isError && (
        <div
          className="krim-dashboard-state krim-dashboard-error"
          role="alert"
        >
          <p>
            {query.error instanceof Error
              ? query.error.message
              : "대시보드 조회에 실패했습니다."}
          </p>

          <Button
            variant="outline"
            size="sm"
            onClick={() => void query.refetch()}
          >
            다시 조회
          </Button>
        </div>
      )}

      {query.data && (() => {
        const d = query.data;

        return (
          <>
            {/* 월간 핵심 지표 */}
            <section
              className="krim-dashboard-cards"
              aria-label="월간 핵심 지표"
            >
              <StatCard
                title="발행 견적금액"
                value={krw(d.quoteSummary.issuedAmount)}
                icon={<FileText />}
                description="실제 매출과 별개"
              />

              <StatCard
                title="월 매출 (VAT 포함)"
                value={krw(d.salesSummary.totalSalesAmount)}
                icon={<Receipt />}
                description="매출일 기준"
              />

              <StatCard
                title="실제 정산액"
                value={krw(d.salesSummary.actualSettlementAmount)}
                icon={<Wallet />}
                description="확인된 실입금액"
              />

              <StatCard
                title="정산 차감액"
                value={krw(d.salesSummary.actualDeductionAmount)}
                icon={<TrendingDown />}
                description="매출액 − 실제 정산액"
              />
            </section>

            {/* 상세 통계 */}
            <div className="krim-dashboard-columns">
              <Card>
                <CardHeader title="견적 현황" />
                <CardBody>
                  <div className="krim-dashboard-stats">
                    <Stat
                      label="전체"
                      value={`${d.quoteSummary.totalCount}건`}
                    />
                    <Stat
                      label="작성 중"
                      value={`${d.quoteSummary.draftCount}건`}
                    />
                    <Stat
                      label="발행"
                      value={`${d.quoteSummary.issuedCount}건`}
                    />
                    <Stat
                      label="만료"
                      value={`${d.quoteSummary.expiredCount}건`}
                    />
                    <Stat
                      label="취소"
                      value={`${d.quoteSummary.cancelledCount}건`}
                    />
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader title="월 매출 구성" />
                <CardBody>
                  <div className="krim-dashboard-stats">
                    <Stat
                      label="공급가액"
                      value={krw(d.salesSummary.supplyAmount)}
                    />
                    <Stat
                      label="매출 VAT"
                      value={krw(d.salesSummary.salesVatAmount)}
                    />
                    <Stat
                      label="매출 합계"
                      value={krw(d.salesSummary.totalSalesAmount)}
                    />
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader title="예상 수익성" />
                <CardBody>
                  <div className="krim-dashboard-stats">
                    <Stat
                      label="예상 내부 원가"
                      value={krw(
                        d.profitabilitySummary.estimatedCostAmount
                      )}
                    />
                    <Stat
                      label="예상 내부 이익"
                      value={krw(
                        d.profitabilitySummary.estimatedProfitAmount
                      )}
                    />
                    <Stat
                      label="예상 이익률"
                      value={`${d.profitabilitySummary.estimatedProfitRate.toLocaleString(
                        "ko-KR",
                        { maximumFractionDigits: 2 }
                      )}%`}
                    />
                  </div>

                  <p className="krim-dashboard-footnote">
                    실제 회계상 순이익이 아닌 내부 원가 기준
                    추정치이다.
                  </p>
                </CardBody>
              </Card>

              <Card>
                <CardHeader title="연간·분기 실적" />
                <CardBody>
                  <div className="krim-dashboard-stats">
                    <Stat
                      label="연간 매출"
                      value={krw(d.yearSummary.totalSalesAmount)}
                    />
                    <Stat
                      label="연간 매출 VAT"
                      value={krw(d.yearSummary.salesVatAmount)}
                    />
                    <Stat
                      label="연간 정산액"
                      value={krw(
                        d.yearSummary.actualSettlementAmount
                      )}
                    />
                    <Stat
                      label={`${d.quarterSummary.quarter}분기 매출`}
                      value={krw(
                        d.quarterSummary.totalSalesAmount
                      )}
                    />
                    <Stat
                      label={`${d.quarterSummary.quarter}분기 매출 VAT`}
                      value={krw(
                        d.quarterSummary.salesVatAmount
                      )}
                    />
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* 플랫폼별 매출 및 정산 */}
            <section className="krim-dashboard-section">
              <Card>
                <CardHeader title="플랫폼별 매출·정산" />
                <CardBody className="krim-dashboard-table-body">
                  <Table minWidth={650}>
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell>
                          플랫폼
                        </TableHeaderCell>
                        <TableHeaderCell align="right">
                          매출액
                        </TableHeaderCell>
                        <TableHeaderCell align="right">
                          실제 정산액
                        </TableHeaderCell>
                        <TableHeaderCell align="right">
                          차감액
                        </TableHeaderCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {d.platformSummary.length === 0 ? (
                        <TableEmpty
                          colSpan={4}
                          message="조회된 플랫폼별 매출이 없습니다."
                        />
                      ) : (
                        d.platformSummary.map((p, index) => (
                          <TableRow
                            key={`${p.platformId ?? "none"}-${index}`}
                          >
                            <TableCell>
                              {p.platformName}
                            </TableCell>
                            <TableCell align="right">
                              {krw(p.totalSalesAmount)}
                            </TableCell>
                            <TableCell align="right">
                              {krw(p.actualSettlementAmount)}
                            </TableCell>
                            <TableCell align="right">
                              {krw(p.actualDeductionAmount)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardBody>
              </Card>
            </section>

            {/* 최근 견적 / 최근 매출 */}
            <div className="krim-dashboard-columns krim-dashboard-recent">
              <Card>
                <CardHeader
                  title="최근 견적"
                  action={
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/quote/quotes")}
                    >
                      전체 보기
                    </Button>
                  }
                />

                <CardBody className="krim-dashboard-table-body">
                  <Table minWidth={480}>
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell>견적</TableHeaderCell>
                        <TableHeaderCell>상태</TableHeaderCell>
                        <TableHeaderCell align="right">
                          금액
                        </TableHeaderCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {d.recentQuotes.length === 0 ? (
                        <TableEmpty
                          colSpan={3}
                          message="최근 견적이 없습니다."
                        />
                      ) : (
                        d.recentQuotes.map((q) => (
                          <TableRow key={q.id}>
                            <TableCell>
                              <button
                                type="button"
                                className="krim-dashboard-link"
                                onClick={() =>
                                  navigate(`/quote/quotes/${q.id}`)
                                }
                              >
                                {q.quoteNumber}
                                <small>
                                  {q.title} · {q.customerName}
                                </small>
                              </button>
                            </TableCell>

                            <TableCell>
                              <Badge
                                variant={quoteStatusVariant(q.status)}
                              >
                                {label(q.status)}
                              </Badge>
                            </TableCell>

                            <TableCell align="right">
                              {krw(q.totalAmount)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardBody>
              </Card>

              <Card>
                <CardHeader
                  title="최근 매출"
                  action={
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/quote/sales")}
                    >
                      전체 보기
                    </Button>
                  }
                />

                <CardBody className="krim-dashboard-table-body">
                  <Table minWidth={540}>
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell>
                          견적번호
                        </TableHeaderCell>
                        <TableHeaderCell>
                          유형
                        </TableHeaderCell>
                        <TableHeaderCell align="right">
                          매출액
                        </TableHeaderCell>
                        <TableHeaderCell align="right">
                          정산액
                        </TableHeaderCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {d.recentSales.length === 0 ? (
                        <TableEmpty
                          colSpan={4}
                          message="최근 매출이 없습니다."
                        />
                      ) : (
                        d.recentSales.map((s) => (
                          <TableRow key={s.id}>
                            <TableCell>
                              <button
                                type="button"
                                className="krim-dashboard-link"
                                onClick={() =>
                                  navigate(
                                    `/quote/quotes/${s.quoteId}`
                                  )
                                }
                              >
                                {s.quoteNumber}
                              </button>
                            </TableCell>

                            <TableCell>
                              {label(s.salesType)}
                            </TableCell>

                            <TableCell align="right">
                              {krw(s.totalSalesAmount)}
                            </TableCell>

                            <TableCell align="right">
                              {s.actualSettlementAmount === null
                                ? "미정"
                                : krw(s.actualSettlementAmount)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardBody>
              </Card>
            </div>
          </>
        );
      })()}
    </main>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="krim-dashboard-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
