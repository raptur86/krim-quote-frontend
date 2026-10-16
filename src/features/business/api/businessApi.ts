
import { apiClient } from "../../../services/apiClient";

import type { ApiResponse } from "../../../types/api.types";

import type {
  BusinessProfile,
  BusinessProfileUpdateRequest,
  BusinessProfileUpdateResponse,
  BusinessLogoUploadResponse,
} from "../types/business.types";

/**
 * 사업자 정보 조회
 *
 * GET /api/v1/business-profile
 */
export async function getBusinessProfileApi(): Promise<BusinessProfile | null> {
  const { data } = await apiClient.get<
    ApiResponse<BusinessProfile | null>
  >("/business-profile");

  if (!data.success) {
    throw new Error(
      data.message || "사업자 정보 조회에 실패했습니다.",
    );
  }

  return data.data ?? null;
}

/**
 * 사업자 정보 수정
 *
 * PUT /api/v1/business-profile
 */
export async function updateBusinessProfileApi(
  request: BusinessProfileUpdateRequest,
): Promise<BusinessProfileUpdateResponse> {
  const { data } = await apiClient.put<
    ApiResponse<BusinessProfileUpdateResponse>
  >("/business-profile", request);

  if (!data.success || !data.data) {
    throw new Error(
      data.message || "사업자 정보 수정에 실패했습니다.",
    );
  }

  return data.data;
}

/**
 * 사업자 로고 업로드
 *
 * POST /api/v1/business-profile/logo
 * Content-Type: multipart/form-data
 *
 * Form field: file
 */
export async function uploadBusinessLogoApi(
  file: File,
): Promise<BusinessLogoUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await apiClient.post<
    ApiResponse<BusinessLogoUploadResponse>
  >("/business-profile/logo", formData);

  if (!data.success || !data.data) {
    throw new Error(
      data.message || "사업자 로고 업로드에 실패했습니다.",
    );
  }

  return data.data;
}
