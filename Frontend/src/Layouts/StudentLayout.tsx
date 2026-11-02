import { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Menu, GraduationCap, ShieldCheck, CreditCard, Bell, Building2 } from 'lucide-react';
import { StudentSidebar } from '@/components/Navigation/StudentSidebar';
import { useAuth } from '@/context/AuthContext';

export function StudentLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const getPageTitle = () => {
    if (location.pathname.includes('/student/fees')) return 'My Fees & Dues';
    if (location.pathname.includes('/student/leaves')) return 'Leave Applications';
    if (location.pathname.includes('/student/complaints')) return 'Complaints & Requests';
    if (location.pathname.includes('/student/contact')) return 'Hostel Information & Contacts';
    if (location.pathname.includes('/student/profile')) return 'My Resident Profile';
    return 'Resident Student Dashboard';
  };

  const roomBadge = user?.roomNumber ? `Room ${user.roomNumber}` : 'Room 101';
  const bedBadge = user?.bedNumber ? `(${user.bedNumber})` : '(Bed A)';

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F6F9] text-[#172B45] transition-colors duration-250 dark:bg-[#0A0D14] dark:text-slate-100">
      {/* 1. Student Portal Navigation Sidebar */}
      <StudentSidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* 2. Main Content Frame */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#E2E8F0] bg-white px-4 md:px-8 transition-colors duration-250 dark:border-[#1F2E45] dark:bg-[#121824]">
          {/* Mobile Toggle & Page Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-1.5 text-[#172B45] hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-[#1A2332] md:hidden cursor-pointer"
              onClick={() => setIsMobileOpen(true)}
              aria-label="Open sidebar menu"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#172B45] dark:text-white">
                  {getPageTitle()}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                  <GraduationCap className="h-3 w-3" /> Resident Portal
                </span>
              </div>
              <div className="hidden md:flex items-center gap-1.5 text-[11px] text-[#64748B] dark:text-slate-400">
                <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
                <span>Hostel: <strong className="font-semibold text-slate-700 dark:text-slate-200">{user?.propertyName || 'Grand Skyline Premier Hostel'}</strong></span>
                <span>•</span>
                <span>{roomBadge} {bedBadge}</span>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/student/fees"
              className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/70 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-all hover:bg-blue-100 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300"
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Pay Dues</span>
            </Link>

            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" /> Active Resident
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
export default StudentLayout;

