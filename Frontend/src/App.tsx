import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { SuperAdminLayout } from "./Layouts/SuperAdminLayout";
import { DashboardPage } from "./pages/auth/Super_Admin/DashboardPage";
import { PropertiesPage } from "./pages/auth/Super_Admin/PropertiesPage";
import { PropertyAdminsPage } from "./pages/auth/Super_Admin/PropertyAdminsPage";

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Super Admin Layout & Nested Routes */}
            <Route element={<SuperAdminLayout />}>
              <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={<DashboardPage />} />
              <Route path="/admin/properties" element={<PropertiesPage />} />
              <Route path="/admin/admins" element={<PropertyAdminsPage />} />
            </Route>

            {/* Catch-all Fallback */}
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
