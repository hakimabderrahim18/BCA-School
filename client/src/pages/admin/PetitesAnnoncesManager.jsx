import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { SEOHelmet } from '../../components/common/SEOHelmet';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { getImageUrl } from '../../utils/imageUrl';
import {
  Tag,
  Search,
  Eye,
  Trash2,
  Check,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
} from 'lucide-react';

const formatPrice = (val) => {
  if (val === null || val === undefined || val === '') return 'Prix à débattre';
  const str = String(val).trim();
  if (!str) return 'Prix à débattre';
  if (/[a-zA-Z\/\<\>\-]/.test(str)) {
    return str;
  }
  const cleanNum = Number(str.replace(/\s+/g, '').replace(/,/g, '.'));
  if (isNaN(cleanNum)) {
    return str;
  }
  return `${cleanNum.toLocaleString('fr-DZ')} DA`;
};

export const PetitesAnnoncesManager = () => {
  const { showToast } = useToast();

  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Inspect modal
  const [selectedAnnonce, setSelectedAnnonce] = useState(null);

  // Delete State
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAnnonces = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/annonceurs/admin/petites/annonces', { params });
      setAnnonces(res.data.data || []);
    } catch (err) {
      console.error('Erreur chargement petites annonces:', err);
      showToast('Impossible de charger les petites annonces.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnonces();
  }, [statusFilter]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.patch(`/annonceurs/admin/petites/annonces/${id}/status`, { status });
      showToast(status === 'published' ? 'Annonce validée et mise en ligne !' : `Statut : ${status}`, 'success');
      if (selectedAnnonce && selectedAnnonce._id === id) {
        setSelectedAnnonce((prev) => ({ ...prev, status }));
      }
      fetchAnnonces();
    } catch (err) {
      console.error('Erreur modération annonce:', err);
      showToast('Erreur lors de la modération.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await api.delete(`/annonceurs/admin/petites/annonces/${deleteId}`);
      showToast('Annonce supprimée.', 'success');
      setDeleteId(null);
      if (selectedAnnonce?._id === deleteId) setSelectedAnnonce(null);
      fetchAnnonces();
    } catch (err) {
      console.error('Erreur suppression annonce:', err);
      showToast('Erreur lors de la suppression.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = annonces.filter((a) =>
    a.title?.toLowerCase().includes(search.toLowerCase()) ||
    a.contactName?.toLowerCase().includes(search.toLowerCase()) ||
    a.phone?.includes(search)
  );

  return (
    <div className="space-y-6">
      <SEOHelmet title="Modération des Petites Annonces - B.C.A. Admin" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <Tag className="w-6 h-6 mr-2 text-brand-600" />
            Modération des Petites Annonces Locales
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Validez, modérez ou supprimez les petites annonces déposées par les habitants de la région de Tiaret.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par titre, annonceur, téléphone..."
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
          <option value="">Tous les statuts</option>
          <option value="pending">En attente de validation</option>
          <option value="published">Publiées en ligne</option>
          <option value="rejected">Rejetées</option>
          <option value="archived">Archivées / Expirées</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Chargement des petites annonces...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Tag className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold">Aucune petite annonce trouvée.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Annonce</th>
                  <th className="px-6 py-3.5">Type & Prix</th>
                  <th className="px-6 py-3.5">Annonceur</th>
                  <th className="px-6 py-3.5">Date Dépose</th>
                  <th className="px-6 py-3.5 text-center">Statut</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-bold text-slate-900 block line-clamp-1">
                          {item.title}
                        </span>
                        <span className="text-[11px] text-slate-400 block line-clamp-1">
                          {item.description}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700 mr-2">
                        {item.type || 'offre'}
                      </span>
                      <span className="font-bold text-slate-900">
                        {formatPrice(item.price)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800 block">{item.contactName}</span>
                      <span className="text-[11px] text-slate-400 font-mono block">{item.phone}</span>
                      <span className="text-[10px] text-slate-400 block">{item.commune}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedAnnonce(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50"
                          title="Examiner"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {item.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(item._id, 'published')}
                              className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[11px] inline-flex items-center gap-1"
                              title="Valider l'annonce"
                            >
                              <Check className="w-3.5 h-3.5" /> Valider
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(item._id, 'rejected')}
                              className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-[11px] inline-flex items-center gap-1"
                              title="Rejeter l'annonce"
                            >
                              <X className="w-3.5 h-3.5" /> Rejeter
                            </button>
                          </>
                        )}
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

      {/* Inspect Modal */}
      {selectedAnnonce && (
        <Modal
          isOpen={!!selectedAnnonce}
          onClose={() => setSelectedAnnonce(null)}
          title="Fiche Petite Annonce"
          size="lg"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedAnnonce.title}</h3>
                <span className="text-xs text-slate-400">
                  Déposée le {new Date(selectedAnnonce.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <StatusBadge status={selectedAnnonce.status} />
            </div>

            {selectedAnnonce.image && (
              <div className="rounded-2xl overflow-hidden aspect-video bg-black/5 max-h-60 flex items-center justify-center">
                <img
                  src={getImageUrl(selectedAnnonce.image)}
                  alt={selectedAnnonce.title}
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                <span className="font-bold text-slate-700 block uppercase tracking-wider">
                  Contact Déposant
                </span>
                <p className="text-slate-800 font-bold">{selectedAnnonce.contactName}</p>
                <p className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-brand-600" />
                  <a href={`tel:${selectedAnnonce.phone}`} className="font-bold hover:underline">
                    {selectedAnnonce.phone}
                  </a>
                </p>
                {selectedAnnonce.email && (
                  <p className="flex items-center gap-2 text-slate-700">
                    <Mail className="w-3.5 h-3.5 text-brand-600" />
                    <a href={`mailto:${selectedAnnonce.email}`} className="hover:underline">
                      {selectedAnnonce.email}
                    </a>
                  </p>
                )}
                <p className="flex items-center gap-2 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-brand-600" />
                  {selectedAnnonce.commune || 'Tiaret'}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                <span className="font-bold text-slate-700 block uppercase tracking-wider">
                  Détails Financiers
                </span>
                <p className="text-slate-600">
                  Type : <strong className="uppercase">{selectedAnnonce.type || 'Offre'}</strong>
                </p>
                <p className="text-slate-600">
                  Prix :{' '}
                  <strong className="text-slate-900 text-sm">
                    {formatPrice(selectedAnnonce.price)}
                  </strong>
                </p>
              </div>
            </div>

            {selectedAnnonce.description && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                <span className="font-bold text-slate-900 block mb-1">Texte de l'annonce :</span>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {selectedAnnonce.description}
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button
                onClick={() => handleUpdateStatus(selectedAnnonce._id, 'rejected')}
                variant="danger"
                size="sm"
              >
                Rejeter
              </Button>
              <Button
                onClick={() => handleUpdateStatus(selectedAnnonce._id, 'published')}
                variant="accent"
                size="sm"
              >
                Valider & Mettre en ligne
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Supprimer cette petite annonce ?"
        message="Êtes-vous sûr de vouloir supprimer définitivement cette annonce ?"
      />
    </div>
  );
};

export default PetitesAnnoncesManager;
