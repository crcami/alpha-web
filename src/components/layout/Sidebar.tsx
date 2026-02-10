import { Link, NavLink, useNavigate } from "react-router-dom";
import { Package, Layers, Factory, User, LogOut } from "lucide-react";
import { useContext } from "react";
import { AuthContext } from "../../auth/AuthContext";
import logo from "../../assets/images/logo-alpha.png";

import "../../css/Sidebar.css";

interface SidebarProps {
  isMobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isMobileOpen, onClose }: SidebarProps) {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/auth");
  }

  return (
    <>
      <aside className={`sidebar ${isMobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-header">
          <Link to="/app/products" className="sidebar-brand" onClick={onClose}>
            <img src={logo} alt="Alpha Steel" className="sidebar-logo" />
          </Link>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/app/products"
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
            onClick={onClose}
          >
            <Package size={20} />
            <span>Produtos</span>
          </NavLink>

          <NavLink
            to="/app/raw-materials"
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
            onClick={onClose}
          >
            <Layers size={20} />
            <span>Matérias-Primas</span>
          </NavLink>

          <NavLink
            to="/app/production"
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
            onClick={onClose}
          >
            <Factory size={20} />
            <span>Produção</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <NavLink
            to="/app/profile"
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
            onClick={onClose}
          >
            <User size={20} />
            <span>Perfil</span>
          </NavLink>

          <button
            type="button"
            className="sidebar-logout"
            onClick={handleLogout}
            title="Sair"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {isMobileOpen && (
        <div
          className="sidebar-backdrop active"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
    </>
  );
}
