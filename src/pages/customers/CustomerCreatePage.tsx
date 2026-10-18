
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserRoundPlus } from "lucide-react";

import { CustomerForm } from "../../features/customer/components/CustomerForm";
import { useCreateCustomer } from "../../features/customer/hooks/useCreateCustomer";

import type { CustomerCreateRequest } from "../../features/customer/types/customer.types";
import { ROUTES } from "../../app/router/routes";
import { apiErrorMessage } from "../../services/apiClient";

import "./CustomerFormPage.css";

export function CustomerCreatePage() {
  const navigate = useNavigate();
  const createCustomer = useCreateCustomer();

  const [serverError, setServerError] =
    useState<string | null>(null);

  async function handleSubmit(
    request: CustomerCreateRequest,
  ) {
    setServerError(null);

    try {
      const customer =
        await createCustomer.mutateAsync(request);

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
          onClick={() => navigate(ROUTES.customers)}
          aria-label="고객 목록으로 이동"
        >
          <ArrowLeft size={19} aria-hidden="true" />
        </button>

        <div className="customer-form-page-header-content">
          <div className="customer-form-page-heading">
            <div className="customer-form-page-heading-icon">
              <UserRoundPlus
                size={21}
                aria-hidden="true"
              />
            </div>

            <div>
              <h1>고객 등록</h1>
              <p>
                새로운 고객 또는 업체 정보를 등록한다.
              </p>
            </div>
          </div>
        </div>
      </header>

      <CustomerForm
        submitting={createCustomer.isPending}
        submitLabel="고객 등록"
        serverError={serverError}
        onSubmit={handleSubmit}
        onCancel={() => navigate(ROUTES.customers)}
      />
    </main>
  );
}
