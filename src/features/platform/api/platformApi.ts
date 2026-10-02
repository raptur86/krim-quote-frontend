import { apiClient } from "../../../services/apiClient";
import type { ApiResponse } from "../../../types/api.types";
import type {
  PlatformListItem,
  UpdatePublicInfoPolicyRequest,
} from "../types/platform.types";

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

export async function updatePublicInfoPolicyApi(
  platformId: number,
  request: UpdatePublicInfoPolicyRequest,
): Promise<PlatformListItem> {
  const { data } = await apiClient.patch<
    ApiResponse<PlatformListItem>
  >(
    `/platforms/${platformId}/public-info-policy`,
    request,
  );

  if (!data.success || !data.data) {
    throw new Error(
      data.message ||
        "플랫폼 공개정보 정책을 수정하지 못했습니다.",
    );
  }

  return data.data;
}