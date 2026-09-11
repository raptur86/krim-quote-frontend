import { useState } from "react";
import {
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";

import { CustomerForm } from "../../features/customer/components/CustomerForm";

import { useCustomer } from "../../features/customer/hooks/useCustomer";
import { useUpdateCustomer } from "../../features/customer/hooks/useUpdateCustomer";

import type { CustomerUpdateRequest } from "../../features/customer/types/customer.types";

import { apiErrorMessage } from "../../services/apiClient";

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
    return <Navigate to="/customers" replace />;
  }

  if (customerQuery.isLoading) {
    return (
      <div className="customer-form-page-state">
        고객 정보를 불러오고 있습니다.
      </div>
    );
  }

  if (
    customerQuery.isError ||
    !customerQuery.data
  ) {
    return (
      <div className="customer-form-page-state">
        <strong>
          고객 정보를 불러오지 못했습니다.
        </strong>

        <button
          type="button"
          className="btn"
          onClick={() => navigate("/customers")}
        >
          고객 목록
        </button>
      </div>
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
          <h1>고객 정보 수정</h1>

          <p>
            등록된 고객 정보를 수정합니다.
          </p>
        </div>
      </div>

      <CustomerForm
        customer={customerQuery.data}
        submitting={updateCustomer.isPending}
        submitLabel="수정 저장"
        serverError={serverError}
        onSubmit={handleSubmit}
        onCancel={() =>
          navigate(`/customers/${customerId}`)
        }
      />
    </div>
  );
}