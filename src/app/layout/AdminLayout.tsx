
import {
  useEffect,
  useState,
} from "react";

import {
  Outlet,
  useLocation,
} from "react-router-dom";

import { Header } from "../../components/layout/Header";
import { Sidebar } from "../../components/layout/Sidebar";

import { SessionExtendModal } from "../../features/auth/components/SessionExtendModal";

import "./admin-layout.css";

export function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [mobileMenuOpen]);

  return (
    <div className="krim-admin-shell">
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {mobileMenuOpen && (
        <button
          type="button"
          className="krim-sidebar-backdrop"
          aria-label="메뉴 닫기"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="krim-admin-workspace">
        <Header
          onMenuClick={() => setMobileMenuOpen(true)}
        />

        <main
          className="krim-admin-main"
          id="main-content"
        >
          <Outlet />
        </main>
      </div>

      <SessionExtendModal />
    </div>
  );
}
