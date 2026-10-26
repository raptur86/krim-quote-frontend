
export type StandardRateType = "PACKAGE" | "FEATURE";

/* =========================================================
   Standard Rate List
========================================================= */

export type StandardRateListItem = {
  id: number;
  categoryId: number;
  categoryName: string;
  featureName: string;
  standardPrice: number;
  defaultUnit: string | null;
  defaultHours: number | null;
  active: boolean;
  rateType: StandardRateType;
};

export type StandardRateListParams = {
  keyword?: string;
  categoryId?: number;
  active?: boolean;
  rateType?: StandardRateType;
  page?: number;
  size?: number;
  sort?: string;
};

export type StandardRatePageResponse = {
  content: StandardRateListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

/* =========================================================
   Rate Category
========================================================= */

export type RateCategory = {
  id: number;
  name: string;
  sortOrder: number;
  active: boolean;
};

export type CreateRateCategoryRequest = {
  name: string;
  sortOrder: number;
};

export type UpdateRateCategoryRequest = {
  name: string;
  sortOrder: number;
};

/* =========================================================
   Standard Rate Detail
========================================================= */

export type StandardRateDetail = {
  id: number;
  category: {
    id: number;
    name: string;
  };
  featureName: string;
  description: string | null;
  standardPrice: number;
  defaultUnit: string | null;
  defaultHours: number | null;
  active: boolean;
  internalMemo: string | null;
  createdAt: string;
  updatedAt: string;
  rateType: StandardRateType;
};

/* =========================================================
   Standard Rate Create / Update
========================================================= */

export type StandardRateSaveRequest = {
  categoryId: number;
  featureName: string;
  description: string | null;
  standardPrice: number;
  defaultUnit: string | null;
  defaultHours: number | null;
  internalMemo: string | null;

  // 최신 백엔드 Create/Update DTO 확인 후
  // 등록·수정 화면에서 전송하도록 연결한다.
  rateType?: StandardRateType;
};

export type ChangeActiveRequest = {
  active: boolean;
};

/* =========================================================
   Package Features
========================================================= */

export type PackageFeatureResponse = {
  id: number;
  packageRateId: number;
  featureRateId: number;
  categoryName: string;
  featureName: string;
  standardPrice: number;
  includedQuantity: number;
  unitName: string | null;
  scopeDescription: string | null;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PackageFeatureCreateRequest = {
  featureRateId: number;
  includedQuantity: number;
  unitName: string | null;
  scopeDescription: string | null;
  sortOrder: number;
};

export type PackageFeatureUpdateRequest = {
  includedQuantity: number;
  unitName: string | null;
  scopeDescription: string | null;
  sortOrder: number;
};

export type PackageFeatureListParams = {
  active?: boolean;
};

export type PackageFeatureActiveRequest = {
  active: boolean;
};
