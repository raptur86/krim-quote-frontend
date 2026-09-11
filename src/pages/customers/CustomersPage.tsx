import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useCustomers } from "../../features/customer/hooks/useCustomers";

import "./CustomersPage.css";

const PAGE_SIZE = 20;

export function CustomersPage() {
  const navigate = useNavigate();

  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [page, setPage] = useState(0);

  const active =
    activeFilter === "all"
      ? undefined
      : activeFilter === "active";

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
  } = useCustomers({
    keyword: keyword || undefined,
    active,
    page,
    size: PAGE_SIZE,
  });

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setPage(0);
    setKeyword(keywordInput.trim());
  }

  function handleActiveFilterChange(
    event: React.ChangeEvent<HTMLSelectElement>,
  ) {
    const value = event.target.value as
      | "all"
      | "active"
      | "inactive";

    setActiveFilter(value);
    setPage(0);
  }

  function handleResetSearch() {
    setKeywordInput("");
    setKeyword("");
    setActiveFilter("all");
    setPage(0);
  }

  function handleCustomerClick(customerId: number) {
    navigate(`/customers/${customerId}`);
  }

  function handleCreateCustomer() {
    navigate("/customers/new");
  }

  return (
    <div className="customers-page">
      {/* =====================================================
          Page Header
      ====================================================== */}

      <div className="customers-page-header">
        <div>
          <h1>고객 관리</h1>
          <p>
            견적을 의뢰한 고객과 업체 정보를 관리합니다.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleCreateCustomer}
        >
          + 고객 등록
        </button>
      </div>

      {/* =====================================================
          Search
      ====================================================== */}

      <section className="customers-search-card">
        <form
          className="customers-search-form"
          onSubmit={handleSearch}
        >
          <div className="customers-search-field">
            <label htmlFor="customer-keyword">
              고객 검색
            </label>

            <input
              id="customer-keyword"
              className="customers-search-input"
              type="search"
              value={keywordInput}
              onChange={(event) =>
                setKeywordInput(event.target.value)
              }
              placeholder="고객명 / 회사명 / 담당자 / 이메일 / 연락처"
            />
          </div>

          <div className="customers-filter-field">
            <label htmlFor="customer-active">
              상태
            </label>

            <select
              id="customer-active"
              className="customers-filter-select"
              value={activeFilter}
              onChange={handleActiveFilterChange}
            >
              <option value="all">전체</option>
              <option value="active">사용</option>
              <option value="inactive">미사용</option>
            </select>
          </div>

          <div className="customers-search-actions">
            <button
              type="submit"
              className="btn btn-primary"
            >
              검색
            </button>

            <button
              type="button"
              className="btn"
              onClick={handleResetSearch}
            >
              초기화
            </button>
          </div>
        </form>
      </section>

      {/* =====================================================
          Result Header
      ====================================================== */}

      <div className="customers-result-header">
        <div>
          <strong>
            고객 목록
          </strong>

          {data && (
            <span>
              총 {data.totalElements.toLocaleString("ko-KR")}명
            </span>
          )}
        </div>

        {isFetching && !isLoading && (
          <span className="customers-refreshing">
            새로고침 중...
          </span>
        )}
      </div>

      {/* =====================================================
          Loading
      ====================================================== */}

      {isLoading && (
        <div className="customers-state">
          고객 정보를 불러오고 있습니다.
        </div>
      )}

      {/* =====================================================
          Error
      ====================================================== */}

      {isError && (
        <div className="customers-state customers-error">
          <strong>
            고객 목록을 불러오지 못했습니다.
          </strong>

          <p>
            {error instanceof Error
              ? error.message
              : "잠시 후 다시 시도해주세요."}
          </p>
        </div>
      )}

      {/* =====================================================
          Empty
      ====================================================== */}

      {!isLoading &&
        !isError &&
        data &&
        data.content.length === 0 && (
          <div className="customers-state">
            <strong>
              등록된 고객이 없습니다.
            </strong>

            <p>
              새로운 고객을 등록하거나 검색 조건을 확인해주세요.
            </p>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCreateCustomer}
            >
              + 고객 등록
            </button>
          </div>
        )}

      {/* =====================================================
          Table
      ====================================================== */}

      {!isLoading &&
        !isError &&
        data &&
        data.content.length > 0 && (
          <>
            <div className="customers-table-wrapper">
              <table className="customers-table">
                <thead>
                  <tr>
                    <th>고객명</th>
                    <th>회사명</th>
                    <th>담당자</th>
                    <th>연락처</th>
                    <th>이메일</th>
                    <th>유입경로</th>
                    <th>상태</th>
                    <th>등록일</th>
                  </tr>
                </thead>

                <tbody>
                  {data.content.map((customer) => (
                    <tr
                      key={customer.id}
                      className="customers-table-row"
                      tabIndex={0}
                      onClick={() =>
                        handleCustomerClick(customer.id)
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" ||
                          event.key === " "
                        ) {
                          event.preventDefault();

                          handleCustomerClick(
                            customer.id,
                          );
                        }
                      }}
                    >
                      <td>
                        <strong>
                          {customer.customerName}
                        </strong>
                      </td>

                      <td>
                        {customer.companyName || "-"}
                      </td>

                      <td>
                        {customer.contactName || "-"}
                      </td>

                      <td>
                        {customer.phone || "-"}
                      </td>

                      <td>
                        {customer.email || "-"}
                      </td>

                      <td>
                        {customer.initialSource || "-"}
                      </td>

                      <td>
                        <span
                          className={
                            customer.active
                              ? "customers-status customers-status-active"
                              : "customers-status customers-status-inactive"
                          }
                        >
                          {customer.active
                            ? "사용"
                            : "미사용"}
                        </span>
                      </td>

                      <td>
                        {formatDate(
                          customer.createdAt,
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* =================================================
                Pagination
            ================================================== */}

            <div className="customers-pagination">
              <button
                type="button"
                className="btn"
                disabled={data.first}
                onClick={() =>
                  setPage((current) =>
                    Math.max(0, current - 1),
                  )
                }
              >
                이전
              </button>

              <span>
                {data.totalPages === 0
                  ? 0
                  : data.page + 1}
                {" / "}
                {data.totalPages}
              </span>

              <button
                type="button"
                className="btn"
                disabled={data.last}
                onClick={() =>
                  setPage((current) =>
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
 * Date
 * ========================================================= */

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