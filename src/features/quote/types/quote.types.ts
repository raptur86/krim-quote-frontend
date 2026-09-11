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

export type QuoteItemRequest = {
  /**
   * 표준단가에서 가져온 항목이면 ID 존재
   * 직접 입력 항목이면 null
   */
  standardRateId: number | null;
  categoryName: string | null;

  featureName: string;

  description: string | null;

  /**
   * 실제 견적에 사용할 단가
   */
  quoteUnitPrice: number;

  quantity: number;

  unitName: string;

  difficultyCode: string;

  difficultyRate: number;

  adjustmentAmount: number;

  adjustmentReason: string | null;

  estimatedHours: number;

  internalMemo: string | null;

  sortOrder: number;
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

export type QuoteUpdateRequest =
  QuoteCreateRequest;


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

export type QuoteDraftItem =
  QuoteItemRequest & {
    clientId: string;
  };
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


export type QuoteDetailItem = {
  id: number;

  standardRateId: number | null;

  categoryName: string | null;

  featureName: string;

  description: string | null;

  standardPriceSnapshot: number | null;

  quoteUnitPrice: number;

  quantity: number;

  unitName: string;

  difficultyCode: string;

  difficultyRate: number;

  adjustmentAmount: number;

  adjustmentReason: string | null;

  calculatedAmount: number;

  finalAmount: number;

  estimatedHours: number;

  internalMemo: string | null;

  sortOrder: number;
};


export type QuoteDirectCost = {
  id: number;

  costName: string;

  amount: number;

  memo: string | null;

  sortOrder: number;
};


export type QuoteDetailResponse = {
  id: number;

  quoteNumber: string;

  status: QuoteStatus;

  customer: QuoteDetailCustomer;

  inquiryPlatform:
    | QuoteDetailPlatform
    | null;

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

  expectedSettlementAmount:
    | number
    | null;

  expectedDeductionAmount:
    | number
    | null;

  expectedSettlementMemo:
    | string
    | null;

  estimatedHours: number;

  createdAt: string;

  updatedAt: string;
};