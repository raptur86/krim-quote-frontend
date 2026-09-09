import { NavLink } from "react-router-dom";

import { ROUTES } from "../../app/router/routes";

import "./Sidebar.css"
import { useAuth } from "../../features/auth/useAuth";

export function Sidebar(){
    const { admin, logout } = useAuth();
    const menuItems = [
        {label:"대시보드", path: ROUTES.dashboard },
        {label:"고객관리", path: ROUTES.customers },
        {label:"표준단가", path: ROUTES.rates },
        {label:"플랫폼", path: ROUTES.platforms },
        {label:"견적관리", path: ROUTES.quotes },
        {label:"매출관리", path: ROUTES.sales },
        {label:"설정", path: ROUTES.settings },
    ];
    return (
        
            <div className="sidebar flex flex-column">
                <div className="sidebar-top">로고</div>
                <nav className="flex-1">
                    <ul>
                        {menuItems.map((menu)=>(
                            <li key={menu.path}>
                                <NavLink to={menu.path} className={( {isActive} ) => 
                                        isActive ? "sidebar-link active" : "sidebar-link"}>
                                    {menu.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="sidebar-bottom">
                    <p>{admin?.name}</p>
                    <p className="sidebar-email">{admin?.email}</p>
                    <button className="sidebar-logout" type="button" onClick={() => void logout()}>로그아웃</button>
                </div>
            </div>
        
    )
}
