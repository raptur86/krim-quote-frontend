export type QuoteStatus =
  | "DRAFT"
  | "ISSUED"
  | "CANCELLED";

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