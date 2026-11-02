export type StatusType =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'frozen'
  | 'suspended'
  | string;

export interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  showDot?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  label,
  showDot = true,
  className = '',
}: StatusBadgeProps) {
  const normalized = (status || '').toLowerCase();

  let badgeStyle = 'bg-slate-100 text-[#172B45] border-[#E2E8F0] dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700';
  let dotStyle = 'bg-slate-400 dark:bg-slate-400';

  if (normalized === 'active' || normalized === 'approved') {
    badgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60';
    dotStyle = 'bg-emerald-600 dark:bg-emerald-400';
  } else if (normalized === 'pending' || normalized === 'in_progress') {
    badgeStyle = 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60';
    dotStyle = 'bg-amber-600 dark:bg-amber-400';
  } else if (
    normalized === 'inactive' ||
    normalized === 'frozen' ||
    normalized === 'suspended' ||
    normalized === 'cancelled'
  ) {
    badgeStyle = 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60';
    dotStyle = 'bg-rose-600 dark:bg-rose-400';
  }

  // Capitalize first letter of fallback label
  const displayLabel =
    label ||
    (status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : '');

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeStyle} ${className}`}
    >
      {showDot && <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotStyle}`} />}
      <span>{displayLabel}</span>
    </span>
  );
}
