import {
    useMemo,
    useState,
} from "react";
import {
    StandardRateModal,
} from "./StandardRateModal";
import {
    useRateCategories,
    useStandardRates,
} from "../../features/rate/hooks/useStandardRates";

import {
    RateCategoryModal,
} from "./RateCategoryModal";

import type {
    RateCategory,
    StandardRateListParams,
} from "../../features/rate/types/rate.types";

import "./RatesPage.css";


const PAGE_SIZE = 20;


function formatMoney(
    value: number,
) {
    return value.toLocaleString("ko-KR");
}


export function RatesPage() {
    const [
        selectedCategoryId,
        setSelectedCategoryId,
    ] = useState<number | undefined>(
        undefined,
    );
    const [
        categoryModal,
        setCategoryModal,
    ] = useState<
        RateCategory | null | undefined
    >(undefined);
    const [
        keywordInput,
        setKeywordInput,
    ] = useState("");

    const [
        keyword,
        setKeyword,
    ] = useState("");

    const [
        activeFilter,
        setActiveFilter,
    ] = useState<
        "ALL" | "ACTIVE" | "INACTIVE"
    >("ALL");

    const [
        page,
        setPage,
    ] = useState(0);
    const [
        modalRateId,
        setModalRateId,
    ] = useState<number | null | undefined>(
        undefined,
    );

    /* =========================================================
       Category
    ========================================================= */

    const categoriesQuery =
        useRateCategories();


    /* =========================================================
       Rate List Params
    ========================================================= */

    const listParams =
        useMemo<
            StandardRateListParams
        >(
            () => ({
                keyword:
                    keyword || undefined,

                categoryId:
                    selectedCategoryId,

                active:
                    activeFilter === "ALL"
                        ? undefined
                        : activeFilter ===
                        "ACTIVE",

                page,
                size: PAGE_SIZE,
                sort: "id,desc",
            }),
            [
                keyword,
                selectedCategoryId,
                activeFilter,
                page,
            ],
        );


    const ratesQuery =
        useStandardRates(
            listParams,
        );


    /* =========================================================
       Search
    ========================================================= */

    function handleSearch(
        event: React.FormEvent,
    ) {
        event.preventDefault();

        setKeyword(
            keywordInput.trim(),
        );

        setPage(0);
    }


    function handleReset() {
        setKeywordInput("");
        setKeyword("");

        setSelectedCategoryId(
            undefined,
        );

        setActiveFilter("ALL");

        setPage(0);
    }


    function handleCategoryChange(
        categoryId?: number,
    ) {
        setSelectedCategoryId(
            categoryId,
        );

        setPage(0);
    }


    /* =========================================================
       Render
    ========================================================= */

    return (
        <main className="rates-page">

            {/* =====================================================
          Header
      ====================================================== */}

            <header className="rates-page-header">

                <div>
                    <h1>
                        표준단가 관리
                    </h1>

                    <p>
                        견적 작성에 사용하는
                        개발 기능별 기준 단가를
                        관리한다.
                    </p>
                </div>


                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() =>
                        setModalRateId(null)
                    }
                >
                    + 표준단가 등록
                </button>

            </header>


            {/* =====================================================
          Body
      ====================================================== */}

            <div className="rates-layout">

                {/* ===================================================
            Category
        ==================================================== */}

                <aside className="rates-category">

                    <div className="rates-category-header">

                        <div>
                            <h2>
                                카테고리
                            </h2>

                            <span>
                                표준단가 분류
                            </span>
                        </div>


                        <button
                            type="button"
                            className="rates-category-add"
                            aria-label="카테고리 등록"
                            title="카테고리 등록"
                            onClick={() =>
                                setCategoryModal(null)
                            }
                        >
                            +
                        </button>

                    </div>


                    {categoriesQuery.isLoading && (
                        <div className="rates-category-state">
                            카테고리를 불러오고
                            있습니다.
                        </div>
                    )}


                    {categoriesQuery.isError && (
                        <div className="rates-category-state rates-error">
                            카테고리를 불러오지
                            못했습니다.
                        </div>
                    )}


                    {categoriesQuery.data && (
                        <nav className="rates-category-list">

                            <button
                                type="button"
                                className={
                                    selectedCategoryId ===
                                        undefined
                                        ? "rates-category-item active"
                                        : "rates-category-item"
                                }
                                onClick={() =>
                                    handleCategoryChange()
                                }
                            >
                                <span>
                                    전체
                                </span>
                            </button>


                            {categoriesQuery.data.map(
                                (category) => (
                                    <div
                                        key={category.id}
                                        className="rates-category-row"
                                    >

                                        <button
                                            type="button"
                                            className={
                                                selectedCategoryId ===
                                                    category.id
                                                    ? "rates-category-item active"
                                                    : "rates-category-item"
                                            }
                                            onClick={() =>
                                                handleCategoryChange(
                                                    category.id,
                                                )
                                            }
                                        >
                                            <span>
                                                {category.name}
                                            </span>

                                            {!category.active && (
                                                <small>
                                                    미사용
                                                </small>
                                            )}
                                        </button>


                                        <button
                                            type="button"
                                            className="rates-category-edit"
                                            aria-label={`${category.name} 수정`}
                                            title="카테고리 수정"
                                            onClick={() =>
                                                setCategoryModal(
                                                    category,
                                                )
                                            }
                                        >
                                            ⋯
                                        </button>

                                    </div>
                                ),
                            )}

                        </nav>
                    )}

                </aside>


                {/* ===================================================
            Standard Rate
        ==================================================== */}

                <section className="rates-content">

                    {/* =================================================
              Search
          ================================================== */}

                    <form
                        className="rates-search"
                        onSubmit={handleSearch}
                    >

                        <div className="rates-search-field">

                            <label htmlFor="rate-keyword">
                                검색
                            </label>

                            <input
                                id="rate-keyword"
                                type="text"
                                value={keywordInput}
                                placeholder="기능명 또는 설명 검색"
                                onChange={(event) =>
                                    setKeywordInput(
                                        event.target.value,
                                    )
                                }
                            />

                        </div>


                        <div className="rates-search-field rates-status-field">

                            <label htmlFor="rate-active">
                                상태
                            </label>

                            <select
                                id="rate-active"
                                value={activeFilter}
                                onChange={(event) => {
                                    setActiveFilter(
                                        event.target.value as
                                        | "ALL"
                                        | "ACTIVE"
                                        | "INACTIVE",
                                    );

                                    setPage(0);
                                }}
                            >
                                <option value="ALL">
                                    전체
                                </option>

                                <option value="ACTIVE">
                                    사용
                                </option>

                                <option value="INACTIVE">
                                    미사용
                                </option>
                            </select>

                        </div>


                        <div className="rates-search-actions">

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


                    {/* =================================================
              Result Header
          ================================================== */}

                    <div className="rates-result-header">

                        <div>
                            <strong>
                                표준단가 목록
                            </strong>


                            {ratesQuery.data && (
                                <span>
                                    총{" "}
                                    {ratesQuery.data
                                        .totalElements
                                        .toLocaleString(
                                            "ko-KR",
                                        )}
                                    건
                                </span>
                            )}
                        </div>


                        {ratesQuery.isFetching &&
                            !ratesQuery.isLoading && (
                                <span className="rates-refreshing">
                                    새로고침 중...
                                </span>
                            )}

                    </div>


                    {/* =================================================
              Loading
          ================================================== */}

                    {ratesQuery.isLoading && (
                        <div className="rates-state">
                            표준단가 목록을 불러오고
                            있습니다.
                        </div>
                    )}


                    {/* =================================================
              Error
          ================================================== */}

                    {ratesQuery.isError && (
                        <div className="rates-state rates-error">

                            <strong>
                                표준단가 목록을
                                불러오지 못했습니다.
                            </strong>


                            <p>
                                {ratesQuery.error
                                    instanceof Error
                                    ? ratesQuery.error.message
                                    : "잠시 후 다시 시도해주세요."}
                            </p>

                        </div>
                    )}


                    {/* =================================================
              Empty
          ================================================== */}

                    {ratesQuery.data &&
                        ratesQuery.data.content.length ===
                        0 && (
                            <div className="rates-state">
                                조건에 해당하는
                                표준단가가 없습니다.
                            </div>
                        )}


                    {/* =================================================
              Table
          ================================================== */}

                    {ratesQuery.data &&
                        ratesQuery.data.content.length >
                        0 && (
                            <div className="rates-table-wrap">

                                <table className="rates-table">

                                    <thead>
                                        <tr>
                                            <th>
                                                카테고리
                                            </th>

                                            <th>
                                                기능명
                                            </th>

                                            <th>
                                                표준단가
                                            </th>

                                            <th>
                                                단위
                                            </th>

                                            <th>
                                                예상시간
                                            </th>

                                            <th>
                                                상태
                                            </th>
                                        </tr>
                                    </thead>


                                    <tbody>

                                        {ratesQuery.data.content.map(
                                            (rate) => (
                                                <tr
                                                    key={rate.id}
                                                    className="rates-table-row"
                                                    onClick={() =>
                                                        setModalRateId(rate.id)
                                                    }
                                                >
                                                    <td>
                                                        <span className="rates-category-badge">
                                                            {
                                                                rate.categoryName
                                                            }
                                                        </span>
                                                    </td>


                                                    <td>
                                                        <strong>
                                                            {
                                                                rate.featureName
                                                            }
                                                        </strong>
                                                    </td>


                                                    <td className="rates-money">
                                                        {formatMoney(
                                                            rate.standardPrice,
                                                        )}
                                                        원
                                                    </td>


                                                    <td>
                                                        {
                                                            rate.defaultUnit
                                                        }
                                                    </td>


                                                    <td>
                                                        {rate.defaultHours !=
                                                            null
                                                            ? `${rate.defaultHours}시간`
                                                            : "-"}
                                                    </td>


                                                    <td>
                                                        <span
                                                            className={
                                                                rate.active
                                                                    ? "rates-status rates-status-active"
                                                                    : "rates-status"
                                                            }
                                                        >
                                                            {rate.active
                                                                ? "사용"
                                                                : "미사용"}
                                                        </span>
                                                    </td>

                                                </tr>
                                            ),
                                        )}

                                    </tbody>

                                </table>

                            </div>
                        )}


                    {/* =================================================
              Pagination
          ================================================== */}

                    {ratesQuery.data &&
                        ratesQuery.data.totalPages >
                        1 && (
                            <div className="rates-pagination">

                                <button
                                    type="button"
                                    className="btn"
                                    disabled={
                                        ratesQuery.data.first
                                    }
                                    onClick={() =>
                                        setPage(
                                            (current) =>
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
                                    {ratesQuery.data.page +
                                        1}
                                    {" / "}
                                    {
                                        ratesQuery.data
                                            .totalPages
                                    }
                                </span>


                                <button
                                    type="button"
                                    className="btn"
                                    disabled={
                                        ratesQuery.data.last
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
                        )}

                </section>

            </div>
            {modalRateId !== undefined && (
                <StandardRateModal
                    rateId={modalRateId}
                    categories={
                        categoriesQuery.data ?? []
                    }
                    onClose={() =>
                        setModalRateId(undefined)
                    }
                />
            )}
            {categoryModal !== undefined && (
                <RateCategoryModal
                    category={categoryModal}
                    onClose={() =>
                        setCategoryModal(undefined)
                    }
                />
            )}
        </main>
    );
}