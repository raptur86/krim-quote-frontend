export const ROUTES = {
  login: "/login",

  dashboard: "/dashboard",
  
  customers: "/customers",
  customerCreate: "/customers/new",
  customerDetail: "/customers/:customerId",
  customerEdit: "/customers/:customerId/edit",

  quotes: "/quotes",
  rates: "/rates",
  platforms: "/platforms",
  sales: "/sales",
  settings: "/settings",

  publicQuote: "/q/:token",
} as const;