
import { useEffect, useState } from "react";
import type { FormEvent, MouseEvent } from "react";
import {
  AlertCircle,
  FolderTree,
  LoaderCircle,
  Power,
  PowerOff,
  Save,
  X,
} from "lucide-react";

import {
  useChangeRateCategoryActive,
  useCreateRateCategory,
  useUpdateRateCategory,
} from "../../features/rate/hooks/useStandardRates";

import type {
  RateCategory,
} from "../../features/rate/types/rate.types";

import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

type RateCategoryModalProps = {
  category: RateCategory | null;
  onClose: () => void;
};

export function RateCategoryModal({
  category,
  onClose,
}: RateCategoryModalProps) {
  const isEdit = category !== null;

  const createCategory = useCreateRateCategory();
  const updateCategory = useUpdateRateCategory();
  const changeActive = useChangeRateCategoryActive();

  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  useEffect(() => {
    if (!category) {
      return;
    }

    setName(category.name);
    setSortOrder(String(category.sortOrder));
  }, [category]);

  const isSaving =
    createCategory.isPending ||
    updateCategory.isPending ||
    changeActive.isPending;

  function handleBackdropMouseDown(
    event: MouseEvent<HTMLDivElement>
  ) {
    if (
      event.target === event.currentTarget &&
      !isSaving
    ) {
      onClose();
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setErrorMessage(null);

    const normalizedName = name.trim();
    const normalizedSortOrder = Number(sortOrder);

    if (!normalizedName) {
      setErrorMessage("카테고리명을 입력해주세요.");
      return;
    }

    if (normalizedName.length > 100) {
      setErrorMessage(
        "카테고리명은 100자 이하로 입력해주세요."
      );
      return;
    }

    if (
      sortOrder.trim() === "" ||
      !Number.isInteger(normalizedSortOrder) ||
      normalizedSortOrder < 0
    ) {
      setErrorMessage(
        "정렬순서는 0 이상의 정수로 입력해주세요."
      );
      return;
    }

    try {
      if (category) {
        await updateCategory.mutateAsync({
          categoryId: category.id,
          request: {
            name: normalizedName,
            sortOrder: normalizedSortOrder,
          },
        });
      } else {
        await createCategory.mutateAsync({
          name: normalizedName,
          sortOrder: normalizedSortOrder,
        });
      }

      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "카테고리를 저장하지 못했습니다."
      );
    }
  }

  async function handleChangeActive() {
    if (!category) {
      return;
    }

    const nextActive = !category.active;

    const confirmed = window.confirm(
      nextActive
        ? `"${category.name}" 카테고리를 다시 사용하시겠습니까?`
        : `"${category.name}" 카테고리를 미사용으로 변경하시겠습니까?`
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage(null);

    try {
      await changeActive.mutateAsync({
        categoryId: category.id,
        active: nextActive,
      });

      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "카테고리 상태를 변경하지 못했습니다."
      );
    }
  }

  return (
    <div
      className="rate-modal-backdrop"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        className="rate-category-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rate-category-modal-title"
      >
        <header className="rate-modal-header">
          <div className="rate-modal-heading">
            <span className="rate-modal-heading-icon">
              <FolderTree
                size={21}
                aria-hidden="true"
              />
            </span>

            <div>
              <h2 id="rate-category-modal-title">
                {isEdit
                  ? "카테고리 수정"
                  : "카테고리 등록"}
              </h2>
              <p>
                표준단가를 분류할 카테고리를 관리한다.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="rate-modal-close"
            onClick={onClose}
            disabled={isSaving}
            aria-label="닫기"
          >
            <X size={20} aria-hidden="true" />
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
              <AlertCircle
                size={17}
                aria-hidden="true"
              />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="rate-form-field">
            <label htmlFor="category-name">
              카테고리명 <em>*</em>
            </label>
            <input
              id="category-name"
              type="text"
              maxLength={100}
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="예 : 회원/인증"
              autoFocus
            />
          </div>

          <div className="rate-form-field">
            <label htmlFor="category-sort-order">
              정렬순서 <em>*</em>
            </label>
            <input
              id="category-sort-order"
              type="number"
              min="0"
              step="1"
              value={sortOrder}
              onChange={(event) =>
                setSortOrder(event.target.value)
              }
            />
            <small>
              숫자가 작은 카테고리를 먼저 표시한다.
            </small>
          </div>

          {category && (
            <div className="rate-category-current-status">
              <span>현재 상태</span>
              <Badge
                variant={
                  category.active
                    ? "success"
                    : "neutral"
                }
              >
                {category.active ? "사용" : "미사용"}
              </Badge>
            </div>
          )}

          <footer className="rate-modal-footer">
            <div className="rate-modal-status-action">
              {category && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSaving}
                  onClick={handleChangeActive}
                >
                  {category.active ? (
                    <PowerOff
                      size={16}
                      aria-hidden="true"
                    />
                  ) : (
                    <Power
                      size={16}
                      aria-hidden="true"
                    />
                  )}
                  {category.active
                    ? "미사용으로 변경"
                    : "사용으로 변경"}
                </Button>
              )}
            </div>

            <div className="rate-modal-actions">
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={onClose}
              >
                취소
              </Button>

              <Button
                type="submit"
                variant="primary"
                disabled={isSaving}
              >
                {isSaving ? (
                  <LoaderCircle
                    size={16}
                    className="rates-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Save
                    size={16}
                    aria-hidden="true"
                  />
                )}
                {isSaving
                  ? "처리 중..."
                  : isEdit
                    ? "수정 저장"
                    : "등록"}
              </Button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
}
