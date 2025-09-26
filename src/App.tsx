import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import type { JSX } from "react";
import HomePage from "./pages/home/components/HomePage";
import LayoutComponent from "./components/layout";
import { ThemeProvider } from "./components/theme-provider";
import { useAuthStore } from "./pages/auth/lib/auth.store";
import LoginPage from "./pages/auth/components/Login";
import TypeUserPage from "./pages/type-users/components/TypeUserPage";
import UserPage from "./pages/users/components/UserPage";
import CompanyPage from "./pages/company/components/CompanyPage";
import BranchPage from "./pages/branch/components/BranchPage";
import WarehousePage from "./pages/warehouse/components/WarehousePage";
import BrandPage from "./pages/brand/components/BrandPage";
import BoxPage from "./pages/box/components/BoxPage";
import UnitPage from "./pages/unit/components/UnitPage";
import { TYPE_USER } from "./pages/type-users/lib/typeUser.interface";
import { USER } from "./pages/users/lib/User.interface";
import { COMPANY } from "./pages/company/lib/company.interface";
import { BRANCH } from "./pages/branch/lib/branch.interface";
import { WAREHOUSE } from "./pages/warehouse/lib/warehouse.interface";
import { BRAND } from "./pages/brand/lib/brand.interface";
import { BOX } from "./pages/box/lib/box.interface";
import { UNIT } from "./pages/unit/lib/unit.interface";
import type { Access } from "./pages/auth/lib/auth.interface";
import { ENABLE_PERMISSION_VALIDATION } from "./lib/permissions.config";

const { ROUTE: TypeUserRoute } = TYPE_USER;
const { ROUTE: UserRoute } = USER;
const { ROUTE: CompanyRoute } = COMPANY;
const { ROUTE: BranchRoute } = BRANCH;
const { ROUTE: WarehouseRoute } = WAREHOUSE;
const { ROUTE: BrandRoute } = BRAND;
const { ROUTE: BoxRoute } = BOX;
const { ROUTE: UnitRoute } = UNIT;

export const hasAccessToRoute = (access: Access[], route: string): boolean => {
  const transformRoute = route.split("/").pop();
  for (const node of access) {
    if (node.permissions.some((p) => p.routes.includes(transformRoute!))) {
      return true;
    }
    if (node.children && hasAccessToRoute(node.children, transformRoute!)) {
      return true;
    }
  }
  return false;
};

function ProtectedRoute({
  children,
  path,
}: {
  children: JSX.Element;
  path?: string;
}) {
  const { token, access } = useAuthStore();
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (path && ENABLE_PERMISSION_VALIDATION) {
    if (!access) {
      return <Navigate to="/inicio" replace />;
    }

    const hasAccess = hasAccessToRoute(access, path);
    if (!hasAccess) {
      return <Navigate to="/inicio" replace />;
    }
  }

  return <LayoutComponent>{children}</LayoutComponent>;
}

export default function App() {
  const { token } = useAuthStore();
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          {/* Ruta pública */}
          <Route
            path="/login"
            element={token ? <Navigate to="/inicio" /> : <LoginPage />}
          />

          {/* Ruta protegida */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/inicio"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />

          <Route
            path={TypeUserRoute}
            element={
              <ProtectedRoute path={TypeUserRoute}>
                <TypeUserPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={UserRoute}
            element={
              <ProtectedRoute path={UserRoute}>
                <UserPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={CompanyRoute}
            element={
              <ProtectedRoute path={CompanyRoute}>
                <CompanyPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={BranchRoute}
            element={
              <ProtectedRoute path={BranchRoute}>
                <BranchPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={WarehouseRoute}
            element={
              <ProtectedRoute path={WarehouseRoute}>
                <WarehousePage />
              </ProtectedRoute>
            }
          />

          <Route
            path={BrandRoute}
            element={
              <ProtectedRoute path={BrandRoute}>
                <BrandPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={BoxRoute}
            element={
              <ProtectedRoute path={BoxRoute}>
                <BoxPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={UnitRoute}
            element={
              <ProtectedRoute path={UnitRoute}>
                <UnitPage />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/inicio" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
