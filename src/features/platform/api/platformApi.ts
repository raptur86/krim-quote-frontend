import { apiClient } from "../../../services/apiClient";
import type { ApiResponse } from "../../../types/api.types";
import type { PlatformListItem } from "../types/platform.types";

export async function getPlatformsApi(
  active?: boolean,
): Promise<PlatformListItem[]> {
  const { data } = await apiClient.get<
    ApiResponse<PlatformListItem[]>
  >(
    "/platforms",
    {
      params: {
        active,
      },
    },
  );

  if (!data.success || !data.data) {
    throw new Error(
      data.message ||
        "플랫폼 목록을 불러오지 못했습니다.",
    );
  }

  return data.data;
}