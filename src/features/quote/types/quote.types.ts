
/* =========================================================
 * Status
 * ========================================================= */

export type QuoteStatus =
  | "DRAFT"
  | "ISSUED"
  | "EXPIRED"
  | "CANCELLED";

/* =========================================================
 * Quote Item
 * ========================================================= */
export type QuoteItemType =
  | "FEATURE"
  | "PACKAGE"
  | "INCLUDED_FEATURE"
  | "ADDITIONAL_FEATURE";
export type QuoteItemRequest = {
  standardRateId: number | null;
  categoryName: string | null;
  featureName: string;
  description: string | null;
  quoteUnitPrice: number;
  quantity: number;
  unitName: string | null;
  difficultyCode: string | null;
  difficultyRate: number;
  adjustmentAmount: number | null;
  adjustmentReason: string | null;
  estimatedHours: number | null;
  internalMemo: string | null;
  sortOrder: number;
  itemType: QuoteItemType | null;
  parentPackageItemIndex: number | null;
  packageScopeSnapshot: string | null;
};

/* =========================================================
 * Direct Cost
 * ========================================================= */

export type QuoteDirectCostRequest = {
  costName: string;
  amount: number;
  memo: string | null;
  sortOrder: number;
};

/* =========================================================
 * Create / Update
 * ========================================================= */

export type QuoteCreateRequest = {
  customerId: number;

  inquiryPlatformId: number | null;

  title: string;
  writtenDate: string;
  validUntil: string | null;

  expectedDuration: string | null;
  customerNote: string | null;
  internalMemo: string | null;

  /**
   * 견적 전체 조정금액
   */
  adjustmentAmount: number;

  /**
   * 플랫폼에서 실제로 받을 것으로 예상하는 금액
   */
  expectedSettlementAmount: number | null;

  expectedSettlementMemo: string | null;

  items: QuoteItemRequest[];
  directCosts: QuoteDirectCostRequest[];
};

export type QuoteUpdateRequest = QuoteCreateRequest;

/* =========================================================
 * Create Response
 * ========================================================= */

export type QuoteCreateResponse = {
  id: number;
  quoteNumber: string;
  status: QuoteStatus;
  totalAmount: number;
  createdAt: string;
};

/* =========================================================
 * List
 * ========================================================= */

export type QuoteListItem = {
  id: number;

  quoteNumber: string;
  title: string;

  customerId: number;
  customerName: string;
  companyName: string | null;

  inquiryPlatformId: number | null;
  inquiryPlatformName: string | null;

  status: QuoteStatus;

  writtenDate: string;
  validUntil: string | null;

  totalAmount: number;

  issuedAt: string | null;
  createdAt: string;

  /* v1.2 개정 이력 */
  originalQuoteId: number | null;
  sourceQuoteId: number | null;
  revisionNo: number;
};

export type QuoteListParams = {
  keyword?: string;
  customerId?: number;
  status?: QuoteStatus;
  inquiryPlatformId?: number;

  fromDate?: string;
  toDate?: string;

  page?: number;
  size?: number;
  sort?: string;
};

export type QuotePageResponse = {
  content: QuoteListItem[];

  page: number;
  size: number;

  totalElements: number;
  totalPages: number;

  first: boolean;
  last: boolean;
};

/* =========================================================
 * Draft Item
 * ========================================================= */

export type QuoteDraftItem = QuoteItemRequest & {
  clientId: string;
  parentPackageClientId: string | null;
};

/* =========================================================
 * Quote Detail - Customer / Platform
 * ========================================================= */

export type QuoteDetailCustomer = {
  id: number;
  customerName: string;
  companyName: string | null;
};

export type QuoteDetailPlatform = {
  id: number;
  code: string;
  name: string;
};

/* =========================================================
 * Quote Detail - Item
 * ========================================================= */

export type QuoteDetailItem = {
  id: number;

  standardRateId: number | null;
  categoryName: string | null;

  featureName: string;
  description: string | null;

  standardPriceSnapshot: number | null;

  quoteUnitPrice: number;
  quantity: number;
  unitName: string | null;

  difficultyCode: string | null;
  difficultyRate: number;

  adjustmentAmount: number;
  adjustmentReason: string | null;

  calculatedAmount: number;
  finalAmount: number;

  estimatedHours: number | null;
  internalMemo: string | null;

  sortOrder: number;
  itemType: QuoteItemType | null;
parentPackageItemId: number | null;
packageScopeSnapshot: string | null;
};

/* =========================================================
 * Quote Detail - Direct Cost
 * ========================================================= */

export type QuoteDirectCost = {
  id: number;

  costName: string;
  amount: number;

  memo: string | null;
  sortOrder: number;
};

/* =========================================================
 * Quote Detail Response
 * ========================================================= */

export type QuoteDetailResponse = {
  id: number;

  quoteNumber: string;
  status: QuoteStatus;

  customer: QuoteDetailCustomer;

  inquiryPlatform: QuoteDetailPlatform | null;

  title: string;

  writtenDate: string;
  validUntil: string | null;

  expectedDuration: string | null;
  customerNote: string | null;
  internalMemo: string | null;

  items: QuoteDetailItem[];
  directCosts: QuoteDirectCost[];

  itemsAmount: number;
  adjustmentAmount: number;

  supplyAmount: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;

  expectedSettlementAmount: number | null;
  expectedDeductionAmount: number | null;
  expectedSettlementMemo: string | null;

  estimatedHours: number;

  publicUrl: string | null;

  createdAt: string;
  updatedAt: string;

  /* v1.2 개정 이력 */
  originalQuoteId: number | null;
  sourceQuoteId: number | null;
  revisionNo: number;
};

/* =========================================================
 * Issue Response
 * ========================================================= */

export type QuoteIssueResponse = {
  id: number;

  quoteNumber: string;
  status: "ISSUED";

  supplyAmount: number;
  vatAmount: number;
  totalAmount: number;

  publicUrl: string;
  issuedAt: string;
};

/* =========================================================
 * v1.2 - Quote Copy
 * ========================================================= */

/**
 * REVISION : 기존 견적의 개정본 생성
 * DUPLICATE : 독립된 새 견적으로 복제
 *
 * 실제 백엔드 QuoteCopyType enum과 일치해야 한다.
 */
export type QuoteCopyType = "REVISION" | "DUPLICATE";

export interface QuoteCopyRequest {
  copyType: QuoteCopyType;
}

/**
 * POST /api/v1/quotes/{id}/copy
 */
export interface QuoteCopyResponse {
  quoteId: number;
  quoteNumber: string;

  copyType: QuoteCopyType;

  originalQuoteId: number | null;
  sourceQuoteId: number | null;

  revisionNo: number;
}

/* =========================================================
 * v1.2 - Quote Revision History
 * ========================================================= */

/**
 * GET /api/v1/quotes/{id}/revisions
 *
 * 개정 이력의 각 견적 정보를 나타낸다.
 */
export interface QuoteRevisionResponse {
  quoteId: number;
  quoteNumber: string;

  status: QuoteStatus;
  revisionNo: number;

  originalQuoteId: number | null;
  sourceQuoteId: number | null;

  title: string;
  writtenDate: string;

  totalAmount: number;

  issuedAt: string | null;
  createdAt: string;
}
