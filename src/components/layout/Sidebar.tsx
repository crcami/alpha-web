import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Package,
  Layers,
  Factory,
  User,
  LogOut,
  Sun,
  Moon,
  Ruler,
} from "lucide-react";
import { useContext } from "react";
import { AuthContext } from "../../auth/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import logoAlpha from "../../assets/images/logo-alpha.png";
import logoLight from "../../assets/images/logo-ligth.png";

import "../../css/Sidebar.css";

interface SidebarProps {
  isMobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isMobileOpen, onClose }: SidebarProps) {
  const { logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/auth");
  }

  const currentLogo = theme === "dark" ? logoAlpha : logoLight;

  return (
    <>
      <aside className={`sidebar ${isMobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-header">
          <Link to="/app/products" className="sidebar-brand" onClick={onClose}>
            <img src={currentLogo} alt="Alpha Steel" className="sidebar-logo" />
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
            to="/app/units-of-measure"
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
            onClick={onClose}
          >
            <Ruler size={20} />
            <span>Unidades de Medida</span>
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
          <button
            type="button"
            className="sidebar-theme-toggle"
            onClick={toggleTheme}
            title={`Mudar para tema ${theme === "light" ? "escuro" : "claro"}`}
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            <span>{theme === "light" ? "Modo Escuro" : "Modo Claro"}</span>
          </button>

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
