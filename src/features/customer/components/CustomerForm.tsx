import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  customerSchema,
  type CustomerFormData,
} from "../schemas/customerSchema";

import type {
  CustomerCreateRequest,
  CustomerDetail,
} from "../types/customer.types";

import "./CustomerForm.css";

type CustomerFormProps = {
  customer?: CustomerDetail;
  submitting?: boolean;
  submitLabel?: string;
  serverError?: string | null;

  onSubmit: (request: CustomerCreateRequest) => void | Promise<void>;
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
      <section className="customer-form-card">
        <div className="customer-form-grid">
          <div className="customer-form-field">
            <label htmlFor="customerName">
              고객명 <span>*</span>
            </label>

            <input
              id="customerName"
              type="text"
              {...register("customerName")}
              disabled={submitting}
            />

            {errors.customerName && (
              <p className="customer-form-error">
                {errors.customerName.message}
              </p>
            )}
          </div>

          <div className="customer-form-field">
            <label htmlFor="companyName">회사명</label>

            <input
              id="companyName"
              type="text"
              {...register("companyName")}
              disabled={submitting}
            />

            {errors.companyName && (
              <p className="customer-form-error">
                {errors.companyName.message}
              </p>
            )}
          </div>

          <div className="customer-form-field">
            <label htmlFor="contactName">담당자명</label>

            <input
              id="contactName"
              type="text"
              {...register("contactName")}
              disabled={submitting}
            />

            {errors.contactName && (
              <p className="customer-form-error">
                {errors.contactName.message}
              </p>
            )}
          </div>

          <div className="customer-form-field">
            <label htmlFor="phone">연락처</label>

            <input
              id="phone"
              type="text"
              placeholder="010-0000-0000"
              {...register("phone")}
              disabled={submitting}
            />

            {errors.phone && (
              <p className="customer-form-error">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div className="customer-form-field">
            <label htmlFor="email">이메일</label>

            <input
              id="email"
              type="email"
              placeholder="example@company.com"
              {...register("email")}
              disabled={submitting}
            />

            {errors.email && (
              <p className="customer-form-error">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="customer-form-field">
            <label htmlFor="businessNumber">
              사업자등록번호
            </label>

            <input
              id="businessNumber"
              type="text"
              placeholder="123-45-67890"
              {...register("businessNumber")}
              disabled={submitting}
            />

            {errors.businessNumber && (
              <p className="customer-form-error">
                {errors.businessNumber.message}
              </p>
            )}
          </div>

          <div className="customer-form-field customer-form-full">
            <label htmlFor="address">주소</label>

            <input
              id="address"
              type="text"
              {...register("address")}
              disabled={submitting}
            />

            {errors.address && (
              <p className="customer-form-error">
                {errors.address.message}
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
            <label htmlFor="memo">메모</label>

            <textarea
              id="memo"
              rows={5}
              {...register("memo")}
              disabled={submitting}
            />
          </div>
        </div>

        {serverError && (
          <div className="customer-form-server-error" role="alert">
            {serverError}
          </div>
        )}
      </section>

      <div className="customer-form-actions">
        <button
          type="button"
          className="btn"
          disabled={submitting}
          onClick={onCancel}
        >
          취소
        </button>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting}
        >
          {submitting ? "저장 중..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

function toNullable(value: string): string | null {
  const trimmed = value.trim();

  return trimmed === "" ? null : trimmed;
}