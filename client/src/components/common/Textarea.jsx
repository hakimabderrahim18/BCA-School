import React, { forwardRef } from 'react';
import clsx from 'clsx';

export const Textarea = forwardRef(
  (
    {
      label,
      error,
      helperText,
      rows = 4,
      className = '',
      id,
      name,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const textareaId = id || name || Math.random().toString(36).substring(2, 9);
    const cleanLabel =
      typeof label === 'string' && label.endsWith('*') ? label.slice(0, -1).trim() : label;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            {cleanLabel} {required && <span className="text-rose-500">*</span>}
          </label>
        )}

        <div className="relative rounded-xl shadow-sm">
          <textarea
            ref={ref}
            id={textareaId}
            name={name}
            rows={rows}
            disabled={disabled}
            className={clsx(
              'block w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-slate-50 disabled:cursor-not-allowed',
              error
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-400/30'
                : 'border-slate-300 focus:border-brand-500 focus:ring-brand-500/20',
              className
            )}
            {...props}
          />
        </div>

        {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
        {!error && helperText && (
          <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
