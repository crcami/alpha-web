import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "../auth/ProtectedRoute";
import { LandingPage } from "../pages/LandingPage";
import { AuthPage } from "../pages/AuthPage";
import { ResetPasswordPage } from "../pages/ResetPasswordPage";
import { DashboardLayout } from "../pages/DashboardLayout";
import { ProductsPage } from "../pages/ProductsPage";
import { RawMaterialsPage } from "../pages/RawMaterialsPage";
import { ProductionPage } from "../pages/ProductionPage";
import { ProfilePage } from "../pages/ProfilePage";
import { NotFoundPage } from "../pages/NotFoundPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/app/products" replace />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="raw-materials" element={<RawMaterialsPage />} />
          <Route path="production" element={<ProductionPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
