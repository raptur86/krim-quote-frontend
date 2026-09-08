import { NavLink } from "react-router-dom";

import { ROUTES } from "../../app/router/routes";

export function Sidebar(){
    return (
        
            <div className="sidebar">
                <div>로고</div>
                <nav>
                    <ul>
                        <li>
                            <NavLink to= {ROUTES.dashboard} className={( {isActive} ) => 
                                    isActive ? "sidebar-link active" : "sidebar-link"}>
                                대시보드
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to= {ROUTES.customers} className={( {isActive} ) => 
                                    isActive ? "sidebar-link active" : "sidebar-link"}>
                                고객관리
                            </NavLink>
                        </li>
                        <li>표준단가</li>
                        <li>플랫폼</li>
                        <li>
                            <NavLink to= {ROUTES.quotes} className={( {isActive} ) => 
                                    isActive ? "sidebar-link active" : "sidebar-link"}>
                                견적관리
                            </NavLink>
                        </li>
                        <li>매출관리</li>
                        <li>설정</li>
                    </ul>
                </nav>
            </div>
        
    )
}