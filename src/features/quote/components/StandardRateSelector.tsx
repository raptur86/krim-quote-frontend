
import { useState } from "react";
import {
  CheckCheck,
  CirclePlus,
  Info,
  LoaderCircle,
  Search,
  X,
} from "lucide-react";

import { useStandardRates } from "../../rate/hooks/useStandardRates";

import type { StandardRateListItem } from "../../rate/types/rate.types";

import { Button } from "../../../components/ui/Button";

import "./StandardRateSelector.css";

type Props = {
  disabled?: boolean;
  onAdd: (rates: StandardRateListItem[]) => void;
};

export function StandardRateSelector({
  disabled = false,
  onAdd,
}: Props) {
  const [keyword, setKeyword] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const ratesQuery = useStandardRates({
    keyword: keyword.trim() || undefined,
    active: true,
    page: 0,
    size: 100,
    sort: "category.id,asc",
  });

  const rates = ratesQuery.data?.content ?? [];

  const visibleSelectedCount = rates.filter((rate) =>
    selectedIds.includes(rate.id)
  ).length;

  const allVisibleSelected =
    rates.length > 0 &&
    rates.every((rate) => selectedIds.includes(rate.id));

  function toggleRate(rateId: number) {
    setSelectedIds((previous) =>
      previous.includes(rateId)
        ? previous.filter((id) => id !== rateId)
        : [...previous, rateId]
    );
  }

  function handleSelectAll() {
    if (allVisibleSelected) {
      const visibleIds = new Set(rates.map((rate) => rate.id));

      setSelectedIds((previous) =>
        previous.filter((id) => !visibleIds.has(id))
      );
      return;
    }

    setSelectedIds((previous) => [
      ...new Set([...previous, ...rates.map((rate) => rate.id)]),
    ]);
  }

  function handleClearSelection() {
    setSelectedIds([]);
  }

  function handleAdd() {
    const selected = rates.filter((rate) =>
      selectedIds.includes(rate.id)
    );

    if (selected.length === 0) {
      return;
    }

    onAdd(selected);
    setSelectedIds([]);
  }

  return (
    <section className="standard-rate-selector">
      <div className="standard-rate-selector-header">
        <div>
          <h3>표준단가 검색</h3>
          <p>
            등록된 표준 기능을 선택하여 견적항목에
            추가한다.
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
          onChange={(event) => {
            setKeyword(event.target.value);
            setSelectedIds([]);
          }}
        />

        {keyword && (
          <button
            type="button"
            className="standard-rate-search-clear"
            aria-label="검색어 지우기"
            disabled={disabled}
            onClick={() => {
              setKeyword("");
              setSelectedIds([]);
            }}
          >
            <X size={15} aria-hidden="true" />
          </button>
        )}
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
            onClick={handleClearSelection}
          >
            선택 초기화
          </button>
        )}
      </div>

      <div className="standard-rate-list-container">
        <div className="standard-rate-list-header">
          <span>선택</span>
          <span>카테고리</span>
          <span>기능명</span>
          <span>표준단가</span>
        </div>

        {ratesQuery.isLoading && (
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

        {ratesQuery.isError && (
          <div
            className="standard-rate-selector-state standard-rate-selector-error"
            role="alert"
          >
            <Info size={24} aria-hidden="true" />
            <strong>표준단가 조회 실패</strong>
            <p>
              표준단가를 불러오지 못했습니다.
            </p>
          </div>
        )}

        {!ratesQuery.isLoading &&
          !ratesQuery.isError &&
          rates.length === 0 && (
            <div className="standard-rate-selector-state">
              <Search size={25} aria-hidden="true" />
              <strong>조회된 표준단가가 없습니다.</strong>
              <p>
                검색어를 변경하거나 표준단가 관리에서
                기능을 등록해 주세요.
              </p>
            </div>
          )}

        {!ratesQuery.isLoading &&
          !ratesQuery.isError &&
          rates.length > 0 && (
            <div className="standard-rate-list">
              {rates.map((rate) => {
                const checked = selectedIds.includes(rate.id);

                return (
                  <label
                    key={rate.id}
                    className={[
                      "standard-rate-row",
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
                        onChange={() => toggleRate(rate.id)}
                      />
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
