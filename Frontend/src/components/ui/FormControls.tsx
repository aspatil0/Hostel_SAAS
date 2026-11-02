import {
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
  forwardRef,
} from 'react';
import { ChevronDown } from 'lucide-react';

/* ---------------- FormField Wrapper ---------------- */
export interface FormFieldProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export function FormField({
  label,
  error,
  hint,
  required,
  className = '',
  children,
}: FormFieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-[#172B45] dark:text-slate-200">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      {children}
      {hint && !error && (
        <p className="text-xs text-[#64748B] dark:text-slate-400">{hint}</p>
      )}
      {error && (
        <p className="text-xs font-medium text-rose-600 dark:text-rose-400 animate-in fade-in">
          {error}
        </p>
      )}
    </div>
  );
}

/* ---------------- Styled Input ---------------- */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ leftIcon, rightIcon, error, className = '', disabled, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {leftIcon && (
          <div className="pointer-events-none absolute left-3.5 text-slate-400">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          disabled={disabled}
          className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-[#172B45] placeholder:text-slate-400 shadow-xs transition-colors
            focus:border-[#142D4E] focus:outline-none focus:ring-2 focus:ring-[#142D4E]/15
            dark:bg-[#0F172A] dark:border-[#1F2E45] dark:text-white dark:placeholder:text-slate-500
            dark:focus:border-indigo-500 dark:focus:ring-indigo-500/20
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-500' : 'border-[#E2E8F0]'}
            ${disabled ? 'bg-slate-100 dark:bg-slate-800 cursor-not-allowed text-slate-500' : ''}
            ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3.5 text-slate-400">{rightIcon}</div>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

/* ---------------- Styled Select ---------------- */
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  placeholder?: string;
  error?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, placeholder, error, className = '', disabled, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        <select
          ref={ref}
          disabled={disabled}
          className={`w-full appearance-none rounded-xl border bg-white pl-3.5 pr-10 py-2.5 text-sm text-[#172B45] shadow-xs cursor-pointer transition-colors
            focus:border-[#142D4E] focus:outline-none focus:ring-2 focus:ring-[#142D4E]/15
            dark:bg-[#0F172A] dark:border-[#1F2E45] dark:text-white
            dark:focus:border-indigo-500 dark:focus:ring-indigo-500/20
            ${error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-500' : 'border-[#E2E8F0]'}
            ${disabled ? 'bg-slate-100 dark:bg-slate-800 cursor-not-allowed text-slate-500' : ''}
            ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="text-slate-400">
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled} className="dark:bg-[#0F172A] dark:text-white">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 h-4 w-4 text-slate-400" />
      </div>
    );
  }
);
Select.displayName = 'Select';

/* ---------------- Styled Textarea ---------------- */
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className = '', disabled, rows = 3, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        disabled={disabled}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-[#172B45] placeholder:text-slate-400 shadow-xs transition-colors
          focus:border-[#142D4E] focus:outline-none focus:ring-2 focus:ring-[#142D4E]/15
          dark:bg-[#0F172A] dark:border-[#1F2E45] dark:text-white dark:placeholder:text-slate-500
          dark:focus:border-indigo-500 dark:focus:ring-indigo-500/20
          ${error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-500' : 'border-[#E2E8F0]'}
          ${disabled ? 'bg-slate-100 dark:bg-slate-800 cursor-not-allowed text-slate-500' : ''}
          ${className}`}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';
