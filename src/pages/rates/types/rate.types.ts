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