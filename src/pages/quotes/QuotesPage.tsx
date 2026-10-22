
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FilePlus2,
  FileSearch,
  GitBranch,
  LoaderCircle,
  RotateCcw,
  Search,
  X,
} from "lucide-react";

import { useQuotes } from "../../features/quote/hooks/useQuotes";
import { useCustomers } from "../../features/customer/hooks/useCustomers";
import { ROUTES } from "../../app/router/routes";

import type {
  QuoteListItem,
  QuoteStatus,
} from "../../features/quote/types/quote.types";

import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

import "./QuotesPage.css";

const PAGE_SIZE = 20;

type StatusFilter = "ALL" | QuoteStatus;

export function QuotesPage() {
  const navigate = useNavigate();

  // 견적 검색 조건
  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(0);

  // 고객 자동완성
  const [customerKeyword, setCustomerKeyword] = useState("");
  const [
    debouncedCustomerKeyword,
    setDebouncedCustomerKeyword,
  ] = useState("");

  const [selectedCustomerId, setSelectedCustomerId] =
    useState<number | null>(null);

  const [selectedCustomerLabel, setSelectedCustomerLabel] =
    useState("");

  const [customerSearchOpen, setCustomerSearchOpen] =
    useState(false);

  const customerSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const value = customerKeyword.trim();

    if (value.length < 2) {
      setDebouncedCustomerKeyword("");
      return;
    }

    const timer = window.setTimeout(() => {
      setDebouncedCustomerKeyword(value);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [customerKeyword]);

  useEffect(() => {
    function handleMouseDown(event: MouseEvent) {
      const target = event.target as Node;

      if (
        customerSearchRef.current &&
        !customerSearchRef.current.contains(target)
      ) {
        setCustomerSearchOpen(false);
      }
    }

    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleMouseDown
      );
    };
  }, []);

  const customerSearchQuery = useCustomers(
    {
      keyword: debouncedCustomerKeyword || undefined,
      active: true,
      page: 0,
      size: 10,
      sort: "customerName,asc",
    },
    debouncedCustomerKeyword.length >= 2
  );

  const quoteQuery = useQuotes({
    keyword: keyword || undefined,
    customerId: selectedCustomerId ?? undefined,
    status: status === "ALL" ? undefined : status,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    page,
    size: PAGE_SIZE,
    sort: "createdAt,desc",
  });

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setKeyword(keywordInput.trim());
    setPage(0);
    setCustomerSearchOpen(false);
  }

  function handleReset() {
    setKeywordInput("");
    setKeyword("");
    setCustomerKeyword("");
    setDebouncedCustomerKeyword("");
    setSelectedCustomerId(null);
    setSelectedCustomerLabel("");
    setCustomerSearchOpen(false);
    setStatus("ALL");
    setFromDate("");
    setToDate("");
    setPage(0);
  }

  function handleCustomerSelect(customer: {
    id: number;
    customerName: string;
    companyName: string | null;
  }) {
    const label = customer.companyName
      ? `${customer.customerName} / ${customer.companyName}`
      : customer.customerName;

    setSelectedCustomerId(customer.id);
    setSelectedCustomerLabel(label);
    setCustomerKeyword("");
    setDebouncedCustomerKeyword("");
    setCustomerSearchOpen(false);
    setPage(0);
  }

  function handleCustomerClear() {
    setSelectedCustomerId(null);
    setSelectedCustomerLabel("");
    setCustomerKeyword("");
    setDebouncedCustomerKeyword("");
    setCustomerSearchOpen(false);
    setPage(0);
  }

  function openQuote(quoteId: number) {
    navigate(`${ROUTES.quotes}/${quoteId}`);
  }

  const quoteData = quoteQuery.data;

  const showResults =
    !quoteQuery.isLoading &&
    !quoteQuery.isError &&
    quoteData !== undefined;

  return (
    <main className="quotes-page">
      {/* Header */}

      <header className="quotes-page-header">
        <div className="quotes-page-heading">
          <span className="quotes-page-heading-icon">
            <FileSearch size={23} aria-hidden="true" />
          </span>

          <div>
            <h1>견적 관리</h1>
            <p>작성한 견적과 개정 이력을 조회하고 관리한다.</p>
          </div>
        </div>

        <Button
          type="button"
          variant="primary"
          onClick={() => navigate(ROUTES.quoteCreate)}
        >
          <FilePlus2 size={17} aria-hidden="true" />
          새 견적 작성
        </Button>
      </header>

      {/* 검색 및 필터 */}

      <section
        className="quotes-search-card"
        aria-label="견적 검색 조건"
      >
        <form
          className="quotes-search-form"
          onSubmit={handleSearch}
        >
          <div className="quotes-search-main">
            <div className="quotes-field quotes-keyword-field">
              <label htmlFor="quote-keyword">검색</label>

              <div className="quotes-input-icon-wrap">
                <Search size={17} aria-hidden="true" />

                <input
                  id="quote-keyword"
                  type="search"
                  value={keywordInput}
                  placeholder="견적번호 / 고객명 / 회사명 / 견적명"
                  onChange={(event) =>
                    setKeywordInput(event.target.value)
                  }
                />
              </div>
            </div>

            <div
              className="quotes-field quotes-customer-search"
              ref={customerSearchRef}
            >
              <label htmlFor="quote-customer">고객</label>

              <div className="quotes-customer-search-control">
                <input
                  id="quote-customer"
                  type="search"
                  autoComplete="off"
                  value={
                    selectedCustomerId !== null
                      ? selectedCustomerLabel
                      : customerKeyword
                  }
                  placeholder="고객명 / 회사명 검색"
                  aria-expanded={
                    customerSearchOpen &&
                    selectedCustomerId === null
                  }
                  aria-controls="quotes-customer-results"
                  onFocus={() => {
                    if (
                      selectedCustomerId === null &&
                      customerKeyword.trim().length >= 2
                    ) {
                      setCustomerSearchOpen(true);
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      setCustomerSearchOpen(false);
                    }
                  }}
                  onChange={(event) => {
                    setSelectedCustomerId(null);
                    setSelectedCustomerLabel("");
                    setCustomerKeyword(event.target.value);
                    setCustomerSearchOpen(true);
                    setPage(0);
                  }}
                />

                {selectedCustomerId !== null && (
                  <button
                    type="button"
                    className="quotes-customer-clear"
                    aria-label="선택한 고객 해제"
                    onClick={handleCustomerClear}
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                )}
              </div>

              {customerSearchOpen &&
                selectedCustomerId === null &&
                customerKeyword.trim().length >= 2 && (
                  <div
                    id="quotes-customer-results"
                    className="quotes-customer-results"
                  >
                    {customerSearchQuery.isFetching && (
                      <div
                        className="quotes-customer-result-state"
                        role="status"
                      >
                        <LoaderCircle
                          size={15}
                          className="quotes-spin"
                          aria-hidden="true"
                        />
                        고객 검색 중...
                      </div>
                    )}

                    {!customerSearchQuery.isFetching &&
                      customerSearchQuery.isError && (
                        <div
                          className="quotes-customer-result-state quotes-customer-result-error"
                          role="alert"
                        >
                          고객 검색에 실패했습니다.
                        </div>
                      )}

                    {!customerSearchQuery.isFetching &&
                      !customerSearchQuery.isError &&
                      debouncedCustomerKeyword.length >= 2 &&
                      customerSearchQuery.data?.content.length ===
                        0 && (
                        <div className="quotes-customer-result-state">
                          검색된 고객이 없습니다.
                        </div>
                      )}

                    {!customerSearchQuery.isFetching &&
                      !customerSearchQuery.isError &&
                      customerSearchQuery.data?.content.map(
                        (customer) => (
                          <button
                            key={customer.id}
                            type="button"
                            className="quotes-customer-result"
                            onClick={() =>
                              handleCustomerSelect(customer)
                            }
                          >
                            <strong>
                              {customer.customerName}
                            </strong>

                            {customer.companyName && (
                              <span>
                                {customer.companyName}
                              </span>
                            )}
                          </button>
                        )
                      )}
                  </div>
                )}
            </div>

            <div className="quotes-field quotes-status-field">
              <label htmlFor="quote-status">상태</label>

              <select
                id="quote-status"
                value={status}
                onChange={(event) => {
                  setStatus(
                    event.target.value as StatusFilter
                  );
                  setPage(0);
                }}
              >
                <option value="ALL">전체</option>
                <option value="DRAFT">작성중</option>
                <option value="ISSUED">발행</option>
                <option value="EXPIRED">만료</option>
                <option value="CANCELLED">취소</option>
              </select>
            </div>

            <div className="quotes-field quotes-date-field">
              <label htmlFor="quote-from-date">
                작성일 시작
              </label>

              <input
                id="quote-from-date"
                type="date"
                value={fromDate}
                onChange={(event) => {
                  setFromDate(event.target.value);
                  setPage(0);
                }}
              />
            </div>

            <div className="quotes-field quotes-date-field">
              <label htmlFor="quote-to-date">
                작성일 종료
              </label>

              <input
                id="quote-to-date"
                type="date"
                value={toDate}
                onChange={(event) => {
                  setToDate(event.target.value);
                  setPage(0);
                }}
              />
            </div>
          </div>

          <div className="quotes-search-actions">
            <Button type="submit" variant="primary">
              <Search size={16} aria-hidden="true" />
              검색
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
            >
              <RotateCcw size={15} aria-hidden="true" />
              초기화
            </Button>
          </div>
        </form>
      </section>

      {/* 결과 */}

      <section
        className="quotes-results"
        aria-labelledby="quotes-result-title"
      >
        <div className="quotes-result-header">
          <div className="quotes-result-heading">
            <strong id="quotes-result-title">
              견적 목록
            </strong>

            {quoteData && (
              <span>
                총{" "}
                {quoteData.totalElements.toLocaleString(
                  "ko-KR"
                )}
                건
              </span>
            )}
          </div>

          {quoteQuery.isFetching &&
            !quoteQuery.isLoading && (
              <span
                className="quotes-refreshing"
                role="status"
              >
                <LoaderCircle
                  size={14}
                  className="quotes-spin"
                  aria-hidden="true"
                />
                새로고침 중...
              </span>
            )}
        </div>

        {quoteQuery.isLoading && (
          <div className="quotes-state" role="status">
            <LoaderCircle
              size={28}
              className="quotes-spin"
              aria-hidden="true"
            />
            <strong>견적 목록을 불러오는 중</strong>
            <p>잠시만 기다려 주세요.</p>
          </div>
        )}

        {quoteQuery.isError && (
          <div
            className="quotes-state quotes-error"
            role="alert"
          >
            <AlertCircle
              size={29}
              aria-hidden="true"
            />
            <strong>
              견적 목록을 불러오지 못했습니다.
            </strong>
            <p>
              {quoteQuery.error instanceof Error
                ? quoteQuery.error.message
                : "잠시 후 다시 시도해 주세요."}
            </p>
          </div>
        )}

        {showResults && quoteData.content.length === 0 && (
          <div className="quotes-state">
            <FileSearch size={32} aria-hidden="true" />
            <strong>검색된 견적이 없습니다.</strong>
            <p>
              검색 조건을 변경하거나 새로운 견적을
              작성할 수 있습니다.
            </p>

            <Button
              type="button"
              variant="primary"
              onClick={() => navigate(ROUTES.quoteCreate)}
            >
              <FilePlus2 size={16} aria-hidden="true" />
              새 견적 작성
            </Button>
          </div>
        )}

        {showResults && quoteData.content.length > 0 && (
          <>
            <div className="quotes-table-wrapper">
              <table className="quotes-table">
                <thead>
                  <tr>
                    <th scope="col">견적번호</th>
                    <th scope="col">개정 구분</th>
                    <th scope="col">고객</th>
                    <th scope="col">견적명</th>
                    <th scope="col">유입경로</th>
                    <th scope="col">작성일</th>
                    <th scope="col">유효기간</th>
                    <th
                      scope="col"
                      className="quotes-money-column"
                    >
                      금액
                    </th>
                    <th scope="col">상태</th>
                  </tr>
                </thead>

                <tbody>
                  {quoteData.content.map((quote) => (
                    <tr key={quote.id}>
                      {/* 견적번호 */}

                      <td>
                        <div className="quotes-number-cell">
                          <button
                            type="button"
                            className="quotes-number"
                            onClick={() => openQuote(quote.id)}
                          >
                            {quote.quoteNumber}
                          </button>

                          <span
                            className={[
                              "quotes-revision-badge",
                              quote.revisionNo > 0
                                ? "revised"
                                : "original",
                            ].join(" ")}
                          >
                            <GitBranch
                              size={12}
                              aria-hidden="true"
                            />

                            {quote.revisionNo > 0
                              ? `${quote.revisionNo}차 개정`
                              : "원본"}
                          </span>
                        </div>
                      </td>

                      {/* 개정 구분 */}

                      <td>
                        <QuoteRevisionCell
                          quote={quote}
                          onOpenQuote={openQuote}
                        />
                      </td>

                      {/* 고객 */}

                      <td>
                        <div className="quotes-customer">
                          <strong>
                            {quote.customerName}
                          </strong>

                          {quote.companyName && (
                            <span>
                              {quote.companyName}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 견적명 */}

                      <td>
                        <button
                          type="button"
                          className="quotes-title-link"
                          onClick={() => openQuote(quote.id)}
                        >
                          {quote.title}
                        </button>
                      </td>

                      {/* 유입경로 */}

                      <td>
                        {quote.inquiryPlatformName || "-"}
                      </td>

                      {/* 작성일 */}

                      <td>
                        {formatDate(quote.writtenDate)}
                      </td>

                      {/* 유효기간 */}

                      <td>
                        {quote.validUntil
                          ? formatDate(quote.validUntil)
                          : "-"}
                      </td>

                      {/* 금액 */}

                      <td className="quotes-money">
                        {formatMoney(quote.totalAmount)}
                      </td>

                      {/* 상태 */}

                      <td>
                        <QuoteStatusBadge
                          status={quote.status}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}

            <div className="quotes-pagination">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={quoteData.first}
                onClick={() =>
                  setPage((current) =>
                    Math.max(current - 1, 0)
                  )
                }
              >
                <ChevronLeft
                  size={16}
                  aria-hidden="true"
                />
                이전
              </Button>

              <span>
                <strong>
                  {quoteData.totalPages === 0
                    ? 0
                    : quoteData.page + 1}
                </strong>
                {" / "}
                {quoteData.totalPages}
              </span>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={quoteData.last}
                onClick={() =>
                  setPage((current) => current + 1)
                }
              >
                다음
                <ChevronRight
                  size={16}
                  aria-hidden="true"
                />
              </Button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

/* =========================================
   v1.2 - Revision Cell
========================================= */

type QuoteRevisionCellProps = {
  quote: QuoteListItem;
  onOpenQuote: (quoteId: number) => void;
};

function QuoteRevisionCell({
  quote,
  onOpenQuote,
}: QuoteRevisionCellProps) {
  const isRevision = quote.revisionNo > 0;

  if (!isRevision) {
    return (
      <div className="quotes-revision-cell">
        <span className="quotes-revision-original">
          최초 견적
        </span>
      </div>
    );
  }

  return (
    <div className="quotes-revision-cell">
      <strong className="quotes-revision-label">
        {quote.revisionNo}차 개정
      </strong>

      <div className="quotes-revision-links">
        {quote.originalQuoteId != null && (
          <button
            type="button"
            className="quotes-revision-link"
            title="최초 견적 상세 보기"
            onClick={() =>
              onOpenQuote(quote.originalQuoteId!)
            }
          >
            원본
            <ExternalLink
              size={11}
              aria-hidden="true"
            />
          </button>
        )}

        {quote.sourceQuoteId != null &&
          quote.sourceQuoteId !== quote.originalQuoteId && (
            <button
              type="button"
              className="quotes-revision-link"
              title="직전 견적 상세 보기"
              onClick={() =>
                onOpenQuote(quote.sourceQuoteId!)
              }
            >
              직전 견적
              <ExternalLink
                size={11}
                aria-hidden="true"
              />
            </button>
          )}
      </div>
    </div>
  );
}

/* =========================================
   Quote Status Badge
========================================= */

function QuoteStatusBadge({
  status,
}: {
  status: QuoteStatus;
}) {
  const labels: Record<QuoteStatus, string> = {
    DRAFT: "작성중",
    ISSUED: "발행",
    EXPIRED: "만료",
    CANCELLED: "취소",
  };

  const variants: Record<
    QuoteStatus,
    "warning" | "success" | "neutral" | "danger"
  > = {
    DRAFT: "warning",
    ISSUED: "success",
    EXPIRED: "neutral",
    CANCELLED: "danger",
  };

  return (
    <Badge variant={variants[status]}>
      {labels[status]}
    </Badge>
  );
}

/* =========================================
   Format Utilities
========================================= */

function formatMoney(amount: number) {
  return `${amount.toLocaleString("ko-KR")}원`;
}

function formatDate(value: string) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
