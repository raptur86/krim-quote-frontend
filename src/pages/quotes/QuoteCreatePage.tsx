
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ClipboardList,
  FileCheck2,
  FilePlus2,
  LoaderCircle,
} from "lucide-react";

import { useCustomers } from "../../features/customer/hooks/useCustomers";
import { usePlatforms } from "../../features/platform/hooks/usePlatforms";

import { QuoteBasicForm } from "../../features/quote/components/QuoteBasicForm";
import { QuoteItemsStep } from "../../features/quote/components/QuoteItemsStep";
import { QuoteReviewStep } from "../../features/quote/components/QuoteReviewStep";

import {
  quoteBasicSchema,
  type QuoteBasicFormValues,
} from "../../features/quote/schemas/quoteBasicSchema";

import type {
  QuoteCreateRequest,
  QuoteDraftItem,
} from "../../features/quote/types/quote.types";

import { useCreateQuote } from "../../features/quote/hooks/useCreateQuote";

import {
  toQuoteItemRequests,
} from "../../features/quote/utils/quoteItemMapper";

import { ROUTES } from "../../app/router/routes";

import "./QuoteCreatePage.css";

type QuoteStep = "BASIC" | "ITEMS" | "REVIEW" | "ISSUE";

const STEPS: {
  key: QuoteStep;
  label: string;
  description: string;
}[] = [
  {
    key: "BASIC",
    label: "기본정보",
    description: "고객 및 견적 정보",
  },
  {
    key: "ITEMS",
    label: "견적항목",
    description: "기능 및 작업 단가",
  },
  {
    key: "REVIEW",
    label: "검토",
    description: "금액 및 내용 확인",
  },
  {
    key: "ISSUE",
    label: "발행",
    description: "견적서 발행",
  },
];

function today(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function QuoteCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialCustomerId =
    Number(searchParams.get("customerId")) || 0;

  const createQuote = useCreateQuote();

  const [saveError, setSaveError] = useState("");
  const [step, setStep] = useState<QuoteStep>("BASIC");
  const [errorMessage, setErrorMessage] = useState("");

  const [basicValues, setBasicValues] =
    useState<QuoteBasicFormValues>({
      customerId: initialCustomerId,
      inquiryPlatformId: null,
      title: "",
      writtenDate: today(),
      validUntil: null,
      expectedDuration: null,
      customerNote: null,
      internalMemo: null,
    });

  const [quoteItems, setQuoteItems] =
    useState<QuoteDraftItem[]>([]);

  const [adjustmentAmount, setAdjustmentAmount] =
    useState(0);

  const customersQuery = useCustomers({
    active: true,
    page: 0,
    size: 100,
    sort: "customerName,asc",
  });

  const platformsQuery = usePlatforms(true);

  const customers = useMemo(
    () => customersQuery.data?.content ?? [],
    [customersQuery.data]
  );

  const platforms = platformsQuery.data ?? [];

  function handleBasicChange<
    K extends keyof QuoteBasicFormValues,
  >(
    field: K,
    value: QuoteBasicFormValues[K]
  ) {
    setBasicValues((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrorMessage("");
  }

  function handleBasicNext() {
    const result = quoteBasicSchema.safeParse(basicValues);

    if (!result.success) {
      setErrorMessage(
        result.error.issues[0]?.message ??
          "기본정보를 확인해주세요."
      );
      return;
    }

    setErrorMessage("");
    setSaveError("");
    setStep("ITEMS");
  }

  function handleCancel() {
    navigate(ROUTES.quotes);
  }

  async function handleCreateQuote() {
    if (createQuote.isPending) {
      return;
    }

    const basicResult =
      quoteBasicSchema.safeParse(basicValues);

    if (!basicResult.success) {
      setErrorMessage(
        basicResult.error.issues[0]?.message ??
          "기본정보를 확인해주세요."
      );
      setStep("BASIC");
      return;
    }

    if (quoteItems.length === 0) {
      setSaveError("견적항목을 하나 이상 추가해주세요.");
      setStep("ITEMS");
      return;
    }

    try {
      setSaveError("");

      /*
       * 패키지 견적 저장 변환
       *
       * - clientId는 서버에 전송하지 않는다.
       * - INCLUDED_FEATURE의 부모 패키지를 찾는다.
       * - parentPackageItemIndex를 계산한다.
       * - 포함 기능의 금액을 0원으로 처리한다.
       * - sortOrder를 최종 배열 순서로 지정한다.
       *
       * 변환 과정에서 오류가 발생하면
       * API 요청을 보내지 않고 catch에서 처리한다.
       */
      const requestItems =
        toQuoteItemRequests(quoteItems);

      const request: QuoteCreateRequest = {
        customerId: basicValues.customerId,
        inquiryPlatformId: basicValues.inquiryPlatformId,
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

        // 기존 정산 요청 구조 유지
        expectedSettlementAmount: null,
        expectedSettlementMemo: null,

        // 패키지 부모 관계를 포함한 견적항목
        items: requestItems,

        // 직접비 입력 UI는 별도 개발 단계에서 구현
        directCosts: [],
      };

      const result =
        await createQuote.mutateAsync(request);

      navigate(`${ROUTES.quotes}/${result.id}`, {
        replace: true,
      });
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "견적을 저장하지 못했습니다."
      );
    }
  }

  const loading =
    customersQuery.isLoading || platformsQuery.isLoading;

  const loadError =
    customersQuery.isError || platformsQuery.isError;

  const currentStepIndex = STEPS.findIndex(
    (item) => item.key === step
  );

  return (
    <main className="quote-create-page">
      <header className="quote-create-header">
        <div className="quote-create-header-main">
          <button
            type="button"
            className="quote-create-back"
            aria-label="견적 목록으로 돌아가기"
            onClick={handleCancel}
          >
            <ArrowLeft size={19} aria-hidden="true" />
          </button>

          <span className="quote-create-header-icon">
            <FilePlus2 size={23} aria-hidden="true" />
          </span>

          <div className="quote-create-header-text">
            <h1>새 견적 작성</h1>
            <p>
              고객 정보부터 견적항목과 금액 검토까지
              단계별로 진행한다.
            </p>
          </div>
        </div>

        <span className="quote-create-progress-label">
          {currentStepIndex + 1} / {STEPS.length} 단계
        </span>
      </header>

      <section
        className="quote-create-progress"
        aria-label="견적 작성 진행 상황"
      >
        <nav
          className="quote-create-steps"
          aria-label="견적 작성 단계"
        >
          {STEPS.map((item, index) => (
            <Step
              key={item.key}
              number={index + 1}
              label={item.label}
              description={item.description}
              active={step === item.key}
              completed={index < currentStepIndex}
            />
          ))}
        </nav>

        <div
          className="quote-create-progress-track"
          aria-hidden="true"
        >
          <div
            className="quote-create-progress-fill"
            style={{
              width: `${
                ((currentStepIndex + 1) / STEPS.length) *
                100
              }%`,
            }}
          />
        </div>
      </section>

      <section
        className="quote-create-content"
        aria-label="견적 작성 내용"
      >
        {loading && (
          <div className="quote-create-state" role="status">
            <LoaderCircle
              size={28}
              className="quote-create-spin"
              aria-hidden="true"
            />
            <strong>기본 정보를 불러오는 중</strong>
            <p>
              고객 및 유입 플랫폼 정보를 확인하고 있다.
            </p>
          </div>
        )}

        {loadError && (
          <div
            className="quote-create-error quote-create-load-error"
            role="alert"
          >
            <AlertCircle size={21} aria-hidden="true" />
            <div>
              <strong>
                견적 작성에 필요한 정보를 불러오지 못했다.
              </strong>
              <p>
                고객 및 플랫폼 조회 상태를 확인한 후
                다시 시도한다.
              </p>
            </div>
          </div>
        )}

        {!loading && !loadError && step === "BASIC" && (
          <>
            <div className="quote-create-section-heading">
              <span className="quote-create-section-icon">
                <ClipboardList
                  size={19}
                  aria-hidden="true"
                />
              </span>
              <div>
                <h2>기본정보 입력</h2>
                <p>
                  견적 대상 고객과 견적서의 기본 내용을
                  입력한다.
                </p>
              </div>
            </div>

            {errorMessage && (
              <div
                className="quote-create-error"
                role="alert"
              >
                <AlertCircle
                  size={18}
                  aria-hidden="true"
                />
                <span>{errorMessage}</span>
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

        {!loading && !loadError && step === "ITEMS" && (
          <>
            <div className="quote-create-section-heading">
              <span className="quote-create-section-icon">
                <ClipboardList
                  size={19}
                  aria-hidden="true"
                />
              </span>
              <div>
                <h2>견적항목 구성</h2>
                <p>
                  개발 기능과 작업 단가를 구성한다.
                </p>
              </div>
            </div>

            {saveError && (
              <div
                className="quote-create-error"
                role="alert"
              >
                <AlertCircle
                  size={18}
                  aria-hidden="true"
                />
                <span>{saveError}</span>
              </div>
            )}

            <QuoteItemsStep
              items={quoteItems}
              onChange={(items) => {
                setQuoteItems(items);
                setSaveError("");
              }}
              onPrevious={() => {
                setSaveError("");
                setStep("BASIC");
              }}
              onNext={() => {
                setSaveError("");
                setStep("REVIEW");
              }}
            />
          </>
        )}

        {!loading && !loadError && step === "REVIEW" && (
          <>
            <div className="quote-create-section-heading">
              <span className="quote-create-section-icon">
                <FileCheck2
                  size={19}
                  aria-hidden="true"
                />
              </span>
              <div>
                <h2>견적 최종 검토</h2>
                <p>
                  견적 내용과 최종 금액을 확인한 후
                  저장한다.
                </p>
              </div>
            </div>

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
              onSave={() => void handleCreateQuote()}
              saving={createQuote.isPending}
              saveError={saveError}
            />
          </>
        )}
      </section>
    </main>
  );
}

type StepProps = {
  number: number;
  label: string;
  description: string;
  active: boolean;
  completed: boolean;
};

function Step({
  number,
  label,
  description,
  active,
  completed,
}: StepProps) {
  const className = [
    "quote-create-step",
    active ? "active" : "",
    completed ? "completed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={className}
      aria-current={active ? "step" : undefined}
    >
      <span className="quote-create-step-number">
        {completed ? (
          <Check size={16} aria-hidden="true" />
        ) : (
          number
        )}
      </span>

      <span className="quote-create-step-copy">
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
    </div>
  );
}

function nullableText(
  value: string | null | undefined
): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed || null;
}
