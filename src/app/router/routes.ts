export const ROUTES = {
  login: "/login",

  dashboard: "/dashboard",

  customers: "/customers",
  customerCreate: "/customers/new",
  customerDetail:
    "/customers/:customerId",
  customerEdit:
    "/customers/:customerId/edit",

  quotes: "/quotes",
  quoteCreate: "/quotes/new",
  quoteDetail: "/quotes/:quoteId",
  quoteEdit:
    "/quotes/:quoteId/edit",

  rates: "/rates",

  platforms: "/platforms",

  sales: "/sales",

  settings: "/settings",

  publicQuote: "/q/:token",
} as const;