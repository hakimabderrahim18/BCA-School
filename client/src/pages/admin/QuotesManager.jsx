import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { SEOHelmet } from '../../components/common/SEOHelmet';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { StatusBadge } from '../../components/admin/StatusBadge';
import {
  FileText,
  Search,
  Eye,
  Trash2,
  Phone,
  Mail,
  Building,
  Calendar,
  FileSpreadsheet,
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'nouveau', label: 'Nouveau' },
  { value: 'en_cours', label: 'En cours d’étude' },
  { value: 'traite', label: 'Traité / Devis émis' },
  { value: 'rejete', label: 'Rejeté / Sans suite' },
];

const formatBudget = (val) => {
  if (val === null || val === undefined || val === '') return 'Non précisé';
  const str = String(val).trim();
  if (!str) return 'Non précisé';
  // Si la valeur contient déjà des lettres, devises ou symboles (ex: "25 000 DZD / mois", "< 30 000 DZD", "À définir")
  if (/[a-zA-Z\/\<\>\-]/.test(str)) {
    return str;
  }
  const cleanNum = Number(str.replace(/\s+/g, '').replace(/,/g, '.'));
  if (isNaN(cleanNum)) {
    return str;
  }
  return `${cleanNum.toLocaleString('fr-DZ')} DA`;
};

