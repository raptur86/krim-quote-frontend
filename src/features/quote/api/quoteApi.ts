import { apiClient } from "../../../services/apiClient";

import type { ApiResponse } from "../../../types/api.types";

import type {
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