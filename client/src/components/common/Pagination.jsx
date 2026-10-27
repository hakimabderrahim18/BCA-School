import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

export const Pagination = ({ page, totalPages, onPageChange, className = '' }) => {
  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);

    if (end - start < maxVisiblePages - 1) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    if (start > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => onPageChange(1)}
          className={clsx(
            'w-9 h-9 rounded-lg text-sm font-semibold transition',
            page === 1
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100'
          )}
        >
          1
        </button>
      );
      if (start > 2) {
        pages.push(
          <span key="start-dots" className="px-1 text-slate-400">
            …
          </span>
        );
      }
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={clsx(
            'w-9 h-9 rounded-lg text-sm font-semibold transition',
            page === i
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100'
          )}
        >
          {i}
        </button>
      );
    }

    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push(
          <span key="end-dots" className="px-1 text-slate-400">
            …
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          className={clsx(
            'w-9 h-9 rounded-lg text-sm font-semibold transition',
            page === totalPages
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100'
          )}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={clsx('flex items-center justify-center gap-1.5 my-8 select-none', className)}
    >
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        aria-label="Page précédente"
      >
        <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
      </button>

      {renderPageNumbers()}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        aria-label="Page suivante"
      >
        <ChevronRight className="w-4 h-4 rtl:rotate-180" />
      </button>
    </nav>
  );
};
