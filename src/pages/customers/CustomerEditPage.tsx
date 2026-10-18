
import { useState } from "react";
import {
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ArrowLeft,
  AlertCircle,
  LoaderCircle,
  UserRoundPen,
} from "lucide-react";

import { CustomerForm } from "../../features/customer/components/CustomerForm";
import { useCustomer } from "../../features/customer/hooks/useCustomer";
import { useUpdateCustomer } from "../../features/customer/hooks/useUpdateCustomer";

import type { CustomerUpdateRequest } from "../../features/customer/types/customer.types";
import { ROUTES } from "../../app/router/routes";
import { apiErrorMessage } from "../../services/apiClient";

import { Button } from "../../components/ui/Button";

import "./CustomerFormPage.css";

export function CustomerEditPage() {
  const navigate = useNavigate();
  const params = useParams();

  const customerId = Number(params.customerId);

  const [serverError, setServerError] =
    useState<string | null>(null);

  const customerQuery = useCustomer(customerId);
  const updateCustomer = useUpdateCustomer();

  if (
    !Number.isInteger(customerId) ||
    customerId <= 0
  ) {
    return <Navigate to={ROUTES.customers} replace />;
  }

  if (customerQuery.isLoading) {
    return (
      <main className="customer-form-page">
        <div
          className="customer-form-page-state"
          role="status"
        >
          <LoaderCircle
            size={30}
            className="customer-form-page-spin"
            aria-hidden="true"
          />

          <strong>고객 정보를 불러오는 중</strong>
          <p>잠시만 기다려 주세요.</p>
        </div>
      </main>
    );
  }

  if (
    customerQuery.isError ||
    !customerQuery.data
  ) {
    return (
      <main className="customer-form-page">
        <div
          className="customer-form-page-state customer-form-page-state--error"
          role="alert"
        >
          <AlertCircle
            size={32}
            aria-hidden="true"
          />

          <strong>
            고객 정보를 불러오지 못했습니다.
          </strong>

          <p>
            {customerQuery.error instanceof Error
              ? customerQuery.error.message
              : "고객 정보를 확인한 후 다시 시도해 주세요."}
          </p>

          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(ROUTES.customers)}
          >
            고객 목록으로
          </Button>
        </div>
      </main>
    );
  }

  async function handleSubmit(
    request: CustomerUpdateRequest,
  ) {
    setServerError(null);

    try {
      const customer =
        await updateCustomer.mutateAsync({
          customerId,
          request,
        });

      navigate(`${ROUTES.customers}/${customer.id}`, {
        replace: true,
      });
    } catch (error) {
      setServerError(apiErrorMessage(error));
    }
  }

  return (
    <main className="customer-form-page">
      <header className="customer-form-page-header">
        <button
          type="button"
          className="customer-form-page-back"
          onClick={() =>
            navigate(`${ROUTES.customers}/${customerId}`)
          }
          aria-label="고객 상세로 이동"
        >
          <ArrowLeft size={19} aria-hidden="true" />
        </button>

        <div className="customer-form-page-header-content">
          <div className="customer-form-page-heading">
            <div className="customer-form-page-heading-icon">
              <UserRoundPen
                size={21}
                aria-hidden="true"
              />
            </div>

            <div>
              <h1>고객 정보 수정</h1>
              <p>
                등록된 고객 정보를 수정한다.
              </p>
            </div>
          </div>
        </div>
      </header>

      <CustomerForm
        customer={customerQuery.data}
        submitting={updateCustomer.isPending}
        submitLabel="수정 저장"
        serverError={serverError}
        onSubmit={handleSubmit}
        onCancel={() =>
          navigate(`${ROUTES.customers}/${customerId}`)
        }
      />
    </main>
  );
}
