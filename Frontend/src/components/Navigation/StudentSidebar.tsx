import {
  Home,
  CreditCard,
  CalendarClock,
  MessageSquareWarning,
  PhoneCall,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Sparkles,
  Building2,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface StudentSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const studentNavItems = [
  { label: 'Home', path: '/student/dashboard', icon: Home },
  { label: 'Fees & Dues', path: '/student/fees', icon: CreditCard },
  { label: 'Leave Passes', path: '/student/leaves', icon: CalendarClock },
  { label: 'Complaints', path: '/student/complaints', icon: MessageSquareWarning },
  { label: 'Contact Hostel', path: '/student/contact', icon: PhoneCall },
  { label: 'My Profile', path: '/student/profile', icon: User },
];

export function StudentSidebar({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}: StudentSidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const displayName =
    user?.name && user.name !== 'Unassigned' ? user.name : 'Aarav Mehta';
  const displayEmail =
    user?.email && !user.email.includes('unassigned')
      ? user.email
      : 'aarav.mehta@iitb.ac.in';
  const roomInfo = user?.roomNumber ? `Room ${user.roomNumber} (${user.bedNumber || 'Bed A'})` : 'Room 101 (Bed A)';
  const hostelName = user?.propertyName || 'Grand Skyline Premier Hostel';

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
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full flex-col justify-between border-r border-[#E2E8F0] bg-white transition-all duration-300 dark:border-[#1F2E45] dark:bg-[#121824] md:sticky md:top-0 md:h-screen ${sidebarWidth} ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header Brand */}
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#E2E8F0] px-4 dark:border-[#1F2E45]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25">
                <GraduationCap className="h-5 w-5" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-extrabold tracking-tight text-[#172B45] dark:text-white leading-tight">
                    Hostel OS
                  </span>
                  <span className="text-[9.5px] font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400 whitespace-nowrap">
                    Student Resident Portal
                  </span>
                </div>
              )}
            </div>

            {/* Collapse toggle (Desktop only) */}
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-[#1A2332] dark:hover:text-slate-200 md:block cursor-pointer shrink-0"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          {/* Student Status Badge (when expanded) */}
          {!isCollapsed && (
            <div className="mx-3 mt-3 shrink-0 rounded-xl border border-blue-100 bg-blue-50/70 p-3 dark:border-blue-900/40 dark:bg-blue-950/20">
              <div className="flex items-center justify-between text-[10px] text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <Building2 className="h-3 w-3 shrink-0" /> Hostel / Campus
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                  <Sparkles className="h-2 w-2" /> Resident
                </span>
              </div>
              <p className="mt-1 text-xs font-bold text-slate-900 dark:text-white truncate" title={hostelName}>
                {hostelName}
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-blue-700 dark:text-blue-400 truncate">
                {roomInfo}
              </p>
            </div>
          )}

          {/* Nav List (scrollable) */}
          <nav className="mt-3 flex-1 space-y-1 overflow-y-auto px-3">
            {studentNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/20'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-[#1A2332] dark:hover:text-white'
                    } ${isCollapsed ? 'justify-center px-2' : ''}`
                  }
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Area */}
        <div className="shrink-0 bg-white dark:bg-[#121824]">
          {/* Part A: Theme Option in dedicated row */}
          <div className="border-t border-[#E2E8F0] px-3.5 py-2.5 dark:border-[#1F2E45]">
            {!isCollapsed ? (
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
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

          {/* Part B: User Identity & Logout in dedicated row */}
          <div className="border-t border-[#E2E8F0] p-3 dark:border-[#1F2E45]">
            {!isCollapsed ? (
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 font-bold text-xs text-white shadow-xs"
                    title={displayName}
                  >
                    {initials || 'ST'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-900 dark:text-white" title={displayName}>
                      {displayName}
                    </p>
                    <p className="truncate text-[10px] text-slate-500 dark:text-slate-400" title={displayEmail}>
                      {displayEmail}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign out"
                  aria-label="Sign out"
                  className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 font-bold text-xs text-white shadow-xs"
                  title={`${displayName} (${displayEmail})`}
                >
                  {initials || 'ST'}
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign out"
                  aria-label="Sign out"
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

