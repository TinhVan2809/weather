
import { NavLink, useNavigate, useLocation } from "react-router-dom";
function Navbar () {
    const navigate = useNavigate();
    const location = useLocation();

    const isSettingsActive = location.pathname.startsWith('/theme');
   
    
    return (

        <>
        <nav className="nav-container">
            <div className="nav-links">
                <NavLink className={({ isActive }) =>  isActive ? 'nav-link-active' : ''}  to="/">Home</NavLink>
                <NavLink className={({ isActive }) =>  isActive ? 'nav-link-active' : ''}  to="/du-bao">Dự báo</NavLink>
                <div className="nav-title">
                    <p>Weather Forecast</p>
                </div>
                <NavLink className={({ isActive }) =>  isActive ? 'nav-link-active' : ''}  to="/lich-su">Lịch sử</NavLink>
                    <div className="setting-container">
                        <a className={isSettingsActive ? 'nav-link-active' : ''}>Cài đặt</a>
                        <div className="setting">
                            <ul> 
                                <li onClick={() => navigate('/theme')}>Theme</li>
                                <li>Unit</li>
                                <li>Language</li>
                                <li>About</li>
                            </ul>
                        </div>
                    </div>
            </div>
      </nav>
        </>
    );
}

export default Navbar;