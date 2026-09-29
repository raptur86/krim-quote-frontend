export const ROUTES = {
  quoteRoot: "/quote",

  login: "/quote/login",

  dashboard: "/quote/dashboard",

  customers: "/quote/customers",
  customerCreate: "/quote/customers/new",
  customerDetail: "/quote/customers/:customerId",
  customerEdit: "/quote/customers/:customerId/edit",

  quotes: "/quote/quotes",
  quoteCreate: "/quote/quotes/new",
  quoteDetail: "/quote/quotes/:quoteId",
  quoteEdit: "/quote/quotes/:quoteId/edit",

  rates: "/quote/rates",

  platforms: "/quote/platforms",

  sales: "/quote/sales",

  settings: "/quote/settings",
  costSettings: "/quote/settings/cost",

  publicQuote: "/q/:token",
} as const;