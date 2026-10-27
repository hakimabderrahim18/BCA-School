import React from 'react';

const STATUS_MAP = {
  // Statuts Préinscriptions & Devis & Messages
  nouveau: { label: 'Nouveau', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  contacte: { label: 'Contacté', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  en_cours: { label: 'En cours', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  valide: { label: 'Validé', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  confirme: { label: 'Confirmé', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  traite: { label: 'Traité', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  annule: { label: 'Annulé', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  rejete: { label: 'Rejeté', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },

  // Statuts Articles & Événements & Annonces
  published: { label: 'Publié', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  draft: { label: 'Brouillon', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
  pending: { label: 'En attente', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  archived: { label: 'Archivé', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300' },
  cancelled: { label: 'Annulé', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },

  // Statuts Sessions
  ouvert: { label: 'Inscriptions ouvertes', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  planned: { label: 'Inscriptions ouvertes', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  ongoing: { label: 'En cours', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  completed: { label: 'Terminée', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
  complet: { label: 'Session complète', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  termine: { label: 'Terminée', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },

  // Statuts Général (Actif / Inactif)
  active: { label: 'Actif', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  inactive: { label: 'Inactif', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },

  // Rôles
  admin: { label: 'Administrateur', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  editor: { label: 'Éditeur', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  writer: { label: 'Rédacteur', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
};

export const StatusBadge = ({ status, className = '' }) => {
  const config = STATUS_MAP[status] || {
    label: status || 'Inconnu',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {config.label}
    </span>
  );
};

export default StatusBadge;
