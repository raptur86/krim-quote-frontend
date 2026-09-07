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

import { ROUTES } from "./routes"; 

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.login} element={<LoginPage />} />

        <Route path="/manage" element={<AdminLayout />}>
          <Route
            index
            element={<Navigate to={ROUTES.dashboard} replace />}
          />

          <Route
            path="dashboard"
            element={<DashboardPage />}
          />
        </Route>

        <Route
          path={ROUTES.publicQuote}
          element={<PublicQuotePage />}
        />
      </Routes>
    </BrowserRouter>
  );
}