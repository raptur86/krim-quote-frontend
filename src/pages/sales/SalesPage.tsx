
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  FileText,
  Filter,
  LoaderCircle,
  Plus,
  ReceiptText,
  RotateCcw,
  Search,
  Wallet,
} from "lucide-react";

import { ROUTES } from "../../app/router/routes";
import { useAllSales } from "../../features/sales/hooks/useAllSales";

import type {
  SettlementStatus,
  SalesType,
} from "../../features/sales/types/sales.types";

import "./SalesPage.css";

const typeLabels: Record<SalesType, string> = {
  FULL: "전체",
  DEPOSIT: "계약금",
  INTERIM: "중도금",
  BALANCE: "잔금",
  OTHER: "기타",
};

const statusLabels: Record<SettlementStatus, string> = {
  EXPECTED: "정산 예정",
  SETTLED: "정산 완료",
  CANCELLED: "취소",
};

const money = (value: number) =>
  `${value.toLocaleString("ko-KR")}원`;

export function SalesPage() {
  const navigate = useNavigate();
  const salesQuery = useAllSales();

  const [search, setSearch] = useState("");
  const [status, setStatus] =
    useState<SettlementStatus | "ALL">("ALL");
  const [platformId, setPlatformId] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const allSales = salesQuery.data ?? [];

  const platforms = useMemo(() => {
    const map = new Map<number, string>();

    allSales.forEach((sale) => {
      if (
        sale.paymentPlatformId !== null &&
        sale.paymentPlatformName
      ) {
        map.set(
          sale.paymentPlatformId,
          sale.paymentPlatformName
        );
      }
    });

    return [...map.entries()].sort((a, b) =>
      a[1].localeCompare(b[1], "ko")
    );
  }, [allSales]);

  const filteredSales = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase();

    return allSales.filter((sale) => {
      if (
        status !== "ALL" &&
        sale.settlementStatus !== status
      ) {
        return false;
      }

      if (
        platformId !== "ALL" &&
        sale.paymentPlatformId !== Number(platformId)
      ) {
        return false;
      }

      if (fromDate && sale.salesDate < fromDate) {
        return false;
      }

      if (toDate && sale.salesDate > toDate) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      return [
        sale.quoteNumber,
        sale.customerName,
        sale.description ?? "",
        sale.paymentPlatformName ?? "",
      ].some((value) =>
        value.toLocaleLowerCase().includes(keyword)
      );
    });
  }, [
    allSales,
    search,
    status,
    platformId,
    fromDate,
    toDate,
  ]);

  const effective = filteredSales.filter(
    (sale) => sale.settlementStatus !== "CANCELLED"
  );

  const total = effective.reduce(
    (sum, sale) => sum + sale.totalSalesAmount,
    0
  );

  const settled = effective
    .filter(
      (sale) => sale.settlementStatus === "SETTLED"
    )
    .reduce(
      (sum, sale) =>
        sum + (sale.actualSettlementAmount ?? 0),
      0
    );

  const expected = effective
    .filter(
      (sale) => sale.settlementStatus === "EXPECTED"
    )
    .reduce(
      (sum, sale) => sum + sale.totalSalesAmount,
      0
    );

  const resetFilters = () => {
    setSearch("");
    setStatus("ALL");
    setPlatformId("ALL");
    setFromDate("");
    setToDate("");
  };

  return (
    <main className="sales-page">
      <header className="sales-page-header">
        <div>
          <span className="sales-page-eyebrow">
            KRIM QUOTE / SALES MANAGEMENT
          </span>
          <h1>매출·정산 관리</h1>
          <p>
            전체 견적의 매출 현황과 정산 내역을
            통합 조회한다.
          </p>
        </div>

        <button
          type="button"
          className="sales-page-primary"
          onClick={() => navigate(ROUTES.quotes)}
        >
          <Plus size={17} aria-hidden="true" />
          견적에서 매출 등록
          <ArrowRight size={15} aria-hidden="true" />
        </button>
      </header>

      <section
        className="sales-page-summary"
        aria-label="매출 요약"
      >
        <article className="sales-page-summary-card">
          <div className="sales-page-summary-top">
            <span className="sales-page-summary-icon">
              <CircleDollarSign
                size={21}
                aria-hidden="true"
              />
            </span>
            <span className="sales-page-summary-label">
              매출 합계 (VAT 포함)
            </span>
          </div>

          <strong>
            {salesQuery.isSuccess ? money(total) : "—"}
          </strong>
          <small>취소 건 제외</small>
        </article>

        <article className="sales-page-summary-card">
          <div className="sales-page-summary-top">
            <span className="sales-page-summary-icon">
              <Wallet size={21} aria-hidden="true" />
            </span>
            <span className="sales-page-summary-label">
              정산 완료 실입금
            </span>
          </div>

          <strong>
            {salesQuery.isSuccess ? money(settled) : "—"}
          </strong>
          <small>실제 정산금액 기준</small>
        </article>

        <article className="sales-page-summary-card">
          <div className="sales-page-summary-top">
            <span className="sales-page-summary-icon">
              <Clock3 size={21} aria-hidden="true" />
            </span>
            <span className="sales-page-summary-label">
              정산 예정 매출
            </span>
          </div>

          <strong>
            {salesQuery.isSuccess ? money(expected) : "—"}
          </strong>
          <small>고객 결제금액 기준</small>
        </article>

        <article className="sales-page-summary-card">
          <div className="sales-page-summary-top">
            <span className="sales-page-summary-icon">
              <ReceiptText size={21} aria-hidden="true" />
            </span>
            <span className="sales-page-summary-label">
              매출 건수
            </span>
          </div>

          <strong>
            {salesQuery.isSuccess
              ? `${effective.length}건`
              : "—"}
          </strong>
          <small>취소 건 제외</small>
        </article>
      </section>

      <p className="sales-page-summary-note">
        <AlertCircle size={15} aria-hidden="true" />
        합계는 현재 검색·필터 결과 기준이며 취소 건은
        제외한다. 정산 예정 금액은 실제 입금 예정액이 아닌
        고객 결제금액이다.
      </p>

      <section
        className="sales-page-panel"
        aria-label="매출 검색 및 필터"
      >
        <div className="sales-page-panel-header">
          <div>
            <Filter size={18} aria-hidden="true" />
            <h2>검색 및 필터</h2>
          </div>
        </div>

        <div className="sales-page-filters">
          <label className="sales-page-search-field">
            <span>검색</span>
            <div className="sales-page-search-input">
              <Search size={17} aria-hidden="true" />
              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="견적번호, 고객명, 설명, 플랫폼"
              />
            </div>
          </label>

          <label>
            <span>정산 상태</span>
            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value as
                    | SettlementStatus
                    | "ALL"
                )
              }
            >
              <option value="ALL">전체</option>
              <option value="EXPECTED">정산 예정</option>
              <option value="SETTLED">정산 완료</option>
              <option value="CANCELLED">취소</option>
            </select>
          </label>

          <label>
            <span>결제 플랫폼</span>
            <select
              value={platformId}
              onChange={(event) =>
                setPlatformId(event.target.value)
              }
            >
              <option value="ALL">전체</option>
              {platforms.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>시작일</span>
            <input
              type="date"
              value={fromDate}
              max={toDate || undefined}
              onChange={(event) =>
                setFromDate(event.target.value)
              }
            />
          </label>

          <label>
            <span>종료일</span>
            <input
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(event) =>
                setToDate(event.target.value)
              }
            />
          </label>

          <button
            type="button"
            className="sales-page-reset"
            onClick={resetFilters}
          >
            <RotateCcw size={15} aria-hidden="true" />
            초기화
          </button>
        </div>
      </section>

      <section className="sales-page-panel">
        <div className="sales-page-list-heading">
          <div>
            <ClipboardList
              size={19}
              aria-hidden="true"
            />
            <h2>매출 목록</h2>
            <span className="sales-page-list-count">
              {salesQuery.isSuccess
                ? `${filteredSales.length}건`
                : "—"}
            </span>
          </div>
          <p>검색 조건에 해당하는 매출 내역이다.</p>
        </div>

        {salesQuery.isPending ? (
          <div className="sales-page-message" role="status">
            <LoaderCircle
              size={28}
              className="sales-page-spinner"
              aria-hidden="true"
            />
            <strong>매출 내역을 불러오는 중이다.</strong>
            <p>등록된 매출과 정산 정보를 조회하고 있다.</p>
          </div>
        ) : salesQuery.isError ? (
          <div
            className="sales-page-message sales-page-message-error"
            role="alert"
          >
            <AlertCircle size={28} aria-hidden="true" />
            <strong>전체 매출을 불러오지 못했다.</strong>
            <p>
              백엔드 <code>GET /api/v1/sales</code>
              구현 및 응답 형식을 확인해야 한다.
            </p>
            <button
              type="button"
              onClick={() => void salesQuery.refetch()}
            >
              다시 조회
            </button>
          </div>
        ) : filteredSales.length === 0 ? (
          <div className="sales-page-message">
            <FileText size={30} aria-hidden="true" />
            <strong>
              {allSales.length === 0
                ? "등록된 매출이 없다."
                : "검색 조건에 맞는 매출이 없다."}
            </strong>
            <p>
              {allSales.length === 0
                ? "견적 상세 화면에서 매출을 등록할 수 있다."
                : "검색어나 필터 조건을 변경해 다시 조회한다."}
            </p>
          </div>
        ) : (
          <div className="sales-page-table-scroll">
            <table className="sales-page-table">
              <thead>
                <tr>
                  <th>매출일</th>
                  <th>견적번호 / 고객</th>
                  <th>유형</th>
                  <th>결제 플랫폼</th>
                  <th className="sales-page-money">
                    고객 결제금액
                  </th>
                  <th className="sales-page-money">
                    실제 정산액
                  </th>
                  <th>정산 상태</th>
                  <th>관리</th>
                </tr>
              </thead>

              <tbody>
                {filteredSales.map((sale) => (
                  <tr key={sale.id}>
                    <td>
                      <span className="sales-page-date">
                        <CalendarDays
                          size={14}
                          aria-hidden="true"
                        />
                        {sale.salesDate}
                      </span>
                    </td>

                    <td>
                      <strong className="sales-page-quote-number">
                        {sale.quoteNumber}
                      </strong>
                      <small>{sale.customerName}</small>
                    </td>

                    <td>
                      <span className="sales-page-type">
                        {typeLabels[sale.salesType]}
                      </span>
                    </td>

                    <td>
                      {sale.paymentPlatformName ?? "—"}
                    </td>

                    <td className="sales-page-money sales-page-amount">
                      {money(sale.totalSalesAmount)}
                    </td>

                    <td className="sales-page-money">
                      {sale.actualSettlementAmount === null
                        ? "—"
                        : money(sale.actualSettlementAmount)}
                    </td>

                    <td>
                      <span
                        className={`sales-page-status sales-page-status-${sale.settlementStatus.toLowerCase()}`}
                      >
                        {sale.settlementStatus === "SETTLED" && (
                          <CheckCircle2
                            size={13}
                            aria-hidden="true"
                          />
                        )}
                        {sale.settlementStatus === "EXPECTED" && (
                          <Clock3
                            size={13}
                            aria-hidden="true"
                          />
                        )}
                        {statusLabels[sale.settlementStatus]}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="sales-page-link"
                        onClick={() =>
                          navigate(
                            `${ROUTES.quotes}/${sale.quoteId}`
                          )
                        }
                      >
                        견적 보기
                        <ArrowRight
                          size={13}
                          aria-hidden="true"
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
