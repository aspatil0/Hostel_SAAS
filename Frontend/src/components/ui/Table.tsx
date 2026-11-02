import { type ReactNode } from 'react';
import { Inbox } from 'lucide-react';

export interface Column<T> {
  id: string;
  header: string;
  accessor?: (item: T) => ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor?: (item: T) => string | number;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyExtractor = (item) => item.id || item._id,
  emptyTitle = 'No records found',
  emptyDescription = 'There is currently no data matching your query.',
  className = '',
}: DataTableProps<T>) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-[#E2E8F0] bg-white dark:border-[#1F2E45] dark:bg-[#121824]">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 mb-3 dark:bg-slate-800 dark:text-slate-500">
          <Inbox className="h-6 w-6" />
        </div>
        <h4 className="text-sm font-semibold text-[#172B45] dark:text-white">{emptyTitle}</h4>
        <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400 max-w-sm">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xs dark:border-[#1F2E45] dark:bg-[#121824] ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:border-[#1F2E45] dark:bg-[#162030] dark:text-slate-400">
              {columns.map((col) => (
                <th
                  key={col.id}
                  className={`px-4 py-3 ${
                    col.align === 'center'
                      ? 'text-center'
                      : col.align === 'right'
                      ? 'text-right'
                      : 'text-left'
                  } ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] text-sm text-[#172B45] dark:divide-[#1F2E45] dark:text-slate-200">
            {data.map((row, index) => (
              <tr
                key={keyExtractor(row) || index}
                className="transition-colors hover:bg-slate-50/70 dark:hover:bg-[#182335]"
              >
                {columns.map((col) => (
                  <td
                    key={col.id}
                    className={`px-4 py-3.5 align-middle ${
                      col.align === 'center'
                        ? 'text-center'
                        : col.align === 'right'
                        ? 'text-right'
                        : 'text-left'
                    } ${col.className || ''}`}
                  >
                    {col.accessor ? col.accessor(row) : row[col.id]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
