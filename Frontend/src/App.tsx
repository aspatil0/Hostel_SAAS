import { BrowserRouter,Routes,Route,Navigate } from "react-router-dom";
import { AuthProvider , useAuth } from "./context/AuthContext";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

export function DashboardPlaceholder() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 p-6 text-center">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome to Hostel OS, {user?.name}!
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Logged in as: <span className="font-semibold text-indigo-600">{user?.role}</span> ({user?.email})
        </p>
        <button
          onClick={logout}
          className="mt-6 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-700"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

export function App() {
  return (
   <AuthProvider>
  <BrowserRouter>
    <Routes>
      {/* 1. Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      {/* 2. Protected Routes (Requires Login) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardPlaceholder />} />
        {/* Future routes: /properties, /admins, etc. will go here */}
      </Route>
      {/* 3. Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
</AuthProvider>

  );
}

export default App;
