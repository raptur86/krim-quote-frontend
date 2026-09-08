import { NavLink } from "react-router-dom";

import { ROUTES } from "../../app/router/routes";

import "./Sidebar.css"

export function Sidebar(){
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
        
            <div className="sidebar">
                <div>로고</div>
                <nav>
                    <ul>
                        {menuItems.map((menu)=>(
                            <li>
                                <NavLink to= {menu.path} className={( {isActive} ) => 
                                        isActive ? "sidebar-link active" : "sidebar-link"}>
                                    {menu.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        
    )
}