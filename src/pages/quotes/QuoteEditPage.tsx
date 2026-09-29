import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

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

import "../quotes/QuoteCreatePage.css";


type QuoteStep =
  | "BASIC"
  | "ITEMS"
  | "REVIEW";


export function QuoteEditPage() {
  const navigate = useNavigate();

  const { quoteId } = useParams<{
    quoteId: string;
  }>();

  const id = Number(quoteId);

  const quoteQuery = useQuote(id);

  const updateQuote = useUpdateQuote();

  const customersQuery =
    useCustomers({
      active: true,
      page: 0,
      size: 100,
      sort: "customerName,asc",
    });

  const platformsQuery =
    usePlatforms(true);


  const [initialized, setInitialized] =
    useState(false);

  const [step, setStep] =
    useState<QuoteStep>("BASIC");

  const [
    basicValues,
    setBasicValues,
  ] =
    useState<QuoteBasicFormValues | null>(
      null,
    );

  const [
    quoteItems,
    setQuoteItems,
  ] =
    useState<QuoteDraftItem[]>([]);

  const [
    adjustmentAmount,
    setAdjustmentAmount,
  ] =
    useState(0);

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState("");

  const [
    saveError,
    setSaveError,
  ] =
    useState("");


  /*
   * 상세 조회 결과를 편집 State로
   * 최초 한 번만 변환한다.
   */
  useEffect(() => {
    const quote = quoteQuery.data;

    if (!quote || initialized) {
      return;
    }

    setBasicValues({
      customerId:
        quote.customer.id,

      inquiryPlatformId:
        quote.inquiryPlatform?.id ??
        null,

      title:
        quote.title,

      writtenDate:
        quote.writtenDate,

      validUntil:
        quote.validUntil,

      expectedDuration:
        quote.expectedDuration,

      customerNote:
        quote.customerNote,

      internalMemo:
        quote.internalMemo,
    });

    setQuoteItems(
      quote.items
        .slice()
        .sort(
          (a, b) =>
            a.sortOrder -
            b.sortOrder,
        )
        .map((item) => ({
          clientId:
            `quote-item-${item.id}`,

          standardRateId:
            item.standardRateId,

          categoryName:
            item.categoryName,

          featureName:
            item.featureName,

          description:
            item.description,

          quoteUnitPrice:
            item.quoteUnitPrice,

          quantity:
            item.quantity,

          unitName:
            item.unitName,

          difficultyCode:
            item.difficultyCode,

          difficultyRate:
            item.difficultyRate,

          adjustmentAmount:
            item.adjustmentAmount,

          adjustmentReason:
            item.adjustmentReason,

          estimatedHours:
            item.estimatedHours,

          internalMemo:
            item.internalMemo,

          sortOrder:
            item.sortOrder,
        })),
    );

    setAdjustmentAmount(
      quote.adjustmentAmount,
    );

    setInitialized(true);
  }, [
    quoteQuery.data,
    initialized,
  ]);


  const customers =
    useMemo(
      () =>
        customersQuery.data
          ?.content ?? [],
      [customersQuery.data],
    );

  const platforms =
    platformsQuery.data ?? [];


  function handleBasicChange<
    K extends keyof QuoteBasicFormValues,
  >(
    field: K,
    value: QuoteBasicFormValues[K],
  ) {
    setBasicValues(
      (previous) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,
          [field]: value,
        };
      },
    );

    setErrorMessage("");
  }


  function handleBasicNext() {
    if (!basicValues) {
      return;
    }

    const result =
      quoteBasicSchema.safeParse(
        basicValues,
      );

    if (!result.success) {
      setErrorMessage(
        result.error.issues[0]
          ?.message ??
        "기본정보를 확인해주세요.",
      );

      return;
    }

    setErrorMessage("");

    setStep("ITEMS");
  }


  function handleCancel() {
    navigate(
      `${ROUTES.quotes}/${id}`,
    );
  }


  async function handleUpdateQuote() {
    if (!basicValues) {
      return;
    }

    if (quoteItems.length === 0) {
      setSaveError(
        "견적항목을 하나 이상 추가해주세요.",
      );

      setStep("ITEMS");

      return;
    }

    const request:
      QuoteUpdateRequest = {

      customerId:
        basicValues.customerId,

      inquiryPlatformId:
        basicValues.inquiryPlatformId,

      title:
        basicValues.title.trim(),

      writtenDate:
        basicValues.writtenDate,

      validUntil:
        nullableText(
          basicValues.validUntil,
        ),

      expectedDuration:
        nullableText(
          basicValues.expectedDuration,
        ),

      customerNote:
        nullableText(
          basicValues.customerNote,
        ),

      internalMemo:
        nullableText(
          basicValues.internalMemo,
        ),

      adjustmentAmount,

      /*
       * 현재 작성 UI와 동일하게 유지.
       * 정산 입력 UI 추가 시 별도 처리.
       */
      expectedSettlementAmount:
        quoteQuery.data
          ?.expectedSettlementAmount ??
        null,

      expectedSettlementMemo:
        quoteQuery.data
          ?.expectedSettlementMemo ??
        null,

      items:
        quoteItems.map(
          (
            {
              clientId: _clientId,
              ...item
            },
            index,
          ) => ({
            ...item,

            categoryName:
              nullableText(
                item.categoryName,
              ),

            featureName:
              item.featureName.trim(),

            description:
              nullableText(
                item.description,
              ),

            unitName:
              item.unitName.trim(),

            adjustmentReason:
              nullableText(
                item.adjustmentReason,
              ),

            internalMemo:
              nullableText(
                item.internalMemo,
              ),

            sortOrder:
              index + 1,
          }),
        ),

      /*
       * 상세에서 읽어온 직접비는
       * 수정 요청에서도 보존한다.
       */
      directCosts:
        quoteQuery.data?.directCosts.map(
          (cost, index) => ({
            costName:
              cost.costName,

            amount:
              cost.amount,

            memo:
              nullableText(
                cost.memo,
              ),

            sortOrder:
              index + 1,
          }),
        ) ?? [],
    };


    try {
      setSaveError("");

      await updateQuote.mutateAsync({
        quoteId: id,
        request,
      });

      navigate(
        `${ROUTES.quotes}/${id}`,
        {
          replace: true,
        },
      );
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "견적을 수정하지 못했습니다.",
      );
    }
  }


  if (
    !Number.isFinite(id) ||
    id <= 0
  ) {
    return (
      <main className="quote-create-page">
        <section className="quote-create-error">
          잘못된 견적 번호입니다.
        </section>
      </main>
    );
  }


  const loading =
    quoteQuery.isLoading ||
    customersQuery.isLoading ||
    platformsQuery.isLoading;


  if (loading) {
    return (
      <main className="quote-create-page">
        <section className="quote-create-state">
          견적 정보를 불러오고 있습니다.
        </section>
      </main>
    );
  }


  const loadError =
    quoteQuery.isError ||
    customersQuery.isError ||
    platformsQuery.isError;


  if (
    loadError ||
    !quoteQuery.data ||
    !basicValues
  ) {
    return (
      <main className="quote-create-page">
        <section
          className="quote-create-error"
          role="alert"
        >
          견적 수정에 필요한 정보를
          불러오지 못했습니다.
        </section>
      </main>
    );
  }


  /*
   * DRAFT만 수정 가능
   */
  if (
    quoteQuery.data.status !== "DRAFT"
  ) {
    return (
      <main className="quote-create-page">
        <section className="quote-create-error">
          작성중인 견적만 수정할 수 있습니다.
        </section>

        <button
          type="button"
          onClick={handleCancel}
        >
          견적 상세로
        </button>
      </main>
    );
  }


  return (
    <main className="quote-create-page">

      <header className="quote-create-header">
        <div>
          <h1>
            견적 수정
          </h1>

          <p>
            {quoteQuery.data.quoteNumber}
          </p>
        </div>
      </header>


      <nav
        className="quote-create-steps"
        aria-label="견적 수정 단계"
      >
        <Step
          number={1}
          label="기본정보"
          active={
            step === "BASIC"
          }
          completed={
            step !== "BASIC"
          }
        />

        <Step
          number={2}
          label="견적항목"
          active={
            step === "ITEMS"
          }
          completed={
            step === "REVIEW"
          }
        />

        <Step
          number={3}
          label="검토"
          active={
            step === "REVIEW"
          }
          completed={false}
        />
      </nav>


      {step === "BASIC" && (
        <>
          {errorMessage && (
            <div
              className="quote-create-error"
              role="alert"
            >
              {errorMessage}
            </div>
          )}

          <QuoteBasicForm
            values={basicValues}
            customers={customers}
            platforms={platforms}
            onChange={
              handleBasicChange
            }
            onNext={
              handleBasicNext
            }
            onCancel={
              handleCancel
            }
          />
        </>
      )}


      {step === "ITEMS" && (
        <QuoteItemsStep
          items={quoteItems}
          onChange={
            setQuoteItems
          }
          onPrevious={() =>
            setStep("BASIC")
          }
          onNext={() =>
            setStep("REVIEW")
          }
        />
      )}


      {step === "REVIEW" && (
        <QuoteReviewStep
          basic={basicValues}
          items={quoteItems}
          customers={customers}
          platforms={platforms}
          adjustmentAmount={
            adjustmentAmount
          }
          onAdjustmentAmountChange={
            setAdjustmentAmount
          }
          onPrevious={() =>
            setStep("ITEMS")
          }
          onSave={() =>
            void handleUpdateQuote()
          }
          saving={
            updateQuote.isPending
          }
          saveError={
            saveError
          }
        />
      )}

    </main>
  );
}


type StepProps = {
  number: number;
  label: string;
  active: boolean;
  completed: boolean;
};


function Step({
  number,
  label,
  active,
  completed,
}: StepProps) {
  const className = [
    "quote-create-step",

    active
      ? "active"
      : "",

    completed
      ? "completed"
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className}>
      <span className="quote-create-step-number">
        {number}
      </span>

      <span>
        {label}
      </span>
    </div>
  );
}


function nullableText(
  value:
    | string
    | null
    | undefined,
): string | null {
  if (!value) {
    return null;
  }

  const trimmed =
    value.trim();

  return trimmed || null;
}