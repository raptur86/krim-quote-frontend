import {
  useState,
  type FormEvent,
} from "react";

import { useNavigate } from "react-router-dom";

import { useQuotes } from "../../features/quote/hooks/useQuotes";

import type {
  QuoteStatus,
} from "../../features/quote/types/quote.types";

import "./QuotesPage.css";

const PAGE_SIZE = 20;

type StatusFilter =
  | "ALL"
  | QuoteStatus;

export function QuotesPage() {
  const navigate = useNavigate();

  const [keywordInput, setKeywordInput] =
    useState("");

  const [keyword, setKeyword] =
    useState("");

  const [status, setStatus] =
    useState<StatusFilter>("ALL");

  const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");

  const [page, setPage] =
    useState(0);

  const quoteQuery =
    useQuotes({
      keyword:
        keyword || undefined,

      status:
        status === "ALL"
          ? undefined
          : status,

      fromDate:
        fromDate || undefined,

      toDate:
        toDate || undefined,

      page,
      size: PAGE_SIZE,

      sort: "createdAt,desc",
    });

  function handleSearch(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setPage(0);

    setKeyword(
      keywordInput.trim(),
    );
  }

  function handleReset() {
    setKeywordInput("");
    setKeyword("");

    setStatus("ALL");

    setFromDate("");
    setToDate("");

    setPage(0);
  }

  return (
    <div className="quotes-page">

      {/* ================================================
          Header
      ================================================= */}

      <div className="quotes-page-header">

        <div>
          <h1>
            견적 관리
          </h1>

          <p>
            작성한 견적을 조회하고 관리합니다.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() =>
            navigate("/quotes/new")
          }
        >
          + 새 견적 작성
        </button>

      </div>


      {/* ================================================
          Search
      ================================================= */}

      <section className="quotes-search-card">

        <form
          className="quotes-search-form"
          onSubmit={handleSearch}
        >

          <div className="quotes-search-main">

            <div className="quotes-field quotes-keyword-field">
              <label htmlFor="quote-keyword">
                검색
              </label>

              <input
                id="quote-keyword"
                type="search"
                value={keywordInput}
                placeholder="견적번호 / 고객명 / 회사명 / 견적명"
                onChange={(event) =>
                  setKeywordInput(
                    event.target.value,
                  )
                }
              />
            </div>


            <div className="quotes-field">
              <label htmlFor="quote-status">
                상태
              </label>

              <select
                id="quote-status"
                value={status}
                onChange={(event) => {
                  setStatus(
                    event.target
                      .value as StatusFilter,
                  );

                  setPage(0);
                }}
              >
                <option value="ALL">
                  전체
                </option>

                <option value="DRAFT">
                  작성중
                </option>

                <option value="ISSUED">
                  발행
                </option>
                <option value="EXPIRED">
                  만료
                </option>

                <option value="CANCELLED">
                  취소
                </option>
              </select>
            </div>


            <div className="quotes-field">
              <label htmlFor="quote-from-date">
                작성일 시작
              </label>

              <input
                id="quote-from-date"
                type="date"
                value={fromDate}
                onChange={(event) => {
                  setFromDate(
                    event.target.value,
                  );

                  setPage(0);
                }}
              />
            </div>


            <div className="quotes-field">
              <label htmlFor="quote-to-date">
                작성일 종료
              </label>

              <input
                id="quote-to-date"
                type="date"
                value={toDate}
                onChange={(event) => {
                  setToDate(
                    event.target.value,
                  );

                  setPage(0);
                }}
              />
            </div>

          </div>


          <div className="quotes-search-actions">

            <button
              type="submit"
              className="btn btn-primary"
            >
              검색
            </button>

            <button
              type="button"
              className="btn"
              onClick={handleReset}
            >
              초기화
            </button>

          </div>

        </form>

      </section>


      {/* ================================================
          Result Header
      ================================================= */}

      <div className="quotes-result-header">

        <div>
          <strong>
            견적 목록
          </strong>

          {quoteQuery.data && (
            <span>
              총{" "}
              {quoteQuery.data.totalElements.toLocaleString(
                "ko-KR",
              )}
              건
            </span>
          )}
        </div>

        {quoteQuery.isFetching &&
          !quoteQuery.isLoading && (
            <span className="quotes-refreshing">
              새로고침 중...
            </span>
          )}

      </div>


      {/* ================================================
          Loading
      ================================================= */}

      {quoteQuery.isLoading && (
        <div className="quotes-state">
          견적 목록을 불러오고 있습니다.
        </div>
      )}


      {/* ================================================
          Error
      ================================================= */}

      {quoteQuery.isError && (
        <div className="quotes-state quotes-error">

          <strong>
            견적 목록을 불러오지 못했습니다.
          </strong>

          <p>
            {quoteQuery.error instanceof Error
              ? quoteQuery.error.message
              : "잠시 후 다시 시도해주세요."}
          </p>

        </div>
      )}


      {/* ================================================
          Empty
      ================================================= */}

      {!quoteQuery.isLoading &&
        !quoteQuery.isError &&
        quoteQuery.data &&
        quoteQuery.data.content.length === 0 && (
          <div className="quotes-state">

            <strong>
              등록된 견적이 없습니다.
            </strong>

            <p>
              새로운 견적을 작성하거나 검색 조건을 확인해주세요.
            </p>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                navigate("/quotes/new")
              }
            >
              + 새 견적 작성
            </button>

          </div>
        )}


      {/* ================================================
          Table
      ================================================= */}

      {!quoteQuery.isLoading &&
        !quoteQuery.isError &&
        quoteQuery.data &&
        quoteQuery.data.content.length > 0 && (
          <>

            <div className="quotes-table-wrapper">

              <table className="quotes-table">

                <thead>
                  <tr>
                    <th>견적번호</th>
                    <th>고객</th>
                    <th>견적명</th>
                    <th>유입경로</th>
                    <th>작성일</th>
                    <th>유효기간</th>
                    <th>금액</th>
                    <th>상태</th>
                  </tr>
                </thead>

                <tbody>

                  {quoteQuery.data.content.map(
                    (quote) => (
                      <tr
                        key={quote.id}
                        tabIndex={0}
                        onClick={() =>
                          navigate(
                            `/quotes/${quote.id}`,
                          )
                        }
                        onKeyDown={(event) => {
                          if (
                            event.key === "Enter" ||
                            event.key === " "
                          ) {
                            event.preventDefault();

                            navigate(
                              `/quotes/${quote.id}`,
                            );
                          }
                        }}
                      >

                        <td className="quotes-number">
                          {quote.quoteNumber}
                        </td>

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

                        <td>
                          {quote.title}
                        </td>

                        <td>
                          {quote.inquiryPlatformName ||
                            "-"}
                        </td>

                        <td>
                          {formatDate(
                            quote.writtenDate,
                          )}
                        </td>

                        <td>
                          {quote.validUntil
                            ? formatDate(
                                quote.validUntil,
                              )
                            : "-"}
                        </td>

                        <td className="quotes-money">
                          {formatMoney(
                            quote.totalAmount,
                          )}
                        </td>

                        <td>
                          <QuoteStatusBadge
                            status={
                              quote.status
                            }
                          />
                        </td>

                      </tr>
                    ),
                  )}

                </tbody>

              </table>

            </div>


            {/* Pagination */}

            <div className="quotes-pagination">

              <button
                type="button"
                className="btn"
                disabled={
                  quoteQuery.data.first
                }
                onClick={() =>
                  setPage((current) =>
                    Math.max(
                      current - 1,
                      0,
                    ),
                  )
                }
              >
                이전
              </button>

              <span>
                {quoteQuery.data.totalPages === 0
                  ? 0
                  : quoteQuery.data.page + 1}

                {" / "}

                {quoteQuery.data.totalPages}
              </span>

              <button
                type="button"
                className="btn"
                disabled={
                  quoteQuery.data.last
                }
                onClick={() =>
                  setPage(
                    (current) =>
                      current + 1,
                  )
                }
              >
                다음
              </button>

            </div>

          </>
        )}

    </div>
  );
}


/* =========================================================
 * Status
 * ========================================================= */

function QuoteStatusBadge({
  status,
}: {
  status: QuoteStatus;
}) {
  const labels: Record<
    QuoteStatus,
    string
  > = {
    DRAFT: "작성중",
    ISSUED: "발행",
    EXPIRED: "만료",
    CANCELLED: "취소",
  };

  return (
    <span
      className={`quotes-status quotes-status-${status.toLowerCase()}`}
    >
      {labels[status]}
    </span>
  );
}


/* =========================================================
 * Format
 * ========================================================= */

function formatMoney(
  amount: number,
) {
  return `${amount.toLocaleString(
    "ko-KR",
  )}원`;
}

function formatDate(
  value: string,
) {
  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "ko-KR",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    },
  ).format(date);
}