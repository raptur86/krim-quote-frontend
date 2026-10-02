export type StandardRateListItem = {
  id: number;
  categoryId: number;
  categoryName: string;
  featureName: string;
  standardPrice: number;
  defaultUnit: string;
  defaultHours: number;
  active: boolean;
};

export type StandardRateListParams = {
  keyword?: string;
  categoryId?: number;
  active?: boolean;
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
  defaultUnit: string;
  defaultHours: number | null;
  active: boolean;
  internalMemo: string | null;

  createdAt: string;
  updatedAt: string;
};


/* =========================================================
   Standard Rate Create / Update
========================================================= */

export type StandardRateSaveRequest = {
  categoryId: number;
  featureName: string;
  description: string | null;
  standardPrice: number;
  defaultUnit: string;
  defaultHours: number | null;
  internalMemo: string | null;
};

export type ChangeActiveRequest = {
  active: boolean;
};