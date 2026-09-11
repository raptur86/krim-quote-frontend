import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useCustomers } from "../../features/customer/hooks/useCustomers";
import { usePlatforms } from "../../features/platform/hooks/usePlatforms";

import { QuoteBasicForm } from "../../features/quote/components/QuoteBasicForm";

import {
  quoteBasicSchema,
  type QuoteBasicFormValues,
} from "../../features/quote/schemas/quoteBasicSchema";

import { ROUTES } from "../../app/router/routes";

import "./QuoteCreatePage.css";


type QuoteStep =
  | "BASIC"
  | "ITEMS"
  | "REVIEW"
  | "ISSUE";


function today(): string {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


export function QuoteCreatePage() {
  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  /*
   * 고객 상세에서:
   *
   * /quotes/new?customerId=15
   *
   * 로 진입할 수 있다.
   */
  const initialCustomerId =
    Number(
      searchParams.get(
        "customerId",
      ),
    ) || 0;


  const [step, setStep] =
    useState<QuoteStep>("BASIC");

  const [errorMessage, setErrorMessage] =
    useState("");


  const [basicValues, setBasicValues] =
    useState<QuoteBasicFormValues>({
      customerId:
        initialCustomerId,

      inquiryPlatformId: null,

      title: "",

      writtenDate: today(),

      validUntil: null,

      expectedDuration: null,

      customerNote: null,

      internalMemo: null,
    });


  /*
   * 신규 견적에서는 활성 고객만 조회
   */
  const customersQuery =
    useCustomers({
      active: true,
      page: 0,
      size: 100,
      sort: "customerName,asc",
    });


  /*
   * 신규 견적에서는 활성 플랫폼만 조회
   */
  const platformsQuery =
    usePlatforms(true);


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
      (previous) => ({
        ...previous,
        [field]: value,
      }),
    );

    setErrorMessage("");
  }


  function handleBasicNext() {
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
      ROUTES.quotes,
    );
  }


  const loading =
    customersQuery.isLoading ||
    platformsQuery.isLoading;


  const loadError =
    customersQuery.isError ||
    platformsQuery.isError;


  return (
    <main className="quote-create-page">

      <header className="quote-create-header">

        <div>
          <h1>
            새 견적 작성
          </h1>

          <p>
            고객에게 전달할 견적을
            작성합니다.
          </p>
        </div>

      </header>


      <nav
        className="quote-create-steps"
        aria-label="견적 작성 단계"
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
            step === "REVIEW" ||
            step === "ISSUE"
          }
        />

        <Step
          number={3}
          label="검토"
          active={
            step === "REVIEW"
          }
          completed={
            step === "ISSUE"
          }
        />

        <Step
          number={4}
          label="발행"
          active={
            step === "ISSUE"
          }
          completed={false}
        />

      </nav>


      {loading && (
        <section className="quote-create-state">
          고객 및 플랫폼 정보를
          불러오고 있습니다.
        </section>
      )}


      {loadError && (
        <section
          className="quote-create-error"
          role="alert"
        >
          견적 작성에 필요한 정보를
          불러오지 못했습니다.
        </section>
      )}


      {!loading &&
        !loadError &&
        step === "BASIC" && (
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
        <section className="quote-create-placeholder">
          <h2>
            견적항목
          </h2>

          <p>
            다음 단계에서
            구현합니다.
          </p>

          <button
            type="button"
            onClick={() =>
              setStep("BASIC")
            }
          >
            ← 이전
          </button>
        </section>
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