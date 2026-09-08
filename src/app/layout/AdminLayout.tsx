import { Outlet } from "react-router-dom";

import { Header } from "../../components/layout/Header";
import { Sidebar } from "../../components/layout/Sidebar";

import "../../styles/admin-layout.css"

export function AdminLayout() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-column">
        <Header />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}