import {
  useState,
} from "react";

import {
  useStandardRates,
} from "../../rate/hooks/useStandardRates";

import type {
  StandardRateListItem,
} from "../../rate/types/rate.types";

import "./StandardRateSelector.css";


type Props = {
  disabled?: boolean;

  onAdd: (
    rates: StandardRateListItem[],
  ) => void;
};


export function StandardRateSelector({
  disabled = false,
  onAdd,
}: Props) {
  const [
    keyword,
    setKeyword,
  ] = useState("");

  const [
    selectedIds,
    setSelectedIds,
  ] = useState<number[]>([]);


  const ratesQuery =
    useStandardRates({
      keyword:
        keyword.trim() || undefined,

      active: true,

      page: 0,
      size: 100,

      sort: "categoryId,asc",
    });


  const rates =
    ratesQuery.data?.content ?? [];


  function toggleRate(
    rateId: number,
  ) {
    setSelectedIds(
      (previous) =>
        previous.includes(rateId)
          ? previous.filter(
              (id) =>
                id !== rateId,
            )
          : [
              ...previous,
              rateId,
            ],
    );
  }


  function handleAdd() {
    const selected =
      rates.filter(
        (rate) =>
          selectedIds.includes(
            rate.id,
          ),
      );

    if (
      selected.length === 0
    ) {
      return;
    }

    onAdd(selected);

    setSelectedIds([]);
  }


  return (
    <section className="standard-rate-selector">

      <div className="standard-rate-selector-header">

        <div>
          <h3>
            표준단가에서 추가
          </h3>

          <p>
            등록된 표준 기능을
            견적항목으로 추가합니다.
          </p>
        </div>

      </div>


      <div className="standard-rate-search">

        <input
          type="search"
          value={keyword}
          disabled={disabled}
          placeholder="기능 검색"
          onChange={(event) =>
            setKeyword(
              event.target.value,
            )
          }
        />

      </div>


      {ratesQuery.isLoading && (
        <p>
          표준단가를
          불러오고 있습니다.
        </p>
      )}


      {ratesQuery.isError && (
        <p role="alert">
          표준단가를
          불러오지 못했습니다.
        </p>
      )}


      {!ratesQuery.isLoading &&
        !ratesQuery.isError &&
        rates.length === 0 && (
          <p>
            조회된 표준단가가
            없습니다.
          </p>
        )}


      {rates.length > 0 && (
        <div className="standard-rate-list">

          {rates.map(
            (rate) => (
              <label
                key={rate.id}
                className="standard-rate-row"
              >

                <input
                  type="checkbox"
                  checked={
                    selectedIds.includes(
                      rate.id,
                    )
                  }
                  disabled={disabled}
                  onChange={() =>
                    toggleRate(
                      rate.id,
                    )
                  }
                />

                <span className="standard-rate-category">
                  {rate.categoryName}
                </span>

                <span className="standard-rate-feature">
                  {rate.featureName}
                </span>

                <span className="standard-rate-price">
                  {rate.standardPrice.toLocaleString(
                    "ko-KR",
                  )}
                  원
                </span>

              </label>
            ),
          )}

        </div>
      )}


      <div className="standard-rate-selector-actions">

        <button
          type="button"
          disabled={
            disabled ||
            selectedIds.length === 0
          }
          onClick={handleAdd}
        >
          + 선택 항목 추가
        </button>

      </div>

    </section>
  );
}