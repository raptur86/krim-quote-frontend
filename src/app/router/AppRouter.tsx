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
import { QuotesPage } from "../../pages/quotes/QuotesPage";
import { RatesPage } from "../../pages/rates/RatesPage";
import { PlatformPage } from "../../pages/platforms/PlatformPage";
import { SalesPage } from "../../pages/sales/SalesPage";
import { SettingsPage } from "../../pages/settings/SettingsPage";
import { CustomerCreatePage } from "../../pages/customers/CustomerCreatePage";
import { CustomerEditPage } from "../../pages/customers/CustomerEditPage";
import { CustomerDetailPage } from "../../pages/customers/CustomerDetailPage";

import { ROUTES } from "./routes"; 
import { ProtectedRoute } from "../../features/auth/ProtectedRoute";

export function AppRouter() {
  return (
    <BrowserRouter basename="/quote">
      <Routes>
        <Route path="/" element={<Navigate to={ROUTES.login} replace />} />
        <Route path={ROUTES.login} element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route
            index
            element={<Navigate to={ROUTES.dashboard} replace />}
          />

          <Route
            path="dashboard"
            element={<DashboardPage />}
          />
          <Route path="customers" element={<CustomersPage />} />
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
          <Route path="quotes" element={<QuotesPage />} />
          <Route path="rates" element={<RatesPage />} />
          <Route path="platforms" element={<PlatformPage />} />
          <Route path="sales" element={<SalesPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        </Route>

        <Route
          path={ROUTES.publicQuote}
          element={<PublicQuotePage />}
        />
      </Routes>
    </BrowserRouter>
  );
}
