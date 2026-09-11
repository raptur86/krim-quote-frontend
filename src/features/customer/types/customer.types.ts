/**
 * KRIM Quote - Customer Types
 */

/* =========================================================
 * Request
 * ========================================================= */

/**
 * 고객 등록
 */
export type CustomerCreateRequest = {
  customerName: string;
  companyName?: string | null;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
  businessNumber?: string | null;
  address?: string | null;
  initialSource?: string | null;
  memo?: string | null;
};

/**
 * 고객 수정
 */
export type CustomerUpdateRequest = {
  customerName: string;
  companyName?: string | null;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
  businessNumber?: string | null;
  address?: string | null;
  initialSource?: string | null;
  memo?: string | null;
};


/* =========================================================
 * Response
 * ========================================================= */

/**
 * 고객 목록 항목
 */
export type CustomerListItem = {
  id: number;
  customerName: string;
  companyName: string | null;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  initialSource: string | null;
  active: boolean;
  createdAt: string;
};

/**
 * 고객 상세
 */
export type CustomerDetail = {
  id: number;
  customerName: string;
  companyName: string | null;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  businessNumber: string | null;
  address: string | null;
  initialSource: string | null;
  memo: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};


/* =========================================================
 * List Query
 * ========================================================= */

/**
 * 고객 목록 조회 파라미터
 *
 * GET /api/v1/customers
 */
export type CustomerListParams = {
  keyword?: string;
  active?: boolean;
  page?: number;
  size?: number;
  sort?: string;
};


/* =========================================================
 * Pagination
 * ========================================================= */

export type CustomerPageResponse = {
  content: CustomerListItem[];

  page: number;
  size: number;

  totalElements: number;
  totalPages: number;

  first: boolean;
  last: boolean;
};

/* =========================================================
 * Active
 * ========================================================= */

export type CustomerActiveRequest = {
  active: boolean;
};

export type CustomerActiveResponse = {
  id: number;
  active: boolean;
};