import {
  useEffect,
  useState,
} from "react";

import {
  useChangeStandardRateActive,
  useCreateStandardRate,
  useStandardRate,
  useUpdateStandardRate,
} from "../../features/rate/hooks/useStandardRates";

import type {
  RateCategory,
  StandardRateSaveRequest,
} from "../../features/rate/types/rate.types";

type StandardRateModalProps = {
  rateId: number | null;
  categories: RateCategory[];
  onClose: () => void;
};

export function StandardRateModal({
  rateId,
  categories,
  onClose,
}: StandardRateModalProps) {
  const isEdit = rateId !== null;

  const rateQuery =
    useStandardRate(rateId ?? 0);

  const createRate =
    useCreateStandardRate();

  const updateRate =
    useUpdateStandardRate();

  const changeActive =
    useChangeStandardRateActive();

  const [categoryId, setCategoryId] =
    useState<number>(
      categories.find(
        (category) => category.active,
      )?.id ?? 0,
    );

  const [featureName, setFeatureName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [standardPrice, setStandardPrice] =
    useState("");

  const [defaultUnit, setDefaultUnit] =
    useState("건");

  const [defaultHours, setDefaultHours] =
    useState("");

  const [internalMemo, setInternalMemo] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);


  /* =========================================================
     Edit Data
  ========================================================= */

  useEffect(() => {
    if (!isEdit || !rateQuery.data) {
      return;
    }

    const rate = rateQuery.data;

    setCategoryId(rate.category.id);
    setFeatureName(rate.featureName);
    setDescription(
      rate.description ?? "",
    );

    setStandardPrice(
      String(rate.standardPrice),
    );

    setDefaultUnit(
      rate.defaultUnit ?? "",
    );

    setDefaultHours(
      rate.defaultHours == null
        ? ""
        : String(rate.defaultHours),
    );

    setInternalMemo(
      rate.internalMemo ?? "",
    );
  }, [
    isEdit,
    rateQuery.data,
  ]);


  /* =========================================================
     Save
  ========================================================= */

  async function handleSubmit(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    setErrorMessage(null);

    const price =
      Number(standardPrice);

    const hours =
      defaultHours.trim() === ""
        ? null
        : Number(defaultHours);


    if (!categoryId) {
      setErrorMessage(
        "카테고리를 선택해주세요.",
      );
      return;
    }


    if (!featureName.trim()) {
      setErrorMessage(
        "기능명을 입력해주세요.",
      );
      return;
    }


    if (
      standardPrice.trim() === "" ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      setErrorMessage(
        "표준단가를 올바르게 입력해주세요.",
      );
      return;
    }


    if (
      hours !== null &&
      (
        !Number.isFinite(hours) ||
        hours < 0
      )
    ) {
      setErrorMessage(
        "예상시간을 올바르게 입력해주세요.",
      );
      return;
    }


    if (!defaultUnit.trim()) {
      setErrorMessage(
        "기본 단위를 입력해주세요.",
      );
      return;
    }


    const request:
      StandardRateSaveRequest = {
        categoryId,
        featureName:
          featureName.trim(),

        description:
          description.trim() ||
          null,

        standardPrice: price,

        defaultUnit:
          defaultUnit.trim(),

        defaultHours: hours,

        internalMemo:
          internalMemo.trim() ||
          null,
      };


    try {
      if (rateId !== null) {
        await updateRate.mutateAsync({
          rateId,
          request,
        });
      } else {
        await createRate.mutateAsync(
          request,
        );
      }

      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "표준단가를 저장하지 못했습니다.",
      );
    }
  }


  /* =========================================================
     Active
  ========================================================= */

  async function handleChangeActive() {
    if (
      rateId === null ||
      !rateQuery.data
    ) {
      return;
    }

    const nextActive =
      !rateQuery.data.active;

    const message =
      nextActive
        ? "이 표준단가를 다시 사용 상태로 변경할까요?"
        : "이 표준단가를 미사용 상태로 변경할까요?";

    if (!window.confirm(message)) {
      return;
    }

    setErrorMessage(null);

    try {
      await changeActive.mutateAsync({
        rateId,
        active: nextActive,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "상태를 변경하지 못했습니다.",
      );
    }
  }


  const isSaving =
    createRate.isPending ||
    updateRate.isPending ||
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
        className="rate-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rate-modal-title"
      >

        <header className="rate-modal-header">
          <div>
            <h2 id="rate-modal-title">
              {isEdit
                ? "표준단가 수정"
                : "표준단가 등록"}
            </h2>

            <p>
              견적 작성 시 사용할
              기준 단가를 설정한다.
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


        {isEdit &&
          rateQuery.isLoading && (
            <div className="rate-modal-state">
              표준단가 정보를
              불러오고 있습니다.
            </div>
          )}


        {isEdit &&
          rateQuery.isError && (
            <div className="rate-modal-state rates-error">
              표준단가 정보를
              불러오지 못했습니다.
            </div>
          )}


        {(!isEdit ||
          rateQuery.data) && (
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
              <label htmlFor="rate-category">
                카테고리 *
              </label>

              <select
                id="rate-category"
                value={categoryId}
                onChange={(event) =>
                  setCategoryId(
                    Number(
                      event.target.value,
                    ),
                  )
                }
              >
                <option value={0}>
                  카테고리 선택
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                      {!category.active
                        ? " (미사용)"
                        : ""}
                    </option>
                  ),
                )}
              </select>
            </div>


            <div className="rate-form-field">
              <label htmlFor="rate-feature-name">
                기능명 *
              </label>

              <input
                id="rate-feature-name"
                type="text"
                maxLength={200}
                value={featureName}
                onChange={(event) =>
                  setFeatureName(
                    event.target.value,
                  )
                }
                placeholder="예: 이메일 회원가입"
              />
            </div>


            <div className="rate-form-field">
              <label htmlFor="rate-description">
                기능 설명
              </label>

              <textarea
                id="rate-description"
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value,
                  )
                }
                placeholder="기능의 기본 작업 범위를 입력한다."
                rows={3}
              />
            </div>


            <div className="rate-form-grid">

              <div className="rate-form-field">
                <label htmlFor="rate-price">
                  표준단가 *
                </label>

                <div className="rate-input-suffix">
                  <input
                    id="rate-price"
                    type="number"
                    min="0"
                    step="1"
                    value={standardPrice}
                    onChange={(event) =>
                      setStandardPrice(
                        event.target.value,
                      )
                    }
                  />

                  <span>
                    원
                  </span>
                </div>

                <small>
                  VAT 포함 기준 금액
                </small>
              </div>


              <div className="rate-form-field">
                <label htmlFor="rate-unit">
                  기본 단위 *
                </label>

                <input
                  id="rate-unit"
                  type="text"
                  maxLength={50}
                  value={defaultUnit}
                  onChange={(event) =>
                    setDefaultUnit(
                      event.target.value,
                    )
                  }
                  placeholder="건"
                />
              </div>


              <div className="rate-form-field">
                <label htmlFor="rate-hours">
                  예상시간
                </label>

                <div className="rate-input-suffix">
                  <input
                    id="rate-hours"
                    type="number"
                    min="0"
                    step="1"
                    value={defaultHours}
                    onChange={(event) =>
                      setDefaultHours(
                        event.target.value,
                      )
                    }
                  />

                  <span>
                    시간
                  </span>
                </div>
              </div>

            </div>


            <div className="rate-form-field">
              <label htmlFor="rate-internal-memo">
                내부 메모
              </label>

              <textarea
                id="rate-internal-memo"
                value={internalMemo}
                onChange={(event) =>
                  setInternalMemo(
                    event.target.value,
                  )
                }
                placeholder="고객에게 공개되지 않는 내부 참고사항"
                rows={3}
              />
            </div>


            <footer className="rate-modal-footer">

              <div>
                {isEdit &&
                  rateQuery.data && (
                    <button
                      type="button"
                      className={
                        rateQuery.data.active
                          ? "btn rate-disable-button"
                          : "btn"
                      }
                      onClick={
                        handleChangeActive
                      }
                      disabled={isSaving}
                    >
                      {rateQuery.data.active
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
        )}

      </div>
    </div>
  );
}