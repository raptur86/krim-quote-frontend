import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { AdminLayout } from "../layout/AdminLayout";

import { DashboardPage } from "../../pages/dashboard/DashboardPage";
import { LoginPage } from "../../pages/auth/LoginPage";

import { PublicQuotePage } from "../../pages/public/PublicQuotePage";

import { CustomersPage } from "../../pages/customers/CustomersPage";
import { CustomerCreatePage } from "../../pages/customers/CustomerCreatePage";
import { CustomerEditPage } from "../../pages/customers/CustomerEditPage";
import { CustomerDetailPage } from "../../pages/customers/CustomerDetailPage";

import { QuotesPage } from "../../pages/quotes/QuotesPage";
import { QuoteCreatePage } from "../../pages/quotes/QuoteCreatePage";
import { QuoteDetailPage } from "../../pages/quotes/QuoteDetailPage";
import { QuoteEditPage } from "../../pages/quotes/QuoteEditPage";

import { RatesPage } from "../../pages/rates/RatesPage";
import { PlatformPage } from "../../pages/platforms/PlatformPage";
import { SalesPage } from "../../pages/sales/SalesPage";

import { SettingsPage } from "../../pages/settings/SettingsPage";
import { CostSettingsPage } from "../../pages/settings/CostSettingsPage";

import { ROUTES } from "./routes";
import { ProtectedRoute } from "../../features/auth/ProtectedRoute";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================================
            Root
        ========================================= */}

        <Route
          path="/"
          element={
            <Navigate
              to={ROUTES.quoteRoot}
              replace
            />
          }
        />

        {/* =========================================
            배포 정규화

            /quote/index.html 로 직접 접근한 경우
            /quote 로 이동
        ========================================= */}

        <Route
          path="/quote/index.html"
          element={
            <Navigate
              to={ROUTES.quoteRoot}
              replace
            />
          }
        />

        {/* =========================================
            관리자 로그인
        ========================================= */}

        <Route
          path={ROUTES.login}
          element={<LoginPage />}
        />

        {/* =========================================
            관리자 보호 영역
        ========================================= */}

        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>

            <Route
              path={ROUTES.quoteRoot}
              element={
                <Navigate
                  to={ROUTES.dashboard}
                  replace
                />
              }
            />

            <Route
              path={ROUTES.dashboard}
              element={<DashboardPage />}
            />

            {/* 고객 */}

            <Route
              path={ROUTES.customers}
              element={<CustomersPage />}
            />

            <Route
              path={ROUTES.customerCreate}
              element={<CustomerCreatePage />}
            />

            <Route
              path={ROUTES.customerDetail}
              element={<CustomerDetailPage />}
            />

            <Route
              path={ROUTES.customerEdit}
              element={<CustomerEditPage />}
            />

            {/* 견적 */}

            <Route
              path={ROUTES.quotes}
              element={<QuotesPage />}
            />

            <Route
              path={ROUTES.quoteCreate}
              element={<QuoteCreatePage />}
            />

            <Route
              path={ROUTES.quoteDetail}
              element={<QuoteDetailPage />}
            />

            <Route
              path={ROUTES.quoteEdit}
              element={<QuoteEditPage />}
            />

            {/* 표준단가 */}

            <Route
              path={ROUTES.rates}
              element={<RatesPage />}
            />

            {/* 플랫폼 */}

            <Route
              path={ROUTES.platforms}
              element={<PlatformPage />}
            />

            {/* 매출 */}

            <Route
              path={ROUTES.sales}
              element={<SalesPage />}
            />

            {/* 설정 */}

            <Route
              path={ROUTES.settings}
              element={<SettingsPage />}
            />

            <Route
              path={ROUTES.costSettings}
              element={<CostSettingsPage />}
            />

          </Route>
        </Route>

        {/* =========================================
            고객 공개 견적

            로그인 불필요
            AdminLayout 사용 안 함
        ========================================= */}

        <Route
          path={ROUTES.publicQuote}
          element={<PublicQuotePage />}
        />

        {/* =========================================
            Unknown
        ========================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to={ROUTES.quoteRoot}
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}