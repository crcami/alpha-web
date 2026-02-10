import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { Menu } from "lucide-react";
import { useState } from "react";

export function DashboardLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="dashboard-wrapper">
      <button
        className="mobile-menu-toggle"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Abrir menu"
        type="button"
      >
        <Menu size={24} />
      </button>

      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
}
