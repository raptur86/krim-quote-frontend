import { apiClient } from "../../../services/apiClient";
import type { ApiResponse } from "../../../types/api.types";
import type { PublicQuoteResponse } from "../types/publicQuote.types";

export async function getPublicQuoteApi(
  token: string,
): Promise<PublicQuoteResponse> {
  const { data } = await apiClient.get<
    ApiResponse<PublicQuoteResponse>
  >(`/public/quotes/${encodeURIComponent(token)}`);

  if (!data.success || !data.data) {
    throw new Error(
      data.message || "견적을 불러오지 못했습니다.",
    );
  }

  return data.data;
}