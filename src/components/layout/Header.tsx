
import { Link, useLocation } from "react-router-dom";
import { Menu, Plus } from "lucide-react";

import { ROUTES } from "../../app/router/routes";
import "./Header.css";

type HeaderProps = {
  onMenuClick?: () => void;
};

const labels: Record<string, string> = {
  [ROUTES.dashboard]: "대시보드",
  [ROUTES.customers]: "고객 관리",
  [ROUTES.quotes]: "견적 관리",
  [ROUTES.rates]: "표준단가",
  [ROUTES.platforms]: "플랫폼",
  [ROUTES.sales]: "매출 관리",
  [ROUTES.business]: "사업자 정보",
  [ROUTES.settings]: "설정",
  [ROUTES.costSettings]: "사업 원가 설정",
};

export function Header({ onMenuClick }: HeaderProps) {
  const { pathname } = useLocation();

  const title =
    labels[pathname] ??
    (pathname.startsWith(ROUTES.quotes + "/")
      ? "견적 관리"
      : pathname.startsWith(ROUTES.customers + "/")
        ? "고객 관리"
        : "KRIM Quote");

  return (
    <header className="header">
      <div className="header-leading">
        <button
          type="button"
          className="header-menu-button"
          aria-label="메뉴 열기"
          onClick={onMenuClick}
        >
          <Menu size={21} strokeWidth={2} />
        </button>

        <span className="header-page-title">
          {title}
        </span>
      </div>

      <Link
        className="header-new-quote"
        to={ROUTES.quoteCreate}
      >
        <Plus size={17} strokeWidth={2.3} />
        <span>새 견적</span>
      </Link>
    </header>
  );
}
