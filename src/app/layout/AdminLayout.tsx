import { Outlet } from "react-router-dom";

import { Header } from "../../components/layout/Header";
import { Sidebar } from "../../components/layout/Sidebar";

import "./admin-layout.css"

export function AdminLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-column flex-1">
        <Header />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}