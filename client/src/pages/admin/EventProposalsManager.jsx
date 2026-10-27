import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { SEOHelmet } from '../../components/common/SEOHelmet';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { getImageUrl } from '../../utils/imageUrl';
import {
  CheckSquare,
  Check,
  X,
  Eye,
  Calendar,
  MapPin,
  Phone,
  Mail,
  User,
  AlertTriangle,
} from 'lucide-react';

export const EventProposalsManager = () => {
  const { showToast } = useToast();

  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState(null);

  // Moderation state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const safeDate = (val) => {
    if (!val) return 'Non précisée';
    const d = new Date(val);
    return isNaN(d.getTime()) ? String(val) : d.toLocaleDateString('fr-FR');
  };

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/events/admin/proposals');
      setProposals(res.data.data || []);
    } catch (err) {
      console.error('Erreur chargement propositions:', err);
      showToast('Impossible de charger les propositions d’événements.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const handleModerate = async (id, status, reason = '') => {
    try {
      setProcessingId(id);
      await api.patch(`/events/admin/proposals/${id}/moderate`, {
        status,
        rejectionReason: reason,
      });

      if (status === 'approved') {
        showToast('Proposition approuvée et convertie en événement publié !', 'success');
      } else {
        showToast('Proposition rejetée.', 'info');
      }

      setRejectModalOpen(false);
      setRejectReason('');
      if (selectedProposal?._id === id) setSelectedProposal(null);
      fetchProposals();
    } catch (err) {
      console.error('Erreur modération proposition:', err);
      showToast(err.response?.data?.message || 'Erreur lors de la modération.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <SEOHelmet title="Modération des Propositions d'Événements - B.C.A. Admin" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <CheckSquare className="w-6 h-6 mr-2 text-brand-600" />
            Propositions d'Événements Citoyens
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Validez ou refusez les événements suggérés par les organisateurs et associations de Tiaret.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Chargement des propositions...</p>
          </div>
        ) : proposals.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <CheckSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold">Aucune proposition en attente de modération.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Événement proposé</th>
                  <th className="px-6 py-3.5">Proposé par</th>
                  <th className="px-6 py-3.5">Date & Lieu</th>
                  <th className="px-6 py-3.5 text-center">Statut</th>
                  <th className="px-6 py-3.5 text-right">Actions de modération</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {proposals.map((item) => (
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
                      <span className="font-semibold text-slate-800 block">
                        {item.organizerName || item.proposerName || item.organizer?.name || item.organizer || 'Anonyme'}
                      </span>
                      <span className="text-[11px] text-slate-400 block font-mono">
                        {item.organizerPhone || item.proposerPhone || item.contact || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-800 block">
                        {safeDate(item.startDate || item.date)}
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        {item.venue || item.location || 'Tiaret'}, {item.commune || 'Tiaret'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedProposal(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50"
                          title="Examiner les détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {item.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleModerate(item._id, 'approved')}
                              disabled={processingId === item._id}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[11px] inline-flex items-center gap-1"
                              title="Valider et publier"
                            >
                              <Check className="w-3.5 h-3.5" /> Valider
                            </button>
                            <button
                              onClick={() => {
                                setSelectedProposal(item);
                                setRejectModalOpen(true);
                              }}
                              disabled={processingId === item._id}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-[11px] inline-flex items-center gap-1"
                              title="Refuser"
                            >
                              <X className="w-3.5 h-3.5" /> Rejeter
                            </button>
                          </>
                        )}
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
      {selectedProposal && !rejectModalOpen && (
        <Modal
          isOpen={!!selectedProposal}
          onClose={() => setSelectedProposal(null)}
          title="Détails de la proposition d'événement"
          size="lg"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedProposal.title}</h3>
                <span className="text-xs text-slate-400">
                  Soumis le {new Date(selectedProposal.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <StatusBadge status={selectedProposal.status} />
            </div>

            {selectedProposal.flyerImage && (
              <div className="rounded-2xl overflow-hidden aspect-video bg-black/5 max-h-56 flex items-center justify-center">
                <img
                  src={getImageUrl(selectedProposal.flyerImage)}
                  alt="Affiche"
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                <span className="font-bold text-slate-700 block uppercase tracking-wider">
                  Contact Organisateur
                </span>
                <p className="flex items-center gap-2 text-slate-700">
                  <User className="w-3.5 h-3.5 text-brand-600" />
                  <strong>{selectedProposal.proposerName || selectedProposal.organizer}</strong>
                </p>
                <p className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-brand-600" />
                  <a
                    href={`tel:${selectedProposal.proposerPhone || selectedProposal.contact}`}
                    className="hover:underline font-bold"
                  >
                    {selectedProposal.proposerPhone || selectedProposal.contact}
                  </a>
                </p>
                {selectedProposal.proposerEmail && (
                  <p className="flex items-center gap-2 text-slate-700">
                    <Mail className="w-3.5 h-3.5 text-brand-600" />
                    <a href={`mailto:${selectedProposal.proposerEmail}`} className="hover:underline">
                      {selectedProposal.proposerEmail}
                    </a>
                  </p>
                )}
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                <span className="font-bold text-slate-700 block uppercase tracking-wider">
                  Date & Lieu
                </span>
                <p className="flex items-center gap-2 text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-brand-600" />
                  {new Date(selectedProposal.date).toLocaleDateString('fr-FR')} à {selectedProposal.time || '14:00'}
                </p>
                <p className="flex items-center gap-2 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-brand-600" />
                  {selectedProposal.location}, {selectedProposal.commune}
                </p>
              </div>
            </div>

            {selectedProposal.description && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                <span className="font-bold text-slate-900 block mb-1">Description :</span>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {selectedProposal.description}
                </p>
              </div>
            )}

            {selectedProposal.status === 'pending' && (
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <Button
                  onClick={() => setRejectModalOpen(true)}
                  variant="danger"
                  size="sm"
                >
                  <X className="w-4 h-4 mr-1.5" /> Rejeter
                </Button>
                <Button
                  onClick={() => handleModerate(selectedProposal._id, 'approved')}
                  variant="accent"
                  size="sm"
                >
                  <Check className="w-4 h-4 mr-1.5" /> Approuver & Publier dans l'agenda
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Rejection Modal */}
      {rejectModalOpen && selectedProposal && (
        <Modal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          title="Motif du refus"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Veuillez indiquer un motif de refus pour la proposition "{selectedProposal.title}" :
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="ex. Informations incomplètes, non conforme à la politique éditoriale locale..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-500"
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button onClick={() => setRejectModalOpen(false)} variant="ghost" size="sm">
                Annuler
              </Button>
              <Button
                onClick={() => handleModerate(selectedProposal._id, 'rejected', rejectReason)}
                variant="danger"
                size="sm"
              >
                Confirmer le refus
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default EventProposalsManager;