export const QuotesManager = () => {
  const { showToast } = useToast();

  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selected item modal
  const [selectedQuote, setSelectedQuote] = useState(null);

  // Delete State
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;

      const res = await api.get('/prestations/admin/quotes', { params });
      setQuotes(res.data.data || []);
    } catch (err) {
      console.error('Erreur chargement devis:', err);
      showToast('Impossible de charger les demandes de devis.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, [statusFilter]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/prestations/admin/quotes/${id}/status`, { status: newStatus });
      showToast(`Statut du devis actualisé : ${newStatus}`, 'success');
      if (selectedQuote && selectedQuote._id === id) {
        setSelectedQuote((prev) => ({ ...prev, status: newStatus }));
      }
      fetchQuotes();
    } catch (err) {
      console.error('Erreur mise à jour devis:', err);
      showToast('Erreur lors du changement de statut.', 'error');
    }
  };

  const handleExportCSV = async () => {
    try {
      showToast('Génération du fichier Excel (CSV)...', 'info');
      const response = await api.get('/prestations/admin/quotes/export/csv', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `demandes_devis_bca_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('Fichier CSV téléchargé avec succès !', 'success');
    } catch (err) {
      console.error('Erreur export CSV:', err);
      showToast("Erreur lors de l'export CSV.", 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await api.delete(`/prestations/admin/quotes/${deleteId}`);
      showToast('Demande de devis supprimée.', 'success');
      setDeleteId(null);
      if (selectedQuote?._id === deleteId) setSelectedQuote(null);
      fetchQuotes();
    } catch (err) {
      console.error('Erreur suppression devis:', err);
      showToast('Erreur lors de la suppression.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = quotes.filter((q) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      q.fullName?.toLowerCase().includes(term) ||
      q.companyName?.toLowerCase().includes(term) ||
      q.email?.toLowerCase().includes(term) ||
      q.phone?.includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <SEOHelmet title="Gestion des Devis - B.C.A. Admin" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <FileText className="w-6 h-6 mr-2 text-brand-600" />
            Demandes de Devis Prestations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gérez et chiffrez les demandes de prestations de communication et de régie publicitaire.
          </p>
        </div>
        <Button onClick={handleExportCSV} variant="outline" size="md">
          <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600" /> Exporter en CSV (Excel)
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, entreprise, téléphone, e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-64 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-500 text-slate-700"
        >
          {STATUS_OPTIONS.map((st) => (
            <option key={st.value} value={st.value}>
              {st.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Chargement des demandes de devis...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold">Aucune demande de devis trouvée.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Client / Entreprise</th>
                  <th className="px-6 py-3.5">Prestation Sollicitée</th>
                  <th className="px-6 py-3.5">Budget Estimé</th>
                  <th className="px-6 py-3.5">Date Demande</th>
                  <th className="px-6 py-3.5 text-center">Statut</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-bold text-slate-900 block">{item.fullName}</span>
                        {item.companyName && (
                          <span className="text-[11px] text-brand-600 font-medium block">
                            {item.companyName}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400 block font-mono" dir="ltr">
                          <bdi>{item.phone}</bdi>
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800 block line-clamp-1">
                        {item.prestation?.title || item.serviceType || 'Prestation sur mesure'}
                      </span>
                      <span className="text-[11px] text-slate-400 block line-clamp-1">
                        {item.projectDescription}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700" dir="ltr">
                      <bdi>{formatBudget(item.budget)}</bdi>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(item.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <select
                        value={item.status}
                        onChange={(e) => handleUpdateStatus(item._id, e.target.value)}
                        className="px-2 py-1 rounded-lg text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-700 focus:outline-none focus:border-brand-500"
                      >
                        <option value="nouveau">Nouveau</option>
                        <option value="en_cours">En cours</option>
                        <option value="traite">Traité</option>
                        <option value="rejete">Rejeté</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedQuote(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50"
                          title="Examiner la demande"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(item._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quote Details Modal */}
      {selectedQuote && (
        <Modal
          isOpen={!!selectedQuote}
          onClose={() => setSelectedQuote(null)}
          title="Détail de la demande de devis"
          size="lg"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedQuote.fullName}</h3>
                {selectedQuote.companyName && (
                  <span className="text-xs font-semibold text-brand-600 block">
                    Entreprise : {selectedQuote.companyName}
                  </span>
                )}
                <span className="text-xs text-slate-400 block mt-0.5">
                  Reçu le {new Date(selectedQuote.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <StatusBadge status={selectedQuote.status} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                <span className="font-bold text-slate-700 block text-xs uppercase tracking-wider">
                  Contact
                </span>
                <p className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-brand-600" />
                  <a href={`tel:${selectedQuote.phone}`} className="font-bold hover:underline" dir="ltr">
                    <bdi>{selectedQuote.phone}</bdi>
                  </a>
                </p>
                <p className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-3.5 h-3.5 text-brand-600" />
                  <a href={`mailto:${selectedQuote.email}`} className="hover:underline">
                    {selectedQuote.email}
                  </a>
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                <span className="font-bold text-slate-700 block text-xs uppercase tracking-wider">
                  Cahier des charges
                </span>
                <p className="font-semibold text-slate-800">
                  Prestation : {selectedQuote.prestation?.title || selectedQuote.serviceType || 'Générale'}
                </p>
                <p className="text-slate-600">
                  Budget indicatif :{' '}
                  <strong dir="ltr">
                    <bdi>{formatBudget(selectedQuote.budget)}</bdi>
                  </strong>
                </p>
                {selectedQuote.deadline && (
                  <p className="text-slate-600">
                    Délai souhaité : <strong>{selectedQuote.deadline}</strong>
                  </p>
                )}
              </div>
            </div>

            {selectedQuote.projectDescription && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                <span className="font-bold text-slate-900 block mb-2">Description du besoin :</span>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {selectedQuote.projectDescription}
                </p>
              </div>
            )}

            {/* Quick Status Buttons */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-600">Statut du dossier :</span>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => handleUpdateStatus(selectedQuote._id, 'en_cours')}
                  variant={selectedQuote.status === 'en_cours' ? 'primary' : 'outline'}
                  size="sm"
                >
                  Passer En cours
                </Button>
                <Button
                  onClick={() => handleUpdateStatus(selectedQuote._id, 'traite')}
                  variant={selectedQuote.status === 'traite' ? 'accent' : 'outline'}
                  size="sm"
                >
                  Marquer Devis Traité
                </Button>
                <Button
                  onClick={() => handleUpdateStatus(selectedQuote._id, 'rejete')}
                  variant={selectedQuote.status === 'rejete' ? 'danger' : 'outline'}
                  size="sm"
                >
                  Classer sans suite
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Supprimer cette demande de devis ?"
        message="Êtes-vous sûr de vouloir supprimer définitivement cette demande de devis ?"
      />
    </div>
  );
};

export default QuotesManager;
