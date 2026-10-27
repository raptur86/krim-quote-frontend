
/* =========================================================
 * Status
 * ========================================================= */

export type QuoteStatus =
  | "DRAFT"
  | "ISSUED"
  | "EXPIRED"
  | "CANCELLED";

/* =========================================================
 * Quote Item Type
 * ========================================================= */

export type QuoteItemType =
  | "FEATURE"
  | "PACKAGE"
  | "INCLUDED_FEATURE"
  | "ADDITIONAL_FEATURE";

/* =========================================================
 * Quote Item Request
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
<<<<<<< HEAD
  quoteUnitPrice: number;
  quantity: number;
  unitName: string | null;
  difficultyCode: string | null;
  difficultyRate: number;
  adjustmentAmount: number | null;
  adjustmentReason: string | null;
=======

  quoteUnitPrice: number;
  quantity: number;
  unitName: string | null;

  difficultyCode: string | null;
  difficultyRate: number;

  adjustmentAmount: number | null;
  adjustmentReason: string | null;

>>>>>>> e839c443ecd62ad9a24acf1fa86ab91404a44495
  estimatedHours: number | null;
  internalMemo: string | null;
  sortOrder: number;
<<<<<<< HEAD
  itemType: QuoteItemType | null;
  parentPackageItemIndex: number | null;
  packageScopeSnapshot: string | null;
=======

  // 패키지 견적 확장
  itemType?: QuoteItemType | null;

  // 서버 요청 items 배열의 부모 PACKAGE 인덱스
  parentPackageItemIndex?: number | null;

  // 포함 기능의 적용 범위 스냅샷
  packageScopeSnapshot?: string | null;
>>>>>>> e839c443ecd62ad9a24acf1fa86ab91404a44495
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

  adjustmentAmount: number;

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

  // v1.2 개정 이력
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
  // 프론트엔드 항목 고유 식별자
  clientId: string;

  // 프론트엔드에서 사용하는 부모 패키지 식별자
  // API 요청 시에는 전송하지 않는다.
  parentPackageClientId?: string | null;

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

  adjustmentAmount: number | null;
  adjustmentReason: string | null;

  calculatedAmount: number;
  finalAmount: number;

  estimatedHours: number | null;
  internalMemo: string | null;

  sortOrder: number;
<<<<<<< HEAD
  itemType: QuoteItemType | null;
parentPackageItemId: number | null;
packageScopeSnapshot: string | null;
=======

  // 패키지 견적 확장
  itemType?: QuoteItemType | null;

  // 저장된 부모 PACKAGE 견적항목의 DB ID
  parentPackageItemId?: number | null;

  packageScopeSnapshot?: string | null;
>>>>>>> e839c443ecd62ad9a24acf1fa86ab91404a44495
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

  // v1.2 개정 이력
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

export type QuoteCopyType =
  | "REVISION"
  | "DUPLICATE";

export interface QuoteCopyRequest {
  copyType: QuoteCopyType;
}

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
