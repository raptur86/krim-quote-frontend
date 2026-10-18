
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  Building2,
  FileText,
  Save,
  UserRound,
} from "lucide-react";

import {
  customerSchema,
  type CustomerFormData,
} from "../schemas/customerSchema";

import type {
  CustomerCreateRequest,
  CustomerDetail,
} from "../types/customer.types";

import { Button } from "../../../components/ui/Button";

import "./CustomerForm.css";

type CustomerFormProps = {
  customer?: CustomerDetail;
  submitting?: boolean;
  submitLabel?: string;
  serverError?: string | null;

  onSubmit: (
    request: CustomerCreateRequest
  ) => void | Promise<void>;

  onCancel: () => void;
};

export function CustomerForm({
  customer,
  submitting = false,
  submitLabel = "저장",
  serverError,
  onSubmit,
  onCancel,
}: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),

    defaultValues: {
      customerName: customer?.customerName ?? "",
      companyName: customer?.companyName ?? "",
      contactName: customer?.contactName ?? "",
      phone: customer?.phone ?? "",
      email: customer?.email ?? "",
      businessNumber: customer?.businessNumber ?? "",
      address: customer?.address ?? "",
      initialSource: customer?.initialSource ?? "",
      memo: customer?.memo ?? "",
    },
  });

  async function submit(form: CustomerFormData) {
    const request: CustomerCreateRequest = {
      customerName: form.customerName.trim(),
      companyName: toNullable(form.companyName),
      contactName: toNullable(form.contactName),
      phone: toNullable(form.phone),
      email: toNullable(form.email),
      businessNumber: toNullable(form.businessNumber),
      address: toNullable(form.address),
      initialSource: toNullable(form.initialSource),
      memo: toNullable(form.memo),
    };

    await onSubmit(request);
  }

  return (
    <form
      className="customer-form"
      onSubmit={handleSubmit(submit)}
      noValidate
    >
      {/* 기본 정보 */}
      <section
        className="customer-form-card"
        aria-labelledby="customer-basic-title"
      >
        <div className="customer-form-section-header">
          <div className="customer-form-section-icon">
            <UserRound size={19} aria-hidden="true" />
          </div>

          <div>
            <h2 id="customer-basic-title">
              기본 정보
            </h2>
            <p>
              고객 및 담당자의 기본 정보를 입력한다.
            </p>
          </div>
        </div>

        <div className="customer-form-grid">
          <div className="customer-form-field">
            <label htmlFor="customerName">
              고객명
              <span className="customer-form-required">
                *
              </span>
            </label>

            <input
              id="customerName"
              type="text"
              placeholder="고객명 입력"
              aria-required="true"
              aria-invalid={Boolean(errors.customerName)}
              aria-describedby={
                errors.customerName
                  ? "customerName-error"
                  : undefined
              }
              {...register("customerName")}
              disabled={submitting}
            />

            {errors.customerName && (
              <p
                id="customerName-error"
                className="customer-form-error"
                role="alert"
              >
                {errors.customerName.message}
              </p>
            )}
          </div>

          <div className="customer-form-field">
            <label htmlFor="companyName">
              회사명
            </label>

            <input
              id="companyName"
              type="text"
              placeholder="회사명 입력"
              aria-invalid={Boolean(errors.companyName)}
              aria-describedby={
                errors.companyName
                  ? "companyName-error"
                  : undefined
              }
              {...register("companyName")}
              disabled={submitting}
            />

            {errors.companyName && (
              <p
                id="companyName-error"
                className="customer-form-error"
                role="alert"
              >
                {errors.companyName.message}
              </p>
            )}
          </div>

          <div className="customer-form-field">
            <label htmlFor="contactName">
              담당자명
            </label>

            <input
              id="contactName"
              type="text"
              placeholder="담당자명 입력"
              aria-invalid={Boolean(errors.contactName)}
              aria-describedby={
                errors.contactName
                  ? "contactName-error"
                  : undefined
              }
              {...register("contactName")}
              disabled={submitting}
            />

            {errors.contactName && (
              <p
                id="contactName-error"
                className="customer-form-error"
                role="alert"
              >
                {errors.contactName.message}
              </p>
            )}
          </div>

          <div className="customer-form-field">
            <label htmlFor="phone">
              연락처
            </label>

            <input
              id="phone"
              type="text"
              placeholder="010-0000-0000"
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={
                errors.phone
                  ? "phone-error"
                  : undefined
              }
              {...register("phone")}
              disabled={submitting}
            />

            {errors.phone && (
              <p
                id="phone-error"
                className="customer-form-error"
                role="alert"
              >
                {errors.phone.message}
              </p>
            )}
          </div>

          <div className="customer-form-field">
            <label htmlFor="email">
              이메일
            </label>

            <input
              id="email"
              type="email"
              placeholder="example@company.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={
                errors.email
                  ? "email-error"
                  : undefined
              }
              {...register("email")}
              disabled={submitting}
            />

            {errors.email && (
              <p
                id="email-error"
                className="customer-form-error"
                role="alert"
              >
                {errors.email.message}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 사업자 및 유입 정보 */}
      <section
        className="customer-form-card"
        aria-labelledby="customer-business-title"
      >
        <div className="customer-form-section-header">
          <div className="customer-form-section-icon">
            <Building2 size={19} aria-hidden="true" />
          </div>

          <div>
            <h2 id="customer-business-title">
              사업자 및 유입 정보
            </h2>
            <p>
              사업자 정보와 고객 유입경로를 관리한다.
            </p>
          </div>
        </div>

        <div className="customer-form-grid">
          <div className="customer-form-field">
            <label htmlFor="businessNumber">
              사업자등록번호
            </label>

            <input
              id="businessNumber"
              type="text"
              placeholder="123-45-67890"
              aria-invalid={Boolean(errors.businessNumber)}
              aria-describedby={
                errors.businessNumber
                  ? "businessNumber-error"
                  : undefined
              }
              {...register("businessNumber")}
              disabled={submitting}
            />

            {errors.businessNumber && (
              <p
                id="businessNumber-error"
                className="customer-form-error"
                role="alert"
              >
                {errors.businessNumber.message}
              </p>
            )}
          </div>

          <div className="customer-form-field">
            <label htmlFor="initialSource">
              유입경로
            </label>

            <select
              id="initialSource"
              {...register("initialSource")}
              disabled={submitting}
            >
              <option value="">선택</option>
              <option value="크몽">크몽</option>
              <option value="위시켓">위시켓</option>
              <option value="이랜서">이랜서</option>
              <option value="직접">직접</option>
            </select>
          </div>

          <div className="customer-form-field customer-form-full">
            <label htmlFor="address">
              주소
            </label>

            <input
              id="address"
              type="text"
              placeholder="주소 입력"
              aria-invalid={Boolean(errors.address)}
              aria-describedby={
                errors.address
                  ? "address-error"
                  : undefined
              }
              {...register("address")}
              disabled={submitting}
            />

            {errors.address && (
              <p
                id="address-error"
                className="customer-form-error"
                role="alert"
              >
                {errors.address.message}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 메모 */}
      <section
        className="customer-form-card"
        aria-labelledby="customer-memo-title"
      >
        <div className="customer-form-section-header">
          <div className="customer-form-section-icon">
            <FileText size={19} aria-hidden="true" />
          </div>

          <div>
            <h2 id="customer-memo-title">
              메모
            </h2>
            <p>
              고객과 관련된 추가 정보를 기록한다.
            </p>
          </div>
        </div>

        <div className="customer-form-field">
          <label htmlFor="memo">
            고객 메모
          </label>

          <textarea
            id="memo"
            rows={5}
            placeholder="고객 관련 메모를 입력한다."
            aria-invalid={Boolean(errors.memo)}
            aria-describedby={
              errors.memo
                ? "memo-error"
                : undefined
            }
            {...register("memo")}
            disabled={submitting}
          />

          {errors.memo && (
            <p
              id="memo-error"
              className="customer-form-error"
              role="alert"
            >
              {errors.memo.message}
            </p>
          )}
        </div>
      </section>

      {/* 서버 오류 */}
      {serverError && (
        <div
          className="customer-form-server-error"
          role="alert"
        >
          <AlertCircle
            size={18}
            aria-hidden="true"
          />
          <span>{serverError}</span>
        </div>
      )}

      {/* 하단 버튼 */}
      <div className="customer-form-actions">
        <Button
          type="button"
          variant="outline"
          disabled={submitting}
          onClick={onCancel}
        >
          취소
        </Button>

        <Button
          type="submit"
          variant="primary"
          disabled={submitting}
          loading={submitting}
        >
          <Save size={17} aria-hidden="true" />
          {submitting ? "저장 중..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

function toNullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}
