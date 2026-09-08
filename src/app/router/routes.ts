export const ROUTES = {
  login: "/login",

  manage: "/manage",
  dashboard: "/manage/dashboard",
  customers: "/manage/customers",
  quotes: "/manage/quotes",
  rates: "/manage/rates",
  platforms: "/manage/platforms",
  sales: "/manage/sales",
  settings: "/manage/settings",

  publicQuote: "/q/:token",
} as const;