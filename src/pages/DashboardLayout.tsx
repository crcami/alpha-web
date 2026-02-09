import { Outlet } from "react-router-dom";
import { TopNav } from "../components/layout/TopNav";

export function DashboardLayout() {
  return (
    <div className="dashboard">
      <TopNav />
      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
}
