import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, ShieldCheck } from 'lucide-react';
import { AppSidebar } from '@/components/Navigation/AppSidebar';

export function SuperAdminLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  // Page title resolution for header
  const getPageTitle = () => {
    if (location.pathname.includes('/admin/properties')) {
      return 'Properties Management';
    }
    if (location.pathname.includes('/admin/admins')) {
      return 'Property Administrators';
    }
    if (location.pathname.includes('/admin/marketing')) {
      return 'Marketing & Campaign Hub';
    }
    return 'Super Admin Dashboard';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F6F9] text-[#172B45] transition-colors duration-250 dark:bg-[#0A0D14] dark:text-slate-100">
      {/* 1. Master Navigation Sidebar with Theme Option */}
      <AppSidebar
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
                <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-3 w-3" /> Live
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-[#64748B] dark:text-slate-400">
                HostelOS Platform Oversight
              </p>
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