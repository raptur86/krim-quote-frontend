
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ClipboardList,
  FilePenLine,
  FileText,
  GitBranch,
  ExternalLink,
  LoaderCircle,
  Pencil,
  ReceiptText,
} from "lucide-react";

import { ROUTES } from "../../app/router/routes";

import { useCustomers } from "../../features/customer/hooks/useCustomers";
import { usePlatforms } from "../../features/platform/hooks/usePlatforms";
import { useQuote } from "../../features/quote/hooks/useQuote";
import { useUpdateQuote } from "../../features/quote/hooks/UseUpdateQuote";

import { QuoteBasicForm } from "../../features/quote/components/QuoteBasicForm";
import { QuoteItemsStep } from "../../features/quote/components/QuoteItemsStep";
import { QuoteReviewStep } from "../../features/quote/components/QuoteReviewStep";

import {
  quoteBasicSchema,
  type QuoteBasicFormValues,
} from "../../features/quote/schemas/quoteBasicSchema";

import type {
  QuoteDraftItem,
  QuoteUpdateRequest,
} from "../../features/quote/types/quote.types";

import {
  toQuoteDraftItems,
  toQuoteItemRequests,
} from "../../features/quote/utils/quoteItemMapper";

import { Button } from "../../components/ui/Button";

import "../quotes/QuoteCreatePage.css";

type QuoteStep = "BASIC" | "ITEMS" | "REVIEW";

const steps: {
  key: QuoteStep;
  number: number;
  label: string;
  description: string;
}[] = [
  {
    key: "BASIC",
    number: 1,
    label: "기본정보",
    description: "고객 및 견적정보",
  },
  {
    key: "ITEMS",
    number: 2,
    label: "견적항목",
    description: "기능 및 산정금액",
  },
  {
    key: "REVIEW",
    number: 3,
    label: "최종 검토",
    description: "금액 확인 및 저장",
  },
];

export function QuoteEditPage() {
  const navigate = useNavigate();
  const { quoteId } = useParams<{ quoteId: string }>();

  const id = Number(quoteId);

  const quoteQuery = useQuote(id);
  const updateQuote = useUpdateQuote();

  const customersQuery = useCustomers({
    active: true,
    page: 0,
    size: 100,
    sort: "customerName,asc",
  });

  const platformsQuery = usePlatforms(true);

  const [initializedQuoteId, setInitializedQuoteId] =
    useState<number | null>(null);

  const [step, setStep] = useState<QuoteStep>("BASIC");

  const [basicValues, setBasicValues] =
    useState<QuoteBasicFormValues | null>(null);

  const [quoteItems, setQuoteItems] =
    useState<QuoteDraftItem[]>([]);

  const [adjustmentAmount, setAdjustmentAmount] =
    useState(0);

  const [errorMessage, setErrorMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  /*
   * 패키지 견적 지원
   *
   * 상세 조회 응답의 parentPackageItemId를
   * 프론트엔드 전용 parentPackageClientId로 복원한다.
   *
   * 동일 견적에서는 최초 한 번만 초기화하여
   * 사용자가 수정 중인 값을 유지한다.
   */
  useEffect(() => {
    const quote = quoteQuery.data;

    if (
      !quote ||
      quote.id === initializedQuoteId ||
      quote.status !== "DRAFT"
    ) {
      return;
    }

    /*
     * 패키지 부모 관계가 잘못된 경우
     * 변환 오류를 사용자에게 표시한다.
     */
    let restoredItems: QuoteDraftItem[];

    try {
      restoredItems = toQuoteDraftItems(quote.items);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "기존 견적항목을 복원하지 못했습니다."
      );
      return;
    }

    setBasicValues({
      customerId: quote.customer.id,
      inquiryPlatformId:
        quote.inquiryPlatform?.id ?? null,
      title: quote.title,
      writtenDate: quote.writtenDate,
      validUntil: quote.validUntil,
      expectedDuration: quote.expectedDuration,
      customerNote: quote.customerNote,
      internalMemo: quote.internalMemo,
    });

    setQuoteItems(restoredItems);
    setAdjustmentAmount(quote.adjustmentAmount);

    setStep("BASIC");
    setErrorMessage("");
    setSaveError("");

    setInitializedQuoteId(quote.id);
  }, [quoteQuery.data, initializedQuoteId]);

  const customers = useMemo(
    () => customersQuery.data?.content ?? [],
    [customersQuery.data]
  );

  const platforms = platformsQuery.data ?? [];

  const currentStepIndex = steps.findIndex(
    (item) => item.key === step
  );

  const progressPercent =
    ((currentStepIndex + 1) / steps.length) * 100;

  function handleBasicChange<
    K extends keyof QuoteBasicFormValues,
  >(
    field: K,
    value: QuoteBasicFormValues[K]
  ) {
    setBasicValues((previous) => {
      if (!previous) {
        return previous;
      }

      return {
        ...previous,
        [field]: value,
      };
    });

    setErrorMessage("");
    setSaveError("");
  }

  function handleBasicNext() {
    if (!basicValues) {
      return;
    }

    const result = quoteBasicSchema.safeParse(
      basicValues
    );

    if (!result.success) {
      setErrorMessage(
        result.error.issues[0]?.message ??
          "기본정보를 확인해주세요."
      );
      return;
    }

    setErrorMessage("");
    setStep("ITEMS");
  }

  function handleItemsNext() {
    setSaveError("");
    setStep("REVIEW");
  }

  function handleCancel() {
    navigate(`${ROUTES.quotes}/${id}`);
  }

  async function handleUpdateQuote() {
    if (
      !basicValues ||
      updateQuote.isPending ||
      quoteQuery.data?.status !== "DRAFT" ||
      initializedQuoteId !== id
    ) {
      return;
    }

    const basicResult = quoteBasicSchema.safeParse(
      basicValues
    );

    if (!basicResult.success) {
      setErrorMessage(
        basicResult.error.issues[0]?.message ??
          "기본정보를 확인해주세요."
      );
      setStep("BASIC");
      return;
    }

    if (quoteItems.length === 0) {
      setSaveError(
        "견적항목을 하나 이상 추가해주세요."
      );
      setStep("ITEMS");
      return;
    }

    /*
     * 패키지 견적 지원
     *
     * 항목 순서를 기준으로 부모 패키지의
     * zero-based 배열 인덱스를 계산한다.
     *
     * clientId, parentPackageClientId는
     * 서버 요청에 포함하지 않는다.
     *
     * 변환 및 API 요청 오류를 모두
     * catch에서 처리한다.
     */
    try {
      setSaveError("");

      const requestItems =
        toQuoteItemRequests(quoteItems);

      const request: QuoteUpdateRequest = {
        customerId: basicValues.customerId,

        inquiryPlatformId:
          basicValues.inquiryPlatformId,

        title: basicValues.title.trim(),
        writtenDate: basicValues.writtenDate,

        validUntil: nullableText(
          basicValues.validUntil
        ),

        expectedDuration: nullableText(
          basicValues.expectedDuration
        ),

        customerNote: nullableText(
          basicValues.customerNote
        ),

        internalMemo: nullableText(
          basicValues.internalMemo
        ),

        adjustmentAmount,

        /*
         * 정산정보 입력 UI는 현재 단계에서 변경하지 않는다.
         * 기존 상세 데이터의 값을 그대로 보존한다.
         */
        expectedSettlementAmount:
          quoteQuery.data?.expectedSettlementAmount ??
          null,

        expectedSettlementMemo:
          quoteQuery.data?.expectedSettlementMemo ??
          null,

        /*
         * PACKAGE / FEATURE / INCLUDED_FEATURE /
         * ADDITIONAL_FEATURE를 포함한 저장 항목.
         */
        items: requestItems,

        /*
         * 기존 직접비는 편집 UI에 없으므로
         * 수정 요청에서도 보존한다.
         */
        directCosts:
          quoteQuery.data?.directCosts.map(
            (cost, index) => ({
              costName: cost.costName,
              amount: cost.amount,
              memo: nullableText(cost.memo),
              sortOrder: index + 1,
            })
          ) ?? [],
      };

      /*
       * originalQuoteId, sourceQuoteId, revisionNo는
       * 백엔드에서 관리하는 개정 관계 정보이다.
       *
       * QuoteUpdateRequest에 포함하지 않는다.
       */
      await updateQuote.mutateAsync({
        quoteId: id,
        request,
      });

      navigate(
        `${ROUTES.quotes}/${id}`,
        { replace: true }
      );
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "견적을 수정하지 못했습니다."
      );
    }
  }

  if (
    !quoteId ||
    !Number.isSafeInteger(id) ||
    id <= 0
  ) {
    return (
      <EditState
        type="error"
        title="잘못된 견적 번호입니다."
        description="견적 번호를 확인한 후 다시 접근해주세요."
        onBack={() => navigate(ROUTES.quotes)}
        backLabel="견적 목록으로"
      />
    );
  }

  const loading =
    quoteQuery.isLoading ||
    customersQuery.isLoading ||
    platformsQuery.isLoading;

  if (loading) {
    return (
      <EditState
        type="loading"
        title="견적 정보를 불러오는 중"
        description="기존 견적과 관련 정보를 준비하고 있습니다."
      />
    );
  }

  const loadError =
    quoteQuery.isError ||
    customersQuery.isError ||
    platformsQuery.isError;

  if (loadError || !quoteQuery.data) {
    return (
      <EditState
        type="error"
        title="견적 정보를 불러오지 못했습니다."
        description="견적 수정에 필요한 데이터를 조회할 수 없습니다."
        onBack={handleCancel}
        backLabel="견적 상세로"
      />
    );
  }

  if (quoteQuery.data.status !== "DRAFT") {
    return (
      <EditState
        type="error"
        title="수정할 수 없는 견적입니다."
        description="작성 중(DRAFT) 상태인 견적만 수정할 수 있습니다."
        onBack={handleCancel}
        backLabel="견적 상세로"
      />
    );
  }

  if (!basicValues || initializedQuoteId !== id) {
    return (
      <EditState
        type={errorMessage ? "error" : "loading"}
        title={
          errorMessage
            ? "견적항목 복원 오류"
            : "편집 정보를 준비하는 중"
        }
        description={
          errorMessage ||
          "기존 견적항목을 편집 화면으로 변환하고 있습니다."
        }
        onBack={
          errorMessage ? handleCancel : undefined
        }
        backLabel="견적 상세로"
      />
    );
  }

  const quote = quoteQuery.data;
  const isRevision = quote.revisionNo > 0;

  return (
    <main className="quote-create-page">
      {/* =========================================
          Header
      ========================================= */}

      <header className="quote-create-header">
        <div className="quote-create-header-info">
          <div className="quote-create-header-meta">
            <span className="quote-create-header-icon">
              <FilePenLine
                size={18}
                aria-hidden="true"
              />
            </span>

            <span className="quote-create-header-label">
              KRIM QUOTE
            </span>

            <span className="quote-create-header-badge">
              견적 수정
            </span>

            <span className="quote-edit-revision-badge">
              <GitBranch
                size={14}
                aria-hidden="true"
              />

              {isRevision
                ? `${quote.revisionNo}차 개정`
                : "원본 견적"}
            </span>
          </div>

          <h1>
            {isRevision
              ? `${quote.revisionNo}차 개정 견적 수정`
              : "견적 수정"}
          </h1>

          <p>
            기존 견적의 기본정보와 항목을 수정하고
            최종 금액을 검토한다.
          </p>

          <div className="quote-create-header-details">
            <span>
              <FileText
                size={15}
                aria-hidden="true"
              />

              {quote.quoteNumber ||
                "견적번호 미발행"}
            </span>

            <span>
              <Pencil
                size={15}
                aria-hidden="true"
              />
              작성 중 견적
            </span>
          </div>
        </div>

        <div className="quote-create-header-actions">
          <Button
            type="button"
            variant="outline"
            disabled={updateQuote.isPending}
            onClick={handleCancel}
          >
            <ArrowLeft
              size={16}
              aria-hidden="true"
            />
            견적 상세로
          </Button>
        </div>
      </header>

      {/* =========================================
          v1.2 - Revision Lineage
      ========================================= */}

      {isRevision && (
        <section
          className="quote-edit-lineage"
          aria-label="견적 개정 정보"
        >
          <div className="quote-edit-lineage-heading">
            <GitBranch
              size={19}
              aria-hidden="true"
            />

            <div>
              <strong>
                {quote.revisionNo}차 개정 견적
              </strong>

              <p>
                원본 견적은 변경되지 않으며,
                현재 개정본만 수정한다.
              </p>
            </div>
          </div>

          <div className="quote-edit-lineage-links">
            {quote.originalQuoteId != null && (
              <Button
                type="button"
                variant="outline"
                disabled={updateQuote.isPending}
                onClick={() =>
                  navigate(
                    `${ROUTES.quotes}/${quote.originalQuoteId}`
                  )
                }
              >
                <ExternalLink
                  size={15}
                  aria-hidden="true"
                />
                최초 견적 보기
              </Button>
            )}

            {quote.sourceQuoteId != null && (
              <Button
                type="button"
                variant="outline"
                disabled={updateQuote.isPending}
                onClick={() =>
                  navigate(
                    `${ROUTES.quotes}/${quote.sourceQuoteId}`
                  )
                }
              >
                <ExternalLink
                  size={15}
                  aria-hidden="true"
                />
                직전 견적 보기
              </Button>
            )}
          </div>
        </section>
      )}

      {/* =========================================
          Progress
      ========================================= */}

      <section
        className="quote-create-progress"
        aria-label="견적 수정 진행률"
      >
        <div className="quote-create-progress-top">
          <div>
            <span className="quote-create-progress-eyebrow">
              QUOTE EDIT PROGRESS
            </span>

            <strong>
              {steps[currentStepIndex].label}
            </strong>
          </div>

          <span className="quote-create-progress-count">
            {currentStepIndex + 1} / {steps.length}
          </span>
        </div>

        <div
          className="quote-create-progress-track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={steps.length}
          aria-valuenow={currentStepIndex + 1}
          aria-label="견적 수정 진행 단계"
        >
          <div
            className="quote-create-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </section>

      {/* =========================================
          Step Navigation
      ========================================= */}

      <nav
        className="quote-create-steps"
        aria-label="견적 수정 단계"
      >
        {steps.map((item, index) => (
          <div
            key={item.key}
            className={[
              "quote-create-step",
              step === item.key ? "active" : "",
              index < currentStepIndex
                ? "completed"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-current={
              step === item.key ? "step" : undefined
            }
          >
            <span className="quote-create-step-number">
              {index < currentStepIndex ? (
                <Check
                  size={15}
                  aria-hidden="true"
                />
              ) : (
                item.number
              )}
            </span>

            <span className="quote-create-step-content">
              <strong>{item.label}</strong>
              <small>{item.description}</small>
            </span>
          </div>
        ))}
      </nav>

      {/* =========================================
          Edit Content
      ========================================= */}

      <section className="quote-create-content">
        <div className="quote-create-section-heading">
          <div className="quote-create-section-heading-icon">
            {step === "BASIC" ? (
              <ClipboardList
                size={20}
                aria-hidden="true"
              />
            ) : step === "ITEMS" ? (
              <ReceiptText
                size={20}
                aria-hidden="true"
              />
            ) : (
              <CheckCircle2
                size={20}
                aria-hidden="true"
              />
            )}
          </div>

          <div>
            <h2>
              {step === "BASIC"
                ? "견적 기본정보 수정"
                : step === "ITEMS"
                  ? "견적항목 수정"
                  : "수정 내용 최종 검토"}
            </h2>

            <p>
              {step === "BASIC"
                ? "고객, 작성일, 예상 기간 및 메모를 확인한다."
                : step === "ITEMS"
                  ? "기능별 견적항목과 단가, 수량 및 난이도를 수정한다."
                  : "수정된 견적금액을 확인한 후 저장한다."}
            </p>
          </div>
        </div>

        {/* =========================================
            Step 1 - Basic Information
        ========================================= */}

        {step === "BASIC" && (
          <>
            {errorMessage && (
              <div
                className="quote-create-error"
                role="alert"
              >
                <AlertCircle
                  size={18}
                  aria-hidden="true"
                />
                {errorMessage}
              </div>
            )}

            <QuoteBasicForm
              values={basicValues}
              customers={customers}
              platforms={platforms}
              onChange={handleBasicChange}
              onNext={handleBasicNext}
              onCancel={handleCancel}
            />
          </>
        )}

        {/* =========================================
            Step 2 - Quote Items
        ========================================= */}

        {step === "ITEMS" && (
          <>
            {saveError && (
              <div
                className="quote-create-error"
                role="alert"
              >
                <AlertCircle
                  size={18}
                  aria-hidden="true"
                />
                {saveError}
              </div>
            )}

            <QuoteItemsStep
              items={quoteItems}
              onChange={(items) => {
                setQuoteItems(items);
                setSaveError("");
              }}
              onPrevious={() => setStep("BASIC")}
              onNext={handleItemsNext}
            />
          </>
        )}

        {/* =========================================
            Step 3 - Review
        ========================================= */}

        {step === "REVIEW" && (
          <QuoteReviewStep
            basic={basicValues}
            items={quoteItems}
            customers={customers}
            platforms={platforms}
            adjustmentAmount={adjustmentAmount}
            onAdjustmentAmountChange={
              setAdjustmentAmount
            }
            onPrevious={() => setStep("ITEMS")}
            onSave={() => {
              void handleUpdateQuote();
            }}
            saving={updateQuote.isPending}
            saveError={saveError}
          />
        )}
      </section>
    </main>
  );
}

/* =========================================
   Loading / Error State
========================================= */

type EditStateProps = {
  type: "loading" | "error";
  title: string;
  description: string;
  onBack?: () => void;
  backLabel?: string;
};

function EditState({
  type,
  title,
  description,
  onBack,
  backLabel = "돌아가기",
}: EditStateProps) {
  return (
    <main className="quote-create-page">
      <section
        className={
          type === "error"
            ? "quote-create-error"
            : "quote-create-state"
        }
        role={type === "error" ? "alert" : "status"}
      >
        {type === "loading" ? (
          <LoaderCircle
            size={25}
            aria-hidden="true"
          />
        ) : (
          <AlertCircle
            size={25}
            aria-hidden="true"
          />
        )}

        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>

        {onBack && (
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
          >
            <ArrowLeft
              size={16}
              aria-hidden="true"
            />
            {backLabel}
          </Button>
        )}
      </section>
    </main>
  );
}

/* =========================================
   Utilities
========================================= */

function nullableText(
  value: string | null | undefined
): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed || null;
}
