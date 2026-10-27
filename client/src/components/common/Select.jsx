import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';

export const Select = forwardRef(
  (
    {
      label,
      error,
      helperText,
      options = [],
      className = '',
      id,
      name,
      required,
      placeholder,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const selectId = id || name || Math.random().toString(36).substring(2, 9);
    const cleanLabel =
      typeof label === 'string' && label.endsWith('*') ? label.slice(0, -1).trim() : label;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            {cleanLabel} {required && <span className="text-rose-500">*</span>}
          </label>
        )}

        <div className="relative rounded-xl shadow-sm">
          <select
            ref={ref}
            id={selectId}
            name={name}
            disabled={disabled}
            className={clsx(
              'block w-full appearance-none rounded-xl border bg-white px-3.5 py-2.5 pe-10 text-sm text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-slate-50 disabled:cursor-not-allowed',
              error
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-400/30'
                : 'border-slate-300 focus:border-brand-500 focus:ring-brand-500/20',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
            {children}
          </select>

          <div className="absolute inset-y-0 end-0 pe-3.5 flex items-center pointer-events-none text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
        {!error && helperText && (
          <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
