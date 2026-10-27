import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { SEOHelmet } from '../../components/common/SEOHelmet';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { StatusBadge } from '../../components/admin/StatusBadge';
import {
  UserCheck,
  Search,
  Download,
  Eye,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'nouveau', label: 'Nouveau' },
  { value: 'contacte', label: 'Contacté' },
  { value: 'valide', label: 'Validé / Confirmé' },
  { value: 'annule', label: 'Annulé' },
];

export const PreinscriptionsManager = () => {
  const { showToast } = useToast();

  const [inscriptions, setInscriptions] = useState([]);
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formationFilter, setFormationFilter] = useState('');

  // Detail Modal
  const [selectedItem, setSelectedItem] = useState(null);

  // Delete State
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchInscriptions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (formationFilter) params.formation = formationFilter;
      if (search) params.search = search;

      const [resI, resF] = await Promise.all([
        api.get('/formations/admin/inscriptions', { params }),
        api.get('/formations', { params: { limit: 100 } }),
      ]);

      setInscriptions(resI.data.data || []);
      setFormations(resF.data.data || []);
    } catch (err) {
      console.error('Erreur chargement préinscriptions:', err);
      showToast('Impossible de charger les préinscriptions.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInscriptions();
  }, [statusFilter, formationFilter]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/formations/admin/inscriptions/${id}/status`, { status: newStatus });
      showToast(`Statut mis à jour : ${newStatus}`, 'success');
      if (selectedItem && selectedItem._id === id) {
        setSelectedItem((prev) => ({ ...prev, status: newStatus }));
      }
      fetchInscriptions();
    } catch (err) {
      console.error('Erreur mise à jour statut:', err);
      showToast('Erreur lors du changement de statut.', 'error');
    }
  };

  const handleExportCSV = async () => {
    try {
      showToast('Génération du fichier Excel (CSV)...', 'info');
      const response = await api.get('/formations/admin/inscriptions/export/csv', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `preinscriptions_bca_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('Export CSV téléchargé avec succès !', 'success');
    } catch (err) {
      console.error('Erreur export CSV:', err);
      showToast("Erreur lors de l'export CSV.", 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await api.delete(`/formations/admin/inscriptions/${deleteId}`);
      showToast('Préinscription supprimée.', 'success');
      setDeleteId(null);
      if (selectedItem?._id === deleteId) setSelectedItem(null);
      fetchInscriptions();
    } catch (err) {
      console.error('Erreur suppression:', err);
      showToast('Erreur lors de la suppression.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = inscriptions.filter((i) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      i.fullName?.toLowerCase().includes(q) ||
      i.phone?.includes(q) ||
      i.email?.toLowerCase().includes(q) ||
      i.commune?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <SEOHelmet title="Gestion des Préinscriptions - B.C.A. Admin" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <UserCheck className="w-6 h-6 mr-2 text-brand-600" />
            Candidatures & Préinscriptions
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Traitez les demandes d'inscription reçues en ligne pour vos sessions de formation.
          </p>
        </div>
        <Button onClick={handleExportCSV} variant="outline" size="md">
          <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600" /> Exporter en CSV (Excel)
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher candidat, tél, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-500 text-slate-700"
        >
          {STATUS_OPTIONS.map((st) => (
            <option key={st.value} value={st.value}>
              {st.label}
            </option>
          ))}
        </select>

        <select
          value={formationFilter}
          onChange={(e) => setFormationFilter(e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-500 text-slate-700"
        >
          <option value="">Toutes les formations</option>
          {formations.map((f) => (
            <option key={f._id} value={f._id}>
              {f.title}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Chargement des candidatures...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <UserCheck className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold">Aucune préinscription ne correspond à vos filtres.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Candidat</th>
                  <th className="px-6 py-3.5">Formation Demandée</th>
                  <th className="px-6 py-3.5">Contact Téléphonique</th>
                  <th className="px-6 py-3.5">Date Inscription</th>
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
                        <span className="text-[11px] text-slate-400 block">{item.email}</span>
                        {item.commune && (
                          <span className="text-[10px] text-slate-400 block">{item.commune}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-brand-700 block line-clamp-1">
                        {item.formation?.title || 'Formation générale'}
                      </span>
                      {item.session && (
                        <span className="text-[10px] text-slate-400 block">
                          Session du {new Date(item.session.startDate).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-slate-800">
                      <a href={`tel:${item.phone}`} className="hover:text-brand-600 hover:underline">
                        {item.phone}
                      </a>
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
                        <option value="contacte">Contacté</option>
                        <option value="valide">Validé</option>
                        <option value="annule">Annulé</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50"
                          title="Voir le dossier"
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

      {/* Candidate Dossier Detail Modal */}
      {selectedItem && (
        <Modal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title="Fiche Candidat - Préinscription"
          size="lg"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedItem.fullName}</h3>
                <span className="text-xs text-slate-400">
                  Dossier reçu le{' '}
                  {new Date(selectedItem.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <StatusBadge status={selectedItem.status} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                <span className="font-bold text-slate-700 block text-xs uppercase tracking-wider">
                  Coordonnées
                </span>
                <p className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-brand-600" />
                  <a href={`tel:${selectedItem.phone}`} className="font-bold hover:underline">
                    {selectedItem.phone}
                  </a>
                </p>
                <p className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-3.5 h-3.5 text-brand-600" />
                  <a href={`mailto:${selectedItem.email}`} className="hover:underline">
                    {selectedItem.email}
                  </a>
                </p>
                <p className="flex items-center gap-2 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-brand-600" />
                  {selectedItem.commune || 'Tiaret'}, Wilaya de {selectedItem.wilaya || 'Tiaret (14)'}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                <span className="font-bold text-slate-700 block text-xs uppercase tracking-wider">
                  Formation Ciblée
                </span>
                <p className="font-bold text-slate-900">
                  {selectedItem.formation?.title || 'Formation générale'}
                </p>
                <p className="text-slate-600">
                  Niveau d'études : <strong>{selectedItem.educationLevel || 'Non précisé'}</strong>
                </p>
                {selectedItem.birthDate && (
                  <p className="text-slate-600">
                    Né(e) le : {new Date(selectedItem.birthDate).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
            </div>

            {selectedItem.notes && (
              <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 text-xs">
                <span className="font-bold text-amber-900 block mb-1">Message ou Remarques du candidat :</span>
                <p className="text-slate-700 leading-relaxed">{selectedItem.notes}</p>
              </div>
            )}

            {/* Quick Status Buttons in Modal */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-600">Mettre à jour le statut :</span>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => handleUpdateStatus(selectedItem._id, 'contacte')}
                  variant={selectedItem.status === 'contacte' ? 'primary' : 'outline'}
                  size="sm"
                >
                  Marquer Contacté
                </Button>
                <Button
                  onClick={() => handleUpdateStatus(selectedItem._id, 'valide')}
                  variant={selectedItem.status === 'valide' ? 'accent' : 'outline'}
                  size="sm"
                >
                  Valider Inscription
                </Button>
                <Button
                  onClick={() => handleUpdateStatus(selectedItem._id, 'annule')}
                  variant={selectedItem.status === 'annule' ? 'danger' : 'outline'}
                  size="sm"
                >
                  Annuler
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
        title="Supprimer cette préinscription ?"
        message="Êtes-vous sûr de vouloir supprimer définitivement ce dossier de préinscription ?"
      />
    </div>
  );
};

export default PreinscriptionsManager;
