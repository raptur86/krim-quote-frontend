
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  Receipt,
  Calculator,
  Layers3,
  Building2,
  ChartNoAxesCombined,
  Settings,
  LogOut,
  X,
  type LucideIcon,
} from "lucide-react";

import { ROUTES } from "../../app/router/routes";
import { useAuth } from "../../features/auth/useAuth";
import "./Sidebar.css";

type SidebarProps = {
  mobileOpen?: boolean;
  onClose?: () => void;
};

type MenuItem = {
  label: string;
  path: string;
  icon: LucideIcon;
};

type MenuGroup = {
  title: string;
  items: MenuItem[];
};

const groups: MenuGroup[] = [
  {
    title: "OVERVIEW",
    items: [
      {
        label: "대시보드",
        path: ROUTES.dashboard,
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "BUSINESS",
    items: [
      {
        label: "고객 관리",
        path: ROUTES.customers,
        icon: Users,
      },
      {
        label: "견적 관리",
        path: ROUTES.quotes,
        icon: FileText,
      },
      {
        label: "매출 관리",
        path: ROUTES.sales,
        icon: Receipt,
      },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      {
        label: "표준단가",
        path: ROUTES.rates,
        icon: Calculator,
      },
      {
        label: "플랫폼",
        path: ROUTES.platforms,
        icon: Layers3,
      },
      {
        label: "사업자 정보",
        path: ROUTES.business,
        icon: Building2,
      },
      {
        label: "사업 원가 설정",
        path: ROUTES.costSettings,
        icon: ChartNoAxesCombined,
      },
      {
        label: "설정",
        path: ROUTES.settings,
        icon: Settings,
      },
    ],
  },
];

export function Sidebar({
  mobileOpen = false,
  onClose,
}: SidebarProps) {
  const { admin, logout } = useAuth();

  return (
    <aside
      className={`sidebar ${
        mobileOpen ? "sidebar--mobile-open" : ""
      }`}
      aria-label="관리자 메뉴"
    >
      <div className="sidebar-top">
        <div className="sidebar-brand-mark" aria-hidden="true">
          K
        </div>

        <div className="sidebar-brand-copy">
          <strong>KRIM Quote</strong>
          <small>BUSINESS MANAGEMENT</small>
        </div>

        <button
          type="button"
          className="sidebar-mobile-close"
          aria-label="메뉴 닫기"
          onClick={onClose}
        >
          <X size={22} strokeWidth={2} />
        </button>
      </div>

      <nav className="sidebar-nav" aria-label="주 메뉴">
        {groups.map((group) => (
          <div className="sidebar-group" key={group.title}>
            <div className="sidebar-group-title">
              {group.title}
            </div>

            <ul className="sidebar-menu">
              {group.items.map((item) => {
                const Icon = item.icon;

                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      end={item.path === ROUTES.settings}
                      onClick={onClose}
                      title={item.label}
                      className={({ isActive }) =>
                        `sidebar-link${
                          isActive ? " active" : ""
                        }`
                      }
                    >
                      <span
                        className="sidebar-symbol"
                        aria-hidden="true"
                      >
                        <Icon size={19} strokeWidth={1.9} />
                      </span>

                      <span className="sidebar-link-label">
                        {item.label}
                      </span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-account">
          <strong>{admin?.name || "관리자"}</strong>
          <span className="sidebar-email">
            {admin?.email || ""}
          </span>
        </div>

        <button
          className="sidebar-logout"
          type="button"
          title="로그아웃"
          aria-label="로그아웃"
          onClick={() => void logout()}
        >
          <LogOut size={18} strokeWidth={1.9} />
          <span className="sidebar-logout-label">
            로그아웃
          </span>
        </button>
      </div>
    </aside>
  );
}
