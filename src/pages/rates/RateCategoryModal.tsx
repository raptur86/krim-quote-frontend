import {
  useEffect,
  useState,
} from "react";

import {
  useChangeRateCategoryActive,
  useCreateRateCategory,
  useUpdateRateCategory,
} from "../../features/rate/hooks/useStandardRates";

import type {
  RateCategory,
} from "../../features/rate/types/rate.types";


type RateCategoryModalProps = {
  category: RateCategory | null;
  onClose: () => void;
};


export function RateCategoryModal({
  category,
  onClose,
}: RateCategoryModalProps) {
  const isEdit = category !== null;

  const createCategory =
    useCreateRateCategory();

  const updateCategory =
    useUpdateRateCategory();

  const changeActive =
    useChangeRateCategoryActive();

  const [name, setName] =
    useState("");

  const [sortOrder, setSortOrder] =
    useState("0");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(null);


  /* =========================================================
     Edit Data
  ========================================================= */

  useEffect(() => {
    if (!category) {
      return;
    }

    setName(category.name);

    setSortOrder(
      String(category.sortOrder),
    );
  }, [category]);


  /* =========================================================
     Save
  ========================================================= */

  async function handleSubmit(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    setErrorMessage(null);

    const normalizedName =
      name.trim();

    const normalizedSortOrder =
      Number(sortOrder);


    if (!normalizedName) {
      setErrorMessage(
        "카테고리명을 입력해주세요.",
      );

      return;
    }


    if (
      normalizedName.length > 100
    ) {
      setErrorMessage(
        "카테고리명은 100자 이하로 입력해주세요.",
      );

      return;
    }


    if (
      sortOrder.trim() === "" ||
      !Number.isInteger(
        normalizedSortOrder,
      ) ||
      normalizedSortOrder < 0
    ) {
      setErrorMessage(
        "정렬순서는 0 이상의 정수로 입력해주세요.",
      );

      return;
    }


    try {
      if (category) {
        await updateCategory.mutateAsync({
          categoryId:
            category.id,

          request: {
            name:
              normalizedName,

            sortOrder:
              normalizedSortOrder,
          },
        });
      } else {
        await createCategory.mutateAsync({
          name:
            normalizedName,

          sortOrder:
            normalizedSortOrder,
        });
      }

      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "카테고리를 저장하지 못했습니다.",
      );
    }
  }


  /* =========================================================
     Active
  ========================================================= */

  async function handleChangeActive() {
    if (!category) {
      return;
    }

    const nextActive =
      !category.active;

    const confirmed =
      window.confirm(
        nextActive
          ? `"${category.name}" 카테고리를 다시 사용하시겠습니까?`
          : `"${category.name}" 카테고리를 미사용으로 변경하시겠습니까?`,
      );

    if (!confirmed) {
      return;
    }


    setErrorMessage(null);


    try {
      await changeActive.mutateAsync({
        categoryId:
          category.id,

        active:
          nextActive,
      });

      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "카테고리 상태를 변경하지 못했습니다.",
      );
    }
  }


  const isSaving =
    createCategory.isPending ||
    updateCategory.isPending ||
    changeActive.isPending;


  return (
    <div
      className="rate-modal-backdrop"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div
        className="rate-category-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rate-category-modal-title"
      >

        <header className="rate-modal-header">

          <div>
            <h2 id="rate-category-modal-title">
              {isEdit
                ? "카테고리 수정"
                : "카테고리 등록"}
            </h2>

            <p>
              표준단가를 분류할
              카테고리를 관리한다.
            </p>
          </div>


          <button
            type="button"
            className="rate-modal-close"
            onClick={onClose}
            disabled={isSaving}
            aria-label="닫기"
          >
            ×
          </button>

        </header>


        <form
          className="rate-form"
          onSubmit={handleSubmit}
        >

          {errorMessage && (
            <div
              className="rate-form-error"
              role="alert"
            >
              {errorMessage}
            </div>
          )}


          <div className="rate-form-field">

            <label htmlFor="category-name">
              카테고리명 *
            </label>

            <input
              id="category-name"
              type="text"
              maxLength={100}
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value,
                )
              }
              placeholder="예: 회원/인증"
              autoFocus
            />

          </div>


          <div className="rate-form-field">

            <label htmlFor="category-sort-order">
              정렬순서 *
            </label>

            <input
              id="category-sort-order"
              type="number"
              min="0"
              step="1"
              value={sortOrder}
              onChange={(event) =>
                setSortOrder(
                  event.target.value,
                )
              }
            />

            <small>
              숫자가 작은 카테고리를
              먼저 표시한다.
            </small>

          </div>


          {category && (
            <div className="rate-category-current-status">

              <span>
                현재 상태
              </span>

              <strong
                className={
                  category.active
                    ? "rates-status rates-status-active"
                    : "rates-status"
                }
              >
                {category.active
                  ? "사용"
                  : "미사용"}
              </strong>

            </div>
          )}


          <footer className="rate-modal-footer">

            <div>
              {category && (
                <button
                  type="button"
                  className={
                    category.active
                      ? "btn rate-disable-button"
                      : "btn"
                  }
                  onClick={
                    handleChangeActive
                  }
                  disabled={isSaving}
                >
                  {category.active
                    ? "미사용으로 변경"
                    : "사용으로 변경"}
                </button>
              )}
            </div>


            <div className="rate-modal-actions">

              <button
                type="button"
                className="btn"
                onClick={onClose}
                disabled={isSaving}
              >
                취소
              </button>


              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSaving}
              >
                {isSaving
                  ? "저장 중..."
                  : isEdit
                    ? "수정 저장"
                    : "등록"}
              </button>

            </div>

          </footer>

        </form>

      </div>
    </div>
  );
}