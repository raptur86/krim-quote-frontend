import { apiClient } from "../../../services/apiClient";

import type {
  ApiResponse,
} from "../../../types/api.types";

import type {
  StandardRateListParams,
  StandardRatePageResponse,
} from "../types/rate.types";


export async function getStandardRatesApi(
  params?: StandardRateListParams,
): Promise<StandardRatePageResponse> {
  const { data } =
    await apiClient.get<
      ApiResponse<StandardRatePageResponse>
    >(
      "/standard-rates",
      {
        params,
      },
    );

  if (!data.success || !data.data) {
    throw new Error(
      data.message ||
        "표준단가 목록을 불러오지 못했습니다.",
    );
  }

  return data.data;
}