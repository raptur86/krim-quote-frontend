
import { useMemo, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  FolderTree,
  LoaderCircle,
  Pencil,
  Plus,
  RotateCcw,
  Search,
} from "lucide-react";

import { StandardRateModal } from "./StandardRateModal";
import { RateCategoryModal } from "./RateCategoryModal";
import {
  useRateCategories,
  useStandardRates,
} from "../../features/rate/hooks/useStandardRates";
import type {
  RateCategory,
  StandardRateListParams,
} from "../../features/rate/types/rate.types";

import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

import "./RatesPage.css";

const PAGE_SIZE = 20;

type ActiveFilter = "ALL" | "ACTIVE" | "INACTIVE";

function formatMoney(value: number) {
  return value.toLocaleString("ko-KR");
}

export function RatesPage() {
  const [selectedCategoryId, setSelectedCategoryId] =
    useState<number | undefined>(undefined);

  const [categoryModal, setCategoryModal] =
    useState<RateCategory | null | undefined>(undefined);

  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");

  const [activeFilter, setActiveFilter] =
    useState<ActiveFilter>("ALL");

  const [page, setPage] = useState(0);

  const [modalRateId, setModalRateId] =
    useState<number | null | undefined>(undefined);

  const categoriesQuery = useRateCategories();

  const listParams = useMemo<StandardRateListParams>(
    () => ({
      keyword: keyword || undefined,
      categoryId: selectedCategoryId,
      active:
        activeFilter === "ALL"
          ? undefined
          : activeFilter === "ACTIVE",
      page,
      size: PAGE_SIZE,
      sort: "id,desc",
    }),
    [keyword, selectedCategoryId, activeFilter, page]
  );

  const ratesQuery = useStandardRates(listParams);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setKeyword(keywordInput.trim());
    setPage(0);
  }

  function handleReset() {
    setKeywordInput("");
    setKeyword("");
    setSelectedCategoryId(undefined);
    setActiveFilter("ALL");
    setPage(0);
  }

  function handleCategoryChange(categoryId?: number) {
    setSelectedCategoryId(categoryId);
    setPage(0);
  }

  function handleRateRowKeyDown(
    event: KeyboardEvent<HTMLTableRowElement>,
    rateId: number
  ) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setModalRateId(rateId);
    }
  }

  const rateData = ratesQuery.data;
  const showRateData =
    !ratesQuery.isLoading && !ratesQuery.isError && rateData;

  return (
    <main className="rates-page">
      <header className="rates-page-header">
        <div className="rates-page-heading">
          <span className="rates-page-heading-icon">
            <CircleDollarSign size={24} aria-hidden="true" />
          </span>

          <div>
            <h1>표준단가 관리</h1>
            <p>
              견적 작성에 사용하는 개발 기능별 기준 단가를
              관리한다.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="primary"
          onClick={() => setModalRateId(null)}
        >
          <Plus size={17} aria-hidden="true" />
          표준단가 등록
        </Button>
      </header>

      <div className="rates-layout">
        {/* 카테고리 */}
        <aside className="rates-category">
          <div className="rates-category-header">
            <div className="rates-category-title">
              <FolderTree size={18} aria-hidden="true" />

              <div>
                <h2>카테고리</h2>
                <span>표준단가 분류</span>
              </div>
            </div>

            <button
              type="button"
              className="rates-category-add"
              aria-label="카테고리 등록"
              title="카테고리 등록"
              onClick={() => setCategoryModal(null)}
            >
              <Plus size={17} aria-hidden="true" />
            </button>
          </div>

          {categoriesQuery.isLoading && (
            <div className="rates-category-state" role="status">
              <LoaderCircle
                size={18}
                className="rates-spin"
                aria-hidden="true"
              />
              카테고리를 불러오는 중
            </div>
          )}

          {categoriesQuery.isError && (
            <div
              className="rates-category-state rates-error"
              role="alert"
            >
              <AlertCircle size={18} aria-hidden="true" />
              카테고리를 불러오지 못했습니다.
            </div>
          )}

          {categoriesQuery.data && (
            <nav
              className="rates-category-list"
              aria-label="표준단가 카테고리"
            >
              <div className="rates-category-row">
                <button
                  type="button"
                  className={`rates-category-item ${
                    selectedCategoryId === undefined
                      ? "active"
                      : ""
                  }`}
                  aria-current={
                    selectedCategoryId === undefined
                      ? "true"
                      : undefined
                  }
                  onClick={() => handleCategoryChange()}
                >
                  <span>전체</span>
                </button>
              </div>

              {categoriesQuery.data.map((category) => (
                <div
                  key={category.id}
                  className="rates-category-row"
                >
                  <button
                    type="button"
                    className={`rates-category-item ${
                      selectedCategoryId === category.id
                        ? "active"
                        : ""
                    }`}
                    aria-current={
                      selectedCategoryId === category.id
                        ? "true"
                        : undefined
                    }
                    onClick={() =>
                      handleCategoryChange(category.id)
                    }
                  >
                    <span>{category.name}</span>

                    {!category.active && (
                      <small>미사용</small>
                    )}
                  </button>

                  <button
                    type="button"
                    className="rates-category-edit"
                    aria-label={`${category.name} 수정`}
                    title="카테고리 수정"
                    onClick={() => setCategoryModal(category)}
                  >
                    <Pencil size={14} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </nav>
          )}
        </aside>

        {/* 표준단가 목록 */}
        <section
          className="rates-content"
          aria-labelledby="rates-list-title"
        >
          <form
            className="rates-search"
            onSubmit={handleSearch}
          >
            <div className="rates-search-field">
              <label htmlFor="rate-keyword">검색</label>

              <div className="rates-search-input-wrap">
                <Search
                  size={17}
                  aria-hidden="true"
                />

                <input
                  id="rate-keyword"
                  type="search"
                  value={keywordInput}
                  placeholder="기능명 또는 설명 검색"
                  onChange={(event) =>
                    setKeywordInput(event.target.value)
                  }
                />
              </div>
            </div>

            <div className="rates-search-field rates-status-field">
              <label htmlFor="rate-active">상태</label>

              <select
                id="rate-active"
                value={activeFilter}
                onChange={(event) => {
                  setActiveFilter(
                    event.target.value as ActiveFilter
                  );
                  setPage(0);
                }}
              >
                <option value="ALL">전체</option>
                <option value="ACTIVE">사용</option>
                <option value="INACTIVE">미사용</option>
              </select>
            </div>

            <div className="rates-search-actions">
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

          <div className="rates-result-header">
            <div className="rates-result-title">
              <strong id="rates-list-title">
                표준단가 목록
              </strong>

              {rateData && (
                <span>
                  총{" "}
                  {rateData.totalElements.toLocaleString(
                    "ko-KR"
                  )}
                  건
                </span>
              )}
            </div>

            {ratesQuery.isFetching &&
              !ratesQuery.isLoading && (
                <span
                  className="rates-refreshing"
                  role="status"
                >
                  <LoaderCircle
                    size={14}
                    className="rates-spin"
                    aria-hidden="true"
                  />
                  새로고침 중...
                </span>
              )}
          </div>

          {ratesQuery.isLoading && (
            <div className="rates-state" role="status">
              <LoaderCircle
                size={27}
                className="rates-spin"
                aria-hidden="true"
              />
              <strong>표준단가 목록을 불러오는 중</strong>
            </div>
          )}

          {ratesQuery.isError && (
            <div
              className="rates-state rates-error"
              role="alert"
            >
              <AlertCircle size={27} aria-hidden="true" />

              <strong>
                표준단가 목록을 불러오지 못했습니다.
              </strong>

              <p>
                {ratesQuery.error instanceof Error
                  ? ratesQuery.error.message
                  : "잠시 후 다시 시도해 주세요."}
              </p>
            </div>
          )}

          {showRateData &&
            rateData.content.length === 0 && (
              <div className="rates-state">
                <CircleDollarSign
                  size={30}
                  aria-hidden="true"
                />
                <strong>
                  조건에 해당하는 표준단가가 없습니다.
                </strong>
                <p>
                  검색 조건을 변경하거나 새 표준단가를
                  등록할 수 있습니다.
                </p>
              </div>
            )}

          {showRateData &&
            rateData.content.length > 0 && (
              <div className="rates-table-wrap">
                <table className="rates-table">
                  <thead>
                    <tr>
                      <th scope="col">카테고리</th>
                      <th scope="col">기능명</th>
                      <th
                        scope="col"
                        className="rates-money-column"
                      >
                        표준단가
                      </th>
                      <th scope="col">단위</th>
                      <th scope="col">예상시간</th>
                      <th scope="col">상태</th>
                    </tr>
                  </thead>

                  <tbody>
                    {rateData.content.map((rate) => (
                      <tr
                        key={rate.id}
                        className="rates-table-row"
                        tabIndex={0}
                        role="button"
                        aria-label={`${rate.featureName} 표준단가 수정`}
                        onClick={() =>
                          setModalRateId(rate.id)
                        }
                        onKeyDown={(event) =>
                          handleRateRowKeyDown(
                            event,
                            rate.id
                          )
                        }
                      >
                        <td>
                          <span className="rates-category-badge">
                            {rate.categoryName}
                          </span>
                        </td>

                        <td>
                          <strong className="rates-feature-name">
                            {rate.featureName}
                          </strong>
                        </td>

                        <td className="rates-money">
                          {formatMoney(rate.standardPrice)}원
                        </td>

                        <td>{rate.defaultUnit}</td>

                        <td>
                          {rate.defaultHours != null
                            ? `${rate.defaultHours}시간`
                            : "-"}
                        </td>

                        <td>
                          <Badge
                            variant={
                              rate.active
                                ? "success"
                                : "neutral"
                            }
                          >
                            {rate.active
                              ? "사용"
                              : "미사용"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          {showRateData &&
            rateData.totalPages > 1 && (
              <div className="rates-pagination">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={rateData.first}
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
                  <strong>{rateData.page + 1}</strong>
                  {" / "}
                  {rateData.totalPages}
                </span>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={rateData.last}
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
            )}
        </section>
      </div>

      {modalRateId !== undefined && (
        <StandardRateModal
          rateId={modalRateId}
          categories={categoriesQuery.data ?? []}
          onClose={() => setModalRateId(undefined)}
        />
      )}

      {categoryModal !== undefined && (
        <RateCategoryModal
          category={categoryModal}
          onClose={() => setCategoryModal(undefined)}
        />
      )}
    </main>
  );
}
