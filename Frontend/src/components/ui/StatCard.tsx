import { type ComponentType } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: ComponentType<{ className?: string }>;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  className = '',
}: StatCardProps) {
  return (
    <div
      className={`rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs transition-all hover:shadow-sm dark:border-[#1F2E45] dark:bg-[#121824] ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
          {title}
        </span>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#142D4E]/8 text-[#142D4E] dark:bg-indigo-500/15 dark:text-indigo-400">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-[#172B45] dark:text-white">
          {value}
        </span>
        {trend && (
          <span
            className={`inline-flex items-center text-xs font-semibold ${
              trend.isPositive
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-rose-700 dark:text-rose-400'
            }`}
          >
            {trend.isPositive ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {trend.value}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
          {subtext}
        </p>
      )}
    </div>
  );
}
