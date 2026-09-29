import { apiClient } from "../../../services/apiClient";
import type { ApiResponse } from "../../../types/api.types";
import type {
  CostSettingCreateRequest,
  CostSettingResponse,
} from "../types/cost.types";

export async function getCostSettingsApi(): Promise<
  CostSettingResponse[]
> {
  const { data } = await apiClient.get<
    ApiResponse<CostSettingResponse[]>
  >("/cost-settings");

  if (!data.success) {
    throw new Error(
      data.message || "원가 설정 이력을 불러오지 못했습니다.",
    );
  }

  return data.data ?? [];
}

export async function createCostSettingApi(
  request: CostSettingCreateRequest,
): Promise<CostSettingResponse> {
  const { data } = await apiClient.post<
    ApiResponse<CostSettingResponse>
  >("/cost-settings", request);

  if (!data.success || !data.data) {
    throw new Error(
      data.message || "원가 설정 저장에 실패했습니다.",
    );
  }

  return data.data;
}