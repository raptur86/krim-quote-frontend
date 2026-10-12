import { apiClient } from "../../../shared/api/apiClient";
import type { ApiResponse } from "../../../shared/types/api.types";
import type { SalesListItem } from "../types/sales.types";

/** 전체 매출 목록의 추가 필드. 백엔드 응답 DTO와 반드시 일치시킨다. */
export type AllSalesListItem = SalesListItem & {
  quoteId: number;
  quoteNumber: string;
  customerName: string;
};

/** 신규 백엔드 API: GET /api/v1/sales */
export async function getAllSalesApi(): Promise<AllSalesListItem[]> {
  const { data } = await apiClient.get<ApiResponse<AllSalesListItem[]>>("/sales");
  if (!data.success || !Array.isArray(data.data)) {
    throw new Error(data.message || "전체 매출 목록 조회에 실패했습니다.");
  }
  return data.data;
}
