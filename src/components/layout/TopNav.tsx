import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { useContext } from "react";
import { AuthContext } from "../../auth/AuthContext";
import logo from "../../assets/images/logo-alpha.png";

export function TopNav() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/auth");
  }

  return (
    <header className="topnav">
      <div className="topnav-left">
        <Link to="/app/products" className="brand">
          <img src={logo} alt="Alpha Steel" className="brand-logo" />
        </Link>

        <nav className="navlinks">
          <NavLink
            to="/app/products"
            className={({ isActive }) =>
              isActive ? "navlink active" : "navlink"
            }
          >
            Produtos
          </NavLink>
          <NavLink
            to="/app/raw-materials"
            className={({ isActive }) =>
              isActive ? "navlink active" : "navlink"
            }
          >
            Matérias-primas
          </NavLink>
          <NavLink
            to="/app/production"
            className={({ isActive }) =>
              isActive ? "navlink active" : "navlink"
            }
          >
            Produção
          </NavLink>
        </nav>
      </div>

      <div className="topnav-right">
        <Link to="/app/profile" className="iconbtn" aria-label="Profile">
          <User size={18} />
        </Link>
        <button type="button" className="btn danger" onClick={handleLogout}>
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </header>
  );
}
