import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  GraduationCap,
  ArrowRight,
  Sparkles,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout } from '../AuthLayout';
import { STUDENT_CREDENTIALS } from '@/services/authService';

export function StudentLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter your student email and password');
      return;
    }

    setIsLoading(true);
    try {
      await login({ email: email.trim(), password });
      navigate('/student/dashboard', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Invalid student credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoStudent = () => {
    setEmail(STUDENT_CREDENTIALS.email);
    setPassword(STUDENT_CREDENTIALS.password);
    setError('');
  };

  return (
    <AuthLayout
      variant="student"
      title="Student Resident Portal"
      subtitle="Sign in to view your room allotment, check fee dues, apply for leave, and submit complaints."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <p>{error}</p>
          </div>
        )}

        {/* Quick Demo Fill Card */}
        <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-xs dark:border-blue-900/40 dark:bg-blue-950/30">
          <div>
            <span className="font-bold text-blue-900 dark:text-blue-300">Demo Resident Account</span>
            <p className="text-[11px] text-blue-700 dark:text-blue-400">
              {STUDENT_CREDENTIALS.email}
            </p>
          </div>
          <button
            type="button"
            onClick={fillDemoStudent}
            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs hover:bg-blue-700 cursor-pointer"
          >
            <Sparkles className="h-3 w-3" /> Auto-fill
          </button>
        </div>

        {/* Email Field */}
        <div>
          <label
            htmlFor="student-email"
            className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
          >
            Registered Student Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="student-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. student@hostel.edu"
              autoComplete="email"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="student-password"
            className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
          >
            Portal Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="student-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-10 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
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
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-semibold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isLoading ? 'Authenticating Resident Session…' : 'Sign In to Student Portal'}
        </button>

        {/* Switchers to other portals */}
        <div className="mt-6 space-y-2 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3 text-center dark:border-slate-800 dark:bg-slate-800/40">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Hostel Owner, Manager, or Warden 
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            <Link
              to="/property-admin/login"
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              <Building2 className="h-3.5 w-3.5" /> Switch to Property Admin Portal <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
}

