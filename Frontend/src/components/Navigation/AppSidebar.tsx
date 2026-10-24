import {
  Building2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  LayoutDashboard,
  Users,
  Megaphone,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface AppSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

const navItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Properties', path: '/admin/properties', icon: Building2 },
  { label: 'Property Admins', path: '/admin/admins', icon: Users },
  { label: 'Marketing & Ads', path: '/admin/marketing', icon: Megaphone },
];

export function AppSidebar({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}: AppSidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const displayName = user?.name || 'Aditya Raj Patil';
  const displayEmail = user?.email || 'dt.adittarajpatil@gmail.com';

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  const sidebarWidth = isCollapsed ? 'w-20' : 'w-64';

  return (
    <>
      {/* 1. Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* 2. Sidebar Container */}
      <aside
        className={`
          fixed left-0 top-0 z-40 flex h-screen flex-col
          border-r border-[#1E3A5F] bg-[#0D1F36] text-white
          transition-all duration-300 ease-in-out
          dark:border-[#141F32] dark:bg-[#070D18]
          ${sidebarWidth}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:static md:translate-x-0 md:shrink-0
        `}
      >
        {/* Part A: Header */}
        <div
          className={`flex h-16 shrink-0 items-center border-b border-[#1E3A5F] dark:border-[#141F32] ${
            isCollapsed ? 'justify-center px-2' : 'justify-between px-4'
          }`}
        >
          {!isCollapsed ? (
            <>
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
                  <Building2 className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <h1 className="text-base font-bold tracking-tight">HostelOS</h1>
                  <span className="inline-flex rounded bg-indigo-500/15 px-1.5 py-0.5 text-[10px] font-medium text-indigo-300">
                    Super Admin
                  </span>
                </div>
              </div>

              {/* Desktop Collapse Button */}
              <button
                type="button"
                onClick={onToggleCollapse}
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
                className="hidden rounded-lg p-1.5 text-slate-400 transition hover:bg-[#142D4E] hover:text-white md:inline-flex cursor-pointer"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </>
          ) : (
            /* Collapsed Header: Expandable Logo Button */
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label="Expand sidebar"
              title="Click to expand sidebar"
              className="group flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400 transition hover:bg-indigo-600 hover:text-white cursor-pointer"
            >
              <Building2 className="h-5 w-5 group-hover:hidden" />
              <ChevronRight className="hidden h-5 w-5 group-hover:block" />
            </button>
          )}
        </div>

        {/* Part B: Navigation Links */}
        <nav
          aria-label="Super Admin navigation"
          className="flex-1 space-y-1.5 overflow-y-auto px-2 py-4"
        >
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                title={isCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  isCollapsed
                    ? `
                      flex h-10 w-10 mx-auto items-center justify-center rounded-xl transition-all duration-200
                      ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : 'text-[#94A3B8] hover:bg-[#142D4E] hover:text-white'
                      }
                    `
                    : `
                      flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200
                      ${
                        isActive
                          ? 'border-l-4 border-indigo-500 bg-[#142D4E] font-semibold text-white shadow-xs dark:bg-[#111E30]'
                          : 'border-l-4 border-transparent text-[#94A3B8] hover:bg-[#142D4E]/60 hover:text-white'
                      }
                    `
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Part C: Theme Option in Sidebar */}
        <div className="border-t border-[#1E3A5F] px-3 py-2.5 dark:border-[#141F32]">
          {!isCollapsed ? (
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Theme
              </span>
              <ThemeToggle variant="segmented" />
            </div>
          ) : (
            <div className="flex justify-center">
              <ThemeToggle variant="icon" />
            </div>
          )}
        </div>

        {/* Part D: User Identity & Logout */}
        <div className="border-t border-[#1E3A5F] p-3 dark:border-[#141F32]">
          {!isCollapsed ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-300 ring-1 ring-indigo-400/30">
                  {initials || 'SA'}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-white">
                    {displayName}
                  </p>
                  <p className="truncate text-[10px] text-slate-400">
                    {displayEmail}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                title="Sign out"
                aria-label="Sign out"
                className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-400 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            /* Collapsed Footer: Avatar on top, Logout button centered below (No overlapping!) */
            <div className="flex flex-col items-center gap-2">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-300 ring-1 ring-indigo-400/30"
                title={`${displayName} (${displayEmail})`}
              >
                {initials || 'SA'}
              </div>

              <button
                type="button"
                onClick={handleLogout}
                title="Sign out"
                aria-label="Sign out"
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-500/15 hover:text-rose-400 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
