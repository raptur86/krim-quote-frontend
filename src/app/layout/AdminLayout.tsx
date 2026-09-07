import { Outlet } from "react-router-dom";

import { Header } from "../../components/layout/Header";
import { Sidebar } from "../../components/layout/Sidebar";

export function AdminLayout() {
  return (
    <div>
      <Header />
      <Sidebar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}