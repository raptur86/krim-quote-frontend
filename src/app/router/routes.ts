export const ROUTES = {
  login: "/login",

  manage: "/manage",
  dashboard: "/manage/dashboard",
  customers: "/manage/customers",
  quotes: "/manage/quotes",

  publicQuote: "/q/:token",
} as const;