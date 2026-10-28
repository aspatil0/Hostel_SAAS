import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

// Layouts
import { SuperAdminLayout } from "./Layouts/SuperAdminLayout";
import { PropertyAdminLayout } from "./Layouts/PropertyAdminLayout";

// Auth Pages
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { SuperAdminLoginPage } from "./pages/auth/Super_Admin/SuperAdminLoginPage";
import { PropertyAdminLoginPage } from "./pages/auth/Property_Admin/PropertyAdminLoginPage";

// Super Admin Pages
import { DashboardPage } from "./pages/auth/Super_Admin/DashboardPage";
import { PropertiesPage } from "./pages/auth/Super_Admin/PropertiesPage";
import { PropertyAdminsPage } from "./pages/auth/Super_Admin/PropertyAdminsPage";
import { MarketingPage } from "./pages/auth/Super_Admin/MarketingPage";

// Property Admin Operational Pages
import { PropertyDashboardPage } from "./pages/auth/Property_Admin/PropertyDashboardPage";
import { StudentsPage } from "./pages/auth/Property_Admin/StudentsPage";
import { RentPage } from "./pages/auth/Property_Admin/RentPage";
import { RoomMatrixPage } from "./pages/auth/Property_Admin/RoomMatrixPage";
import { ProfilePage } from "./pages/auth/Property_Admin/ProfilePage";

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* 1. Public Authentication Routes (Separated Portals) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin/login" element={<SuperAdminLoginPage />} />
            <Route path="/property-admin/login" element={<PropertyAdminLoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* 2. Super Admin Layout & Nested Routes */}
            <Route element={<SuperAdminLayout />}>
              <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={<DashboardPage />} />
              <Route path="/admin/properties" element={<PropertiesPage />} />
              <Route path="/admin/admins" element={<PropertyAdminsPage />} />
              <Route path="/admin/marketing" element={<MarketingPage />} />
            </Route>

            {/* 3. Property Admin Layout & Dedicated Operational Routes */}
            <Route element={<PropertyAdminLayout />}>
              <Route path="/property-admin" element={<Navigate to="/property-admin/dashboard" replace />} />
              <Route path="/property-admin/dashboard" element={<PropertyDashboardPage />} />
              <Route path="/property-admin/students" element={<StudentsPage />} />
              <Route path="/property-admin/rent" element={<RentPage />} />
              <Route path="/property-admin/occupancy" element={<RoomMatrixPage />} />
              <Route path="/property-admin/profile" element={<ProfilePage />} />
            </Route>

            {/* 4. Catch-all Fallback */}
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
