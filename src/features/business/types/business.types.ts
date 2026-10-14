
/**
 * 사업자 정보 조회 응답
 * GET /api/v1/business-profile
 */
export type BusinessProfile = {
  id: number;

  businessName: string;
  brandName: string | null;
  representativeName: string;

  businessNumber: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;

  logoUrl: string | null;

  bankName: string | null;
  accountNumber: string | null;
  accountHolder: string | null;

  defaultQuoteMessage: string | null;

  updatedAt: string;
};

/**
 * 사업자 정보 수정 요청
 * PUT /api/v1/business-profile
 *
 * 로고는 별도 업로드 API를 사용하므로 제외한다.
 */
export type BusinessProfileUpdateRequest = {
  businessName: string;
  brandName: string | null;
  representativeName: string;

  businessNumber: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;

  bankName: string | null;
  accountNumber: string | null;
  accountHolder: string | null;

  defaultQuoteMessage: string | null;
};

/**
 * 사업자 정보 수정 응답
 * 공식 API는 전체 프로필이 아닌 일부 필드를 반환한다.
 */
export type BusinessProfileUpdateResponse = {
  id: number;
  businessName: string;
  brandName: string | null;
  updatedAt: string;
};

/**
 * 로고 업로드 응답
 * POST /api/v1/business-profile/logo
 */
export type BusinessLogoUploadResponse = {
  logoUrl: string;
};
