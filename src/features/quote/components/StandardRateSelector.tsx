
import { useMemo, useState } from "react";
import {
  CheckCheck,
  CirclePlus,
  Info,
  LoaderCircle,
  Search,
  X,
} from "lucide-react";

import {
  useRateCategories,
  useStandardRates,
} from "../../rate/hooks/useStandardRates";

import type {
  StandardRateListItem,
  StandardRateType,
} from "../../rate/types/rate.types";

import { Button } from "../../../components/ui/Button";

import "./StandardRateSelector.css";

type Props = {
  disabled?: boolean;
  onAdd: (rates: StandardRateListItem[]) => void;
};

type RateTypeFilter = "ALL" | StandardRateType;

export function StandardRateSelector({
  disabled = false,
  onAdd,
}: Props) {
  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [rateType, setRateType] =
    useState<RateTypeFilter>("ALL");

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const categoriesQuery = useRateCategories(true);

  const ratesQuery = useStandardRates({
    keyword: keyword.trim() || undefined,
    categoryId: categoryId
      ? Number(categoryId)
      : undefined,
    rateType: rateType === "ALL" ? undefined : rateType,
    active: true,
    page: 0,
    size: 100,
    sort: "category.id,asc",
  });

  const rates = useMemo(
    () => ratesQuery.data?.content ?? [],
    [ratesQuery.data]
  );

  const categories = categoriesQuery.data ?? [];

  const selectedRates = useMemo(
    () =>
      rates.filter((rate) =>
        selectedIds.includes(rate.id)
      ),
    [rates, selectedIds]
  );

  const visibleSelectedCount = selectedRates.length;

  const allVisibleSelected =
    rates.length > 0 &&
    rates.every((rate) => selectedIds.includes(rate.id));

  function clearSelection() {
    setSelectedIds([]);
  }

  function handleKeywordChange(value: string) {
    setKeyword(value);
    clearSelection();
  }

  function handleCategoryChange(value: string) {
    setCategoryId(value);
    clearSelection();
  }

  function handleRateTypeChange(value: RateTypeFilter) {
    setRateType(value);
    clearSelection();
  }

  function toggleRate(rateId: number) {
    setSelectedIds((previous) =>
      previous.includes(rateId)
        ? previous.filter((id) => id !== rateId)
        : [...previous, rateId]
    );
  }

  function handleSelectAll() {
    if (allVisibleSelected) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(rates.map((rate) => rate.id));
  }

  function handleAdd() {
    if (
      disabled ||
      ratesQuery.isFetching ||
      selectedRates.length === 0
    ) {
      return;
    }

    onAdd(selectedRates);
    clearSelection();
  }

  const isLoading =
    ratesQuery.isLoading || categoriesQuery.isLoading;

  const hasError =
    ratesQuery.isError || categoriesQuery.isError;

  return (
    <section className="standard-rate-selector">
      <div className="standard-rate-selector-header">
        <div>
          <h3>표준단가 선택</h3>
          <p>
            견적에 추가할 기능이나 패키지를 선택하세요.
          </p>
        </div>

        <span className="standard-rate-selector-count">
          {ratesQuery.data
            ? `조회 ${ratesQuery.data.totalElements.toLocaleString("ko-KR")}건`
            : "표준단가 조회"}
        </span>
      </div>

      <div className="standard-rate-search">
        <Search size={17} aria-hidden="true" />

        <input
          type="search"
          value={keyword}
          disabled={disabled}
          placeholder="기능명 또는 표준단가 검색"
          aria-label="표준단가 검색"
          onChange={(event) =>
            handleKeywordChange(event.target.value)
          }
        />

        {keyword && (
          <button
            type="button"
            className="standard-rate-search-clear"
            aria-label="검색어 지우기"
            disabled={disabled}
            onClick={() => handleKeywordChange("")}
          >
            <X size={15} aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="standard-rate-filter-bar">
        <select
          className="standard-rate-category-filter"
          value={categoryId}
          disabled={disabled || categoriesQuery.isLoading}
          aria-label="카테고리 선택"
          onChange={(event) =>
            handleCategoryChange(event.target.value)
          }
        >
          <option value="">전체 카테고리</option>

          {categories.map((category) => (
            <option
              key={category.id}
              value={String(category.id)}
            >
              {category.name}
            </option>
          ))}
        </select>

        <div
          className="standard-rate-type-filters"
          role="group"
          aria-label="표준단가 유형"
        >
          <button
            type="button"
            className={
              rateType === "ALL" ? "active" : ""
            }
            aria-pressed={rateType === "ALL"}
            disabled={disabled}
            onClick={() => handleRateTypeChange("ALL")}
          >
            전체
          </button>

          <button
            type="button"
            className={
              rateType === "PACKAGE" ? "active" : ""
            }
            aria-pressed={rateType === "PACKAGE"}
            disabled={disabled}
            onClick={() =>
              handleRateTypeChange("PACKAGE")
            }
          >
            패키지
          </button>

          <button
            type="button"
            className={
              rateType === "FEATURE" ? "active" : ""
            }
            aria-pressed={rateType === "FEATURE"}
            disabled={disabled}
            onClick={() =>
              handleRateTypeChange("FEATURE")
            }
          >
            개별 기능
          </button>
        </div>
      </div>

      <div className="standard-rate-selector-toolbar">
        <div className="standard-rate-selector-toolbar-left">
          <button
            type="button"
            className="standard-rate-select-all"
            disabled={
              disabled ||
              ratesQuery.isFetching ||
              rates.length === 0
            }
            onClick={handleSelectAll}
          >
            <CheckCheck size={16} aria-hidden="true" />
            {allVisibleSelected
              ? "전체 선택 해제"
              : "조회 항목 전체 선택"}
          </button>

          <span className="standard-rate-selected-count">
            선택 {visibleSelectedCount}건
          </span>
        </div>

        {selectedIds.length > 0 && (
          <button
            type="button"
            className="standard-rate-clear-selection"
            disabled={disabled}
            onClick={clearSelection}
          >
            선택 초기화
          </button>
        )}
      </div>

      <div className="standard-rate-list-container">
        <div className="standard-rate-list-header standard-rate-list-header-extended">
          <span>선택</span>
          <span>구분</span>
          <span>카테고리</span>
          <span>기능명 / 패키지명</span>
          <span>표준단가</span>
        </div>

        {isLoading && (
          <div
            className="standard-rate-selector-state"
            role="status"
          >
            <LoaderCircle
              size={24}
              className="standard-rate-spin"
              aria-hidden="true"
            />
            <strong>표준단가를 불러오는 중</strong>
            <p>잠시만 기다려 주세요.</p>
          </div>
        )}

        {hasError && (
          <div
            className="standard-rate-selector-state standard-rate-selector-error"
            role="alert"
          >
            <Info size={24} aria-hidden="true" />
            <strong>표준단가 조회 실패</strong>
            <p>
              표준단가 또는 카테고리 정보를
              불러오지 못했습니다.
            </p>
          </div>
        )}

        {!isLoading &&
          !hasError &&
          rates.length === 0 && (
            <div className="standard-rate-selector-state">
              <Search size={25} aria-hidden="true" />
              <strong>조회된 표준단가가 없습니다.</strong>
              <p>
                검색 조건을 변경하거나 표준단가 관리에서
                항목을 등록해 주세요.
              </p>
            </div>
          )}

        {!isLoading &&
          !hasError &&
          rates.length > 0 && (
            <div className="standard-rate-list">
              {rates.map((rate) => {
                const checked =
                  selectedIds.includes(rate.id);

                const isPackage =
                  rate.rateType === "PACKAGE";

                return (
                  <label
                    key={rate.id}
                    className={[
                      "standard-rate-row",
                      "standard-rate-row-extended",
                      checked ? "selected" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <span className="standard-rate-checkbox">
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() =>
                          toggleRate(rate.id)
                        }
                      />
                    </span>

                    <span>
                      <span
                        className={[
                          "standard-rate-type-badge",
                          isPackage
                            ? "package"
                            : "feature",
                        ].join(" ")}
                      >
                        {isPackage ? "패키지" : "기능"}
                      </span>
                    </span>

                    <span className="standard-rate-category">
                      {rate.categoryName || "-"}
                    </span>

                    <span className="standard-rate-feature">
                      {rate.featureName}
                    </span>

                    <span className="standard-rate-price">
                      {rate.standardPrice.toLocaleString(
                        "ko-KR"
                      )}
                      원
                    </span>
                  </label>
                );
              })}
            </div>
          )}
      </div>

      <div className="standard-rate-selector-actions">
        <span className="standard-rate-selector-hint">
          <Info size={14} aria-hidden="true" />
          현재 조회된 최대 100개 항목 중에서 선택한다.
        </span>

        <Button
          type="button"
          variant="primary"
          disabled={
            disabled ||
            ratesQuery.isFetching ||
            visibleSelectedCount === 0
          }
          onClick={handleAdd}
        >
          <CirclePlus size={16} aria-hidden="true" />
          선택 항목 추가 ({visibleSelectedCount})
        </Button>
      </div>
    </section>
  );
}
