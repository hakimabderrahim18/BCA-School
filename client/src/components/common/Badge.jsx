import React from 'react';
import clsx from 'clsx';

export const Badge = ({
  children,
  variant = 'neutral',
  status = null,
  size = 'md',
  className = '',
}) => {
  // Déduction automatique de la couleur si un code statut MongoDB est fourni
  let appliedVariant = variant;

  if (status) {
    switch (status) {
      case 'published':
      case 'confirme':
      case 'active':
      case 'approved':
      case 'accepte':
        appliedVariant = 'success';
        break;
      case 'pending':
      case 'en_cours':
      case 'en_etude':
        appliedVariant = 'warning';
        break;
      case 'nouveau':
        appliedVariant = 'info';
        break;
      case 'rejected':
      case 'annule':
      case 'refuse':
      case 'cancelled':
        appliedVariant = 'danger';
        break;
      case 'draft':
      case 'archived':
      case 'expired':
      case 'inactive':
        appliedVariant = 'neutral';
        break;
      default:
        appliedVariant = 'neutral';
    }
  }

  const variants = {
    brand: 'bg-brand-50 text-brand-700 border-brand-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center font-semibold rounded-full border',
        variants[appliedVariant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
};
