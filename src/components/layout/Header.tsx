
import "./Header.css"


export function Header(){
    return (
        <div className="flex items-center gap-1 header">
            <div className="flex-1">통합검색</div>
            <div>새견적</div>
            <div className="notification">
                <button>알림</button>
                <span>3</span>
            </div>
        </div>
        
    )
}