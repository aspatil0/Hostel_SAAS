import type { ReactNode } from 'react';
import { Building2, GraduationCap } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  reverse?: boolean;
  variant?: 'super_admin' | 'property_admin' | 'student';
}

export function AuthLayout({
  children,
  title,
  subtitle,
  reverse = false,
  variant = 'super_admin',
}: AuthLayoutProps) {
  const isProperty = variant === 'property_admin';
  const isStudent = variant === 'student';

  const getBackgroundGradient = () => {
    if (isProperty) return 'bg-gradient-to-br from-emerald-800 via-teal-900 to-[#0D1F36]';
    if (isStudent) return 'bg-gradient-to-br from-blue-800 via-indigo-900 to-[#0A0E1A]';
    return 'bg-gradient-to-br from-[#0D1F36] via-[#142D4E] to-indigo-950';
  };

  const getPortalLabel = () => {
    if (isProperty) return 'Property Manager Portal';
    if (isStudent) return 'Student Resident Portal';
    return 'Super Admin Master Suite';
  };

  const getBadgeText = () => {
    if (isProperty) return '🏨 Hostel Operations & PMS';
    if (isStudent) return '🎓 Campus Resident Living';
    return '🛡️ Platform Governance';
  };

  const getHeadline = () => {
    if (isProperty) {
      return (
        <>
          Live Rooms.
          <br />
          Effortless Hostel Care.
        </>
      );
    }
    if (isStudent) {
      return (
        <>
          Your Hostel Life.
          <br />
          In One Smart Place.
        </>
      );
    }
    return (
      <>
        Multi-Hostel SaaS.
        <br />
        Total Platform Control.
      </>
    );
  };

  const getDescription = () => {
    if (isProperty) {
      return 'Manage student check-ins, live room & bed occupancy, monthly rent dues, and house maintenance with ease.';
    }
    if (isStudent) {
      return 'Track monthly fee dues, pay online in demo mode, apply for digital leave passes, and lodge maintenance complaints directly with wardens.';
    }
    return 'Monitor registered hostels, assign manager portal credentials, control viral marketing ads, and view nationwide revenue.';
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 dark:bg-[#070D18]">
      <div
        className={`grid w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-[#121824] md:grid-cols-2 md:min-h-[640px] ${
          reverse ? 'md:[&>*:first-child]:order-2' : ''
        }`}
      >
        <div
          className={`relative flex h-full flex-col justify-between overflow-hidden p-8 text-white sm:p-12 ${getBackgroundGradient()}`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
              {isStudent ? <GraduationCap size={28} /> : <Building2 size={28} />}
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight">Hostel OS</h1>
              <p className="text-xs uppercase tracking-wider text-slate-300">
                {getPortalLabel()}
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              {getBadgeText()}
            </span>

            <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
              {getHeadline()}
            </h2>

            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-200 sm:text-base">
              {getDescription()}
            </p>
          </div>

          <p className="mt-10 text-xs text-slate-300">
            © {new Date().getFullYear()} Hostel OS Enterprise. All rights reserved.
          </p>

          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />
        </div>

        <div className="flex h-full items-center justify-center p-6 sm:p-10 md:p-12">
          <div className="w-full max-w-md">
            {(title || subtitle) && (
              <div className="mb-8">
                {title && (
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                    {title}
                  </h2>
                )}

                {subtitle && (
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    {subtitle}
                  </p>
                )}
              </div>
            )}

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
