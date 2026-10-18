
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  RotateCcw,
  Users,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

import { useCustomers } from "../../features/customer/hooks/useCustomers";
import { ROUTES } from "../../app/router/routes";

import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  TableEmpty,
} from "../../components/ui/Table";

import "./CustomersPage.css";

const PAGE_SIZE = 20;

type ActiveFilter = "all" | "active" | "inactive";

export function CustomersPage() {
  const navigate = useNavigate();

  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [activeFilter, setActiveFilter] =
    useState<ActiveFilter>("all");
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

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(0);
    setKeyword(keywordInput.trim());
  }

  function handleActiveFilterChange(
    value: ActiveFilter
  ) {
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
    navigate(`${ROUTES.customers}/${customerId}`);
  }

  function handleCreateCustomer() {
    navigate(ROUTES.customerCreate);
  }

  const hasCustomers = Boolean(
    data && data.content.length > 0
  );

  return (
    <main className="customers-page">
      {/* Page Header */}
      <header className="customers-page-header">
        <div className="customers-page-header__text">
          <h1>고객 관리</h1>
          <p>
            견적을 의뢰한 고객과 업체 정보를 관리한다.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleCreateCustomer}
        >
          <Plus size={17} aria-hidden="true" />
          고객 등록
        </Button>
      </header>

      {/* Search */}
      <section aria-label="고객 검색">
        <Card>
          <CardBody>
            <form
              className="customers-search-form"
              onSubmit={handleSearch}
            >
              <div className="customers-search-field">
                <label htmlFor="customer-keyword">
                  고객 검색
                </label>

                <div className="customers-search-input-wrap">
                  <Search
                    size={18}
                    aria-hidden="true"
                    className="customers-search-icon"
                  />

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
              </div>

              <div className="customers-filter-field">
                <label htmlFor="customer-active">
                  상태
                </label>

                <select
                  id="customer-active"
                  className="customers-filter-select"
                  value={activeFilter}
                  onChange={(event) =>
                    handleActiveFilterChange(
                      event.target.value as ActiveFilter
                    )
                  }
                >
                  <option value="all">전체</option>
                  <option value="active">사용</option>
                  <option value="inactive">미사용</option>
                </select>
              </div>

              <div className="customers-search-actions">
                <Button
                  variant="primary"
                  type="submit"
                >
                  <Search size={16} aria-hidden="true" />
                  검색
                </Button>

                <Button
                  variant="outline"
                  type="button"
                  onClick={handleResetSearch}
                >
                  <RotateCcw size={16} aria-hidden="true" />
                  초기화
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </section>

      {/* Customer List */}
      <section aria-label="고객 목록">
        <Card>
          <CardHeader
            title="고객 목록"
            description={
              data
                ? `총 ${data.totalElements.toLocaleString("ko-KR")}명`
                : "등록된 고객 정보를 조회한다."
            }
            action={
              isFetching && !isLoading ? (
                <span
                  className="customers-refreshing"
                  role="status"
                >
                  <LoaderCircle
                    size={15}
                    className="customers-spin"
                    aria-hidden="true"
                  />
                  새로고침 중
                </span>
              ) : undefined
            }
          />

          {isLoading && (
            <div
              className="customers-state"
              role="status"
            >
              <LoaderCircle
                size={28}
                className="customers-spin"
                aria-hidden="true"
              />
              <strong>고객 정보를 불러오는 중</strong>
              <p>잠시만 기다려 주세요.</p>
            </div>
          )}

          {!isLoading && isError && (
            <div
              className="customers-state customers-error"
              role="alert"
            >
              <AlertCircle
                size={30}
                aria-hidden="true"
              />
              <strong>
                고객 목록을 불러오지 못했습니다.
              </strong>
              <p>
                {error instanceof Error
                  ? error.message
                  : "잠시 후 다시 시도해 주세요."}
              </p>
            </div>
          )}

          {!isLoading &&
            !isError &&
            data &&
            data.content.length === 0 && (
              <div className="customers-state">
                <Users
                  size={32}
                  aria-hidden="true"
                />
                <strong>등록된 고객이 없습니다.</strong>
                <p>
                  새로운 고객을 등록하거나 검색 조건을
                  확인해 주세요.
                </p>

                <Button
                  variant="primary"
                  onClick={handleCreateCustomer}
                >
                  <Plus size={16} aria-hidden="true" />
                  고객 등록
                </Button>
              </div>
            )}

          {!isLoading && !isError && data && hasCustomers && (
            <>
              <div className="customers-table-container">
                <Table minWidth={1050}>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>
                        고객명
                      </TableHeaderCell>
                      <TableHeaderCell>
                        회사명
                      </TableHeaderCell>
                      <TableHeaderCell>
                        담당자
                      </TableHeaderCell>
                      <TableHeaderCell>
                        연락처
                      </TableHeaderCell>
                      <TableHeaderCell>
                        이메일
                      </TableHeaderCell>
                      <TableHeaderCell>
                        유입경로
                      </TableHeaderCell>
                      <TableHeaderCell>
                        상태
                      </TableHeaderCell>
                      <TableHeaderCell>
                        등록일
                      </TableHeaderCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {data.content.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <button
                            type="button"
                            className="customers-name-button"
                            onClick={() =>
                              handleCustomerClick(customer.id)
                            }
                          >
                            {customer.customerName}
                          </button>
                        </TableCell>

                        <TableCell>
                          {customer.companyName || "-"}
                        </TableCell>

                        <TableCell>
                          {customer.contactName || "-"}
                        </TableCell>

                        <TableCell>
                          {customer.phone || "-"}
                        </TableCell>

                        <TableCell>
                          {customer.email || "-"}
                        </TableCell>

                        <TableCell>
                          {customer.initialSource || "-"}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={
                              customer.active
                                ? "success"
                                : "neutral"
                            }
                          >
                            {customer.active
                              ? "사용"
                              : "미사용"}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          {formatDate(customer.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="customers-pagination">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.first}
                  onClick={() =>
                    setPage((current) =>
                      Math.max(0, current - 1)
                    )
                  }
                >
                  <ChevronLeft
                    size={16}
                    aria-hidden="true"
                  />
                  이전
                </Button>

                <span
                  className="customers-pagination__info"
                  aria-label="현재 페이지"
                >
                  <strong>
                    {data.totalPages === 0
                      ? 0
                      : data.page + 1}
                  </strong>
                  <span>/</span>
                  <span>{data.totalPages}</span>
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.last}
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
        </Card>
      </section>
    </main>
  );
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
