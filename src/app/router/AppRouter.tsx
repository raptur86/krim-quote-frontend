import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { ROUTES } from "./routes"; 

function LoginPage() {
  return <div>Login Page</div>;
}

function DashboardPage() {
  return <div>Dashboard Page</div>;
}

function PublicQuotePage() {
  return <div>Public Quote Page</div>;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.login} element={<LoginPage />} />

        <Route
          path={ROUTES.manage}
          element={<Navigate to={ROUTES.dashboard} replace />}
        />

        <Route
          path={ROUTES.dashboard}
          element={<DashboardPage />}
        />

        <Route
          path={ROUTES.publicQuote}
          element={<PublicQuotePage />}
        />
      </Routes>
    </BrowserRouter>
  );
}