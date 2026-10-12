import { apiClient } from "../../../services/apiClient";
import type { ApiResponse } from "../../../types/api.types";
import type {
  PlatformListItem,
  PlatformSaveRequest,
  PlatformActiveRequest,
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

/* =========================================================
   플랫폼 등록
========================================================= */

export async function createPlatformApi(
  request: PlatformSaveRequest,
): Promise<PlatformListItem> {
  const { data } = await apiClient.post<
    ApiResponse<PlatformListItem>
  >("/platforms", request);

  if (!data.success || !data.data) {
    throw new Error(
      data.message || "플랫폼 등록에 실패했습니다.",
    );
  }

  return data.data;
}


/* =========================================================
   플랫폼 수정
========================================================= */

export async function updatePlatformApi(
  platformId: number,
  request: PlatformSaveRequest,
): Promise<PlatformListItem> {
  const { data } = await apiClient.put<
    ApiResponse<PlatformListItem>
  >(`/platforms/${platformId}`, request);

  if (!data.success || !data.data) {
    throw new Error(
      data.message || "플랫폼 수정에 실패했습니다.",
    );
  }

  return data.data;
}


/* =========================================================
   플랫폼 사용/미사용 변경
========================================================= */

export async function changePlatformActiveApi(
  platformId: number,
  request: PlatformActiveRequest,
): Promise<PlatformListItem> {
  const { data } = await apiClient.patch<
    ApiResponse<PlatformListItem>
  >(
    `/platforms/${platformId}/active`,
    request,
  );

  if (!data.success || !data.data) {
    throw new Error(
      data.message ||
        "플랫폼 사용 상태 변경에 실패했습니다.",
    );
  }

  return data.data;
}