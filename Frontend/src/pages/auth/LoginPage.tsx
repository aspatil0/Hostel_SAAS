import { useState, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AuthLayout } from "./AuthLayout";
import { SUPER_ADMIN_CREDENTIALS } from "@/services/authService";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const destination = location.state?.from?.pathname || "/admin/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      await login({ email: email.trim(), password });
      navigate(destination, { replace: true });
    } catch (err: any) {
      setError(err?.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillSuperAdminCredentials = () => {
    setEmail(SUPER_ADMIN_CREDENTIALS.email);
    setPassword(SUPER_ADMIN_CREDENTIALS.password);
    setError("");
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your HostelOS account to manage properties"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Quick Autofill for Super Admin Credentials */}
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-3 text-xs text-indigo-950">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-semibold text-indigo-900">
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
              Super Admin Credentials:
            </span>
            <button
              type="button"
              onClick={handleFillSuperAdminCredentials}
              className="rounded-lg bg-indigo-600 px-2 py-0.5 font-semibold text-white transition hover:bg-indigo-700 cursor-pointer"
            >
              Fill Credentials
            </button>
          </div>
          <div className="mt-1 text-[11px] text-indigo-800 space-y-0.5">
            <p><strong>Username:</strong> {SUPER_ADMIN_CREDENTIALS.email}</p>
            <p><strong>Password:</strong> {SUPER_ADMIN_CREDENTIALS.password}</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <p>{error}</p>
          </div>
        )}

        {/* Email Field */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Email address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="dt.adittarajpatil@gmail.com"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isLoading ? "Signing in..." : "Sign in"}
        </button>

        {/* Register Link */}
        <p className="text-center text-xs text-slate-500">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
          >
            Create account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
