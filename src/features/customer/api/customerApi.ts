import { apiClient } from "../../../services/apiClient";
import type { ApiResponse } from "../../../types/api.types";

import type {
  CustomerActiveRequest,
  CustomerActiveResponse,
  CustomerCreateRequest,
  CustomerDetail,
  CustomerListParams,
  CustomerPageResponse,
  CustomerUpdateRequest,
} from "../types/customer.types";



/* =========================================================
 * Customer Create
 * ========================================================= */

/**
 * 고객 등록
 *
 * POST /api/v1/customers
 */
export async function createCustomerApi(
  request: CustomerCreateRequest,
): Promise<CustomerDetail> {
  const { data } = await apiClient.post<ApiResponse<CustomerDetail>>(
    "/customers",
    request,
  );

  if (!data.success || !data.data) {
    throw new Error(data.message || "고객 등록에 실패했습니다.");
  }

  return data.data;
}


/* =========================================================
 * Customer List
 * ========================================================= */

/**
 * 고객 목록 조회
 *
 * GET /api/v1/customers
 */
export async function getCustomersApi(
  params?: CustomerListParams,
): Promise<CustomerPageResponse> {
  const { data } = await apiClient.get<ApiResponse<CustomerPageResponse>>(
    "/customers",
    {
      params,
    },
  );

  if (!data.success || !data.data) {
    throw new Error(data.message || "고객 목록을 불러오지 못했습니다.");
  }

  return data.data;
}


/* =========================================================
 * Customer Detail
 * ========================================================= */

/**
 * 고객 상세 조회
 *
 * GET /api/v1/customers/{customerId}
 */
export async function getCustomerApi(
  customerId: number,
): Promise<CustomerDetail> {
  const { data } = await apiClient.get<ApiResponse<CustomerDetail>>(
    `/customers/${customerId}`,
  );

  if (!data.success || !data.data) {
    throw new Error(data.message || "고객 정보를 불러오지 못했습니다.");
  }

  return data.data;
}


/* =========================================================
 * Customer Update
 * ========================================================= */

/**
 * 고객 수정
 *
 * PUT /api/v1/customers/{customerId}
 */
export async function updateCustomerApi(
  customerId: number,
  request: CustomerUpdateRequest,
): Promise<CustomerDetail> {
  const { data } = await apiClient.put<ApiResponse<CustomerDetail>>(
    `/customers/${customerId}`,
    request,
  );

  if (!data.success || !data.data) {
    throw new Error(data.message || "고객 정보 수정에 실패했습니다.");
  }

  return data.data;
}

/* =========================================================
 * Customer Active
 * ========================================================= */

/**
 * 고객 활성 / 비활성 변경
 *
 * PATCH /api/v1/customers/{customerId}/active
 */
export async function changeCustomerActiveApi(
  customerId: number,
  request: CustomerActiveRequest,
): Promise<CustomerActiveResponse> {
  const { data } =
    await apiClient.patch<ApiResponse<CustomerActiveResponse>>(
      `/customers/${customerId}/active`,
      request,
    );

  if (!data.success || !data.data) {
    throw new Error(
      data.message || "고객 상태 변경에 실패했습니다.",
    );
  }

  return data.data;
}