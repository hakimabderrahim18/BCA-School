import React, { forwardRef } from 'react';
import clsx from 'clsx';

export const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      icon,
      className = '',
      id,
      name,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || name || Math.random().toString(36).substring(2, 9);
    const resolvedLeftIcon =
      leftIcon ||
      (icon
        ? React.isValidElement(icon)
          ? icon
          : React.createElement(icon, { className: 'w-4 h-4 text-slate-400' })
        : null);

    const cleanLabel =
      typeof label === 'string' && label.endsWith('*') ? label.slice(0, -1).trim() : label;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            {cleanLabel} {required && <span className="text-rose-500">*</span>}
          </label>
        )}

        <div className="relative rounded-xl shadow-sm">
          {resolvedLeftIcon && (
            <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400">
              {resolvedLeftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            name={name}
            disabled={disabled}
            className={clsx(
              'block w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-slate-50 disabled:cursor-not-allowed',
              resolvedLeftIcon && 'ps-10',
              rightIcon && 'pe-10',
              error
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-400/30'
                : 'border-slate-300 focus:border-brand-500 focus:ring-brand-500/20',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute inset-y-0 end-0 pe-3.5 flex items-center pointer-events-none text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error ? (
          <p className="mt-1.5 text-xs text-rose-500 font-medium">{error}</p>
        ) : helperText ? (
          <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
