import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import type { JSX } from "react";
import HomePage from "./pages/home/components/HomePage";
import LayoutComponent from "./components/layout";
import { ThemeProvider } from "./components/theme-provider";
import { useAuthStore } from "./pages/auth/lib/auth.store";
import LoginPage from "./pages/auth/components/Login";
import TypeUserPage from "./pages/type-users/components/TypeUserPage";
import UserPage from "./pages/users/components/UserPage";
import { TYPE_USER } from "./pages/type-users/lib/typeUser.interface";
import { USER } from "./pages/users/lib/User.interface";

const { ROUTE: TypeUserRoute } = TYPE_USER;
const { ROUTE: UserRoute } = USER;

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { token } = useAuthStore();
  if (!token) {
    return <Navigate to="/login" replace />;
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
              <ProtectedRoute>
                <TypeUserPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={UserRoute}
            element={
              <ProtectedRoute>
                <UserPage />
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
