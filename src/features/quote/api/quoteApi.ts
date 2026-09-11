import { apiClient } from "../../../services/apiClient";

import type { ApiResponse } from "../../../types/api.types";

import type {
  QuoteCreateRequest,
  QuoteCreateResponse,
  QuoteListParams,
  QuotePageResponse,
} from "../types/quote.types";



export async function getQuotesApi(
  params?: QuoteListParams,
): Promise<QuotePageResponse> {
  const { data } =
    await apiClient.get<ApiResponse<QuotePageResponse>>(
      "/quotes",
      {
        params,
      },
    );

  if (!data.success || !data.data) {
    throw new Error(
      data.message || "견적 목록을 불러오지 못했습니다.",
    );
  }

  return data.data;
}
/* =========================================================
 * Create Quote
 * ========================================================= */

/**
 * 신규 견적 생성
 *
 * POST /api/v1/quotes
 *
 * 신규 견적은 서버에서 항상 DRAFT로 생성한다.
 */
export async function createQuoteApi(
  request: QuoteCreateRequest,
): Promise<QuoteCreateResponse> {
  const { data } =
    await apiClient.post<
      ApiResponse<QuoteCreateResponse>
    >(
      "/quotes",
      request,
    );

  if (
    !data.success ||
    !data.data
  ) {
    throw new Error(
      data.message ||
        "견적 생성에 실패했습니다.",
    );
  }

  return data.data;
}