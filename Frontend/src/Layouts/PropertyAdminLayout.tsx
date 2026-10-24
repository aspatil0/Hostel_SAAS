import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, Building2, ShieldCheck } from 'lucide-react';

import { PropertyAdminSidebar } from '@/components/Navigation/PropertyAdminSidebar';
import { useAuth } from '@/context/AuthContext';

export function PropertyAdminLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const getPageTitle = () => {
    if (location.pathname.includes('/property-admin/students')) {
      return 'Student Residents Management';
    }
    if (location.pathname.includes('/property-admin/rent')) {
      return 'Rent Collection & Dues Ledger';
    }
    if (location.pathname.includes('/property-admin/occupancy')) {
      return 'Live Room & Bed Allocation Matrix';
    }
    if (location.pathname.includes('/property-admin/profile')) {
      return 'Hostel & Manager Profile';
    }
    return 'Hostel Operations Overview';
  };

  const hostelName = 'Grand Skyline Premier Hostel';

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F6F9] text-[#172B45] transition-colors duration-250 dark:bg-[#0A0D14] dark:text-slate-100">
      {/* 1. Property Admin Dedicated Sidebar */}
      <PropertyAdminSidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* 2. Main Content Frame */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#E2E8F0] bg-white px-4 md:px-8 transition-colors duration-250 dark:border-[#1F2E45] dark:bg-[#121824]">
          {/* Mobile Toggle & Title */}
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
                <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-3 w-3" /> Property Portal
                </span>
              </div>
              <p className="hidden md:flex items-center gap-1.5 text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                <Building2 className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                <span className="font-semibold text-[#172B45] dark:text-slate-300">{hostelName}</span>
                <span>• Mumbai, Maharashtra</span>
              </p>
            </div>
          </div>

          {/* Right Header: Manager Pill */}
          <div className="flex items-center gap-2.5 text-xs">
            <div className="hidden sm:block text-right">
              <p className="font-bold text-[#172B45] dark:text-white leading-tight">
                {user?.name || 'Rahul Sharma'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Authorized Property Manager
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs">
              {(user?.name || 'Rahul Sharma').charAt(0)}
            </div>
          </div>
        </header>

        {/* Scrollable Main Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}