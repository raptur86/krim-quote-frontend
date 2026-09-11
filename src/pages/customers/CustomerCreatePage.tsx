import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { CustomerForm } from "../../features/customer/components/CustomerForm";
import { useCreateCustomer } from "../../features/customer/hooks/useCreateCustomer";

import type { CustomerCreateRequest } from "../../features/customer/types/customer.types";

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

      navigate(`/customers/${customer.id}`, {
        replace: true,
      });
    } catch (error) {
      setServerError(apiErrorMessage(error));
    }
  }

  return (
    <div className="customer-form-page">
      <div className="customer-form-page-header">
        <div>
          <h1>고객 등록</h1>

          <p>
            새로운 고객 또는 업체 정보를 등록합니다.
          </p>
        </div>
      </div>

      <CustomerForm
        submitting={createCustomer.isPending}
        submitLabel="고객 등록"
        serverError={serverError}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/customers")}
      />
    </div>
  );
}