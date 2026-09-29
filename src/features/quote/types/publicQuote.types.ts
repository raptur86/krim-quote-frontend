export interface PublicQuoteCustomer {
  customerName: string;
  companyName: string | null;
  contactName: string | null;
}

export interface PublicQuoteBusiness {
  businessName: string;
  brandName: string | null;
  representativeName: string | null;
  businessNumber: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logoUrl: string | null;
}

export interface PublicQuoteItem {
  categoryName: string | null;
  featureName: string;
  description: string | null;
  quantity: number;
  unitName: string;
  amount: number;
}

export interface PublicQuoteResponse {
  quoteNumber: string;
  title: string;

  writtenDate: string;
  validUntil: string | null;
  expectedDuration: string | null;

  customer: PublicQuoteCustomer;
  business: PublicQuoteBusiness;

  items: PublicQuoteItem[];

  supplyAmount: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;

  customerNote: string | null;

  status: string;
}