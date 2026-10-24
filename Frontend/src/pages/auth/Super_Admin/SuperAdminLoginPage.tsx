import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  Building2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AuthLayout } from "../AuthLayout";
import { SUPER_ADMIN_CREDENTIALS } from "@/services/authService";

export function SuperAdminLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your Super Admin email and password");
      return;
    }

    setIsLoading(true);
    try {
      await login({ email: email.trim(), password });
      navigate("/admin/dashboard", { replace: true });
    } catch (err: any) {
      setError(err?.message || "Invalid Super Admin credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      variant="super_admin"
      title="Super Admin Portal"
      subtitle="Authorized platform owners only. Enter master credentials to access system controls."
    >
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <p>{error}</p>
          </div>
        )}

        {/* Email Field */}
        <div>
          <label
            htmlFor="superadmin-email"
            className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
          >
            Master Email Address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="superadmin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="superadmin@hostelos.com"
              autoComplete="email"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="superadmin-password"
            className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
          >
            Master Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="superadmin-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-10 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isLoading ? "Authenticating Master Session…" : "Sign In to Super Admin Dashboard"}
        </button>

        {/* Switcher to Property Admin Portal */}
        <div className="mt-6 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3 text-center dark:border-slate-800 dark:bg-slate-800/40">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Are you a Hostel / PG Manager or Owner?
          </p>
          <Link
            to="/property-admin/login"
            className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
          >
            <Building2 className="h-3.5 w-3.5" />
            Switch to Property Admin Login Portal <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
