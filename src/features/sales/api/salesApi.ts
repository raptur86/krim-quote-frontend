import { apiClient } from "../../../shared/api/apiClient";

import type { ApiResponse } from "../../../shared/types/api.types";

import type {
  SalesListItem,
  SalesDetail,
  SalesSaveRequest,
} from "../types/sales.types";

/**
 * 견적별 매출 목록 조회
 * GET /api/v1/quotes/{quoteId}/sales
 */
export async function getQuoteSalesApi(
  quoteId: number,
): Promise<SalesListItem[]> {
  const { data } = await apiClient.get<
    ApiResponse<SalesListItem[]>
  >(`/quotes/${quoteId}/sales`);

  if (!data.success || !data.data) {
    throw new Error(
      data.message || "매출 목록 조회에 실패했습니다.",
    );
  }

  return data.data;
}

/**
 * 매출 등록
 * POST /api/v1/quotes/{quoteId}/sales
 */
export async function createSalesApi(
  quoteId: number,
  request: SalesSaveRequest,
): Promise<SalesDetail> {
  const { data } = await apiClient.post<
    ApiResponse<SalesDetail>
  >(`/quotes/${quoteId}/sales`, request);

  if (!data.success || !data.data) {
    throw new Error(
      data.message || "매출 등록에 실패했습니다.",
    );
  }

  return data.data;
}

/**
 * 매출 상세 조회
 * GET /api/v1/sales/{salesId}
 */
export async function getSalesDetailApi(
  salesId: number,
): Promise<SalesDetail> {
  const { data } = await apiClient.get<
    ApiResponse<SalesDetail>
  >(`/sales/${salesId}`);

  if (!data.success || !data.data) {
    throw new Error(
      data.message || "매출 상세 조회에 실패했습니다.",
    );
  }

  return data.data;
}

/**
 * 매출 수정
 * PUT /api/v1/sales/{salesId}
 */
export async function updateSalesApi(
  salesId: number,
  request: SalesSaveRequest,
): Promise<SalesDetail> {
  const { data } = await apiClient.put<
    ApiResponse<SalesDetail>
  >(`/sales/${salesId}`, request);

  if (!data.success || !data.data) {
    throw new Error(
      data.message || "매출 수정에 실패했습니다.",
    );
  }

  return data.data;
}