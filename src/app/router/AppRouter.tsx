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

import { ROUTES } from "./routes"; 

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={ROUTES.login} replace />} />

        <Route path="/manage" element={<AdminLayout />}>
          <Route
            index
            element={<Navigate to={ROUTES.dashboard} replace />}
          />

          <Route
            path="dashboard"
            element={<DashboardPage />}
          />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="quotes" element={<QuotesPage />} />
        </Route>

        <Route
          path={ROUTES.publicQuote}
          element={<PublicQuotePage />}
        />
      </Routes>
    </BrowserRouter>
  );
}