import { Link } from "react-router-dom";
import { ShieldCheck, Building2, ArrowRight, Sparkles, KeyRound } from "lucide-react";
import { AuthLayout } from "./AuthLayout";

export function LoginPage() {
  return (
    <AuthLayout
      title="HostelOS Sign-In Gateway"
      subtitle="Please select your dedicated administrative portal to continue."
    >
      <div className="space-y-4">
        {/* 1. Property Admin Entrance Card */}
        <Link
          to="/property-admin/login"
          className="group block rounded-2xl border-2 border-emerald-500/30 bg-emerald-50/40 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-500 hover:bg-emerald-50/80 hover:shadow-lg hover:shadow-emerald-500/10 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:hover:border-emerald-500/80"
        >
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
              <Building2 className="h-6 w-6" />
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
              Hostel / PG Managers
            </span>
          </div>

          <div className="mt-4">
            <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-400">
              Property Admin Portal
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              For hostel managers and wardens. Manage student admissions, live room/bed occupancy, monthly rent dues, and hostel profiles.
            </p>
          </div>

          <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <span>Proceed to Property Login</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        {/* 2. Super Admin Entrance Card */}
        <Link
          to="/admin/login"
          className="group block rounded-2xl border-2 border-indigo-500/30 bg-indigo-50/40 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-600 hover:bg-indigo-50/80 hover:shadow-lg hover:shadow-indigo-500/10 dark:border-indigo-900/40 dark:bg-indigo-950/20 dark:hover:border-indigo-500/80"
        >
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600/10 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
              Platform Owners
            </span>
          </div>

          <div className="mt-4">
            <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-700 dark:text-white dark:group-hover:text-indigo-400">
              Super Admin Portal
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              For system platform administrators. Register hostels, generate manager portal credentials, and manage social marketing campaigns.
            </p>
          </div>

          <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
            <span>Proceed to Super Admin Login</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </div>
    </AuthLayout>
  );
}
