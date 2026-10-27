import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { SEOHelmet } from '../../components/common/SEOHelmet';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { StatusBadge } from '../../components/admin/StatusBadge';
import {
  CalendarRange,
  Plus,
  Edit2,
  Trash2,
  Clock,
  MapPin,
  Users,
  CheckCircle,
} from 'lucide-react';

const SESSION_STATUSES = [
  { value: 'ouvert', label: 'Inscriptions ouvertes' },
  { value: 'complet', label: 'Session complète' },
  { value: 'en_cours', label: 'En cours de formation' },
  { value: 'termine', label: 'Session clôturée / terminée' },
];

export const SessionsManager = () => {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFormationId = searchParams.get('formation') || '';

  const [formations, setFormations] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedFormationId, setSelectedFormationId] = useState(initialFormationId);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    formationId: initialFormationId,
    startDate: '',
    endDate: '',
    schedule: 'Dimanche et Mardi : 14h00 - 17h00',
    location: 'Centre B.C.A. Tiaret - Salle 1',
    maxParticipants: 12,
    status: 'ouvert',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const resF = await api.get('/formations', { params: { limit: 100 } });
      const fList = resF.data.data || [];
      setFormations(fList);

      const targetFId = selectedFormationId || (fList[0] ? fList[0]._id : '');
      if (targetFId) {
        setSelectedFormationId(targetFId);
        const resS = await api.get(`/formations/${targetFId}`);
        setSessions(resS.data.data?.sessions || []);
      }
    } catch (err) {
      console.error('Erreur chargement sessions:', err);
      showToast('Impossible de charger les sessions.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedFormationId]);

  const handleSelectFormation = async (fId) => {
    setSelectedFormationId(fId);
    setSearchParams(fId ? { formation: fId } : {});
  };

  const handleOpenCreate = () => {
    setEditingSession(null);
    setFormData({
      formationId: selectedFormationId,
      startDate: '',
      endDate: '',
      schedule: 'Dimanche et Mardi : 14h00 - 17h00',
      location: 'Centre B.C.A. Tiaret - Salle Multimédia',
      maxParticipants: 12,
      status: 'ouvert',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (session) => {
    setEditingSession(session);
    setFormData({
      formationId: selectedFormationId,
      startDate: session.startDate ? session.startDate.split('T')[0] : '',
      endDate: session.endDate ? session.endDate.split('T')[0] : '',
      schedule: session.schedule || '',
      location: session.location || '',
      maxParticipants: session.maxParticipants || 12,
      status: session.status || 'ouvert',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.startDate) {
      showToast('Veuillez renseigner au moins la date de début.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      if (editingSession) {
        await api.put(`/formations/sessions/${editingSession._id}`, formData);
        showToast('Session mise à jour avec succès.', 'success');
      } else {
        await api.post(`/formations/${selectedFormationId}/sessions`, formData);
        showToast('Nouvelle session ajoutée.', 'success');
      }

      setModalOpen(false);
      // Refresh current formation sessions
      const res = await api.get(`/formations/${selectedFormationId}`);
      setSessions(res.data.data?.sessions || []);
    } catch (err) {
      console.error('Erreur sauvegarde session:', err);
      showToast(err.response?.data?.message || 'Erreur lors de l’enregistrement.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await api.delete(`/formations/sessions/${deleteId}`);
      showToast('Session supprimée.', 'success');
      setDeleteId(null);
      // Refresh
      const res = await api.get(`/formations/${selectedFormationId}`);
      setSessions(res.data.data?.sessions || []);
    } catch (err) {
      console.error('Erreur suppression session:', err);
      showToast('Erreur lors de la suppression.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const currentFormation = formations.find((f) => f._id === selectedFormationId);

  return (
    <div className="space-y-6">
      <SEOHelmet title="Gestion des Sessions & Calendrier - B.C.A. Admin" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <CalendarRange className="w-6 h-6 mr-2 text-brand-600" />
            Sessions de Formation
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Programmez les dates de rentrée, horaires et capacités d'accueil par formation.
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          variant="primary"
          size="md"
          disabled={!selectedFormationId}
        >
          <Plus className="w-4 h-4 mr-1.5" /> Planifier une session
        </Button>
      </div>

      {/* Formation Selector Dropdown */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Sélectionner la formation :
        </label>
        <select
          value={selectedFormationId}
          onChange={(e) => handleSelectFormation(e.target.value)}
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-brand-500"
        >
          {formations.map((f) => (
            <option key={f._id} value={f._id}>
              {f.title} ({f.category?.name || 'Général'})
            </option>
          ))}
        </select>
      </div>

      {/* Sessions Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <span className="font-bold text-slate-900 text-sm">
            Sessions programmées pour :{' '}
            <span className="text-brand-600">{currentFormation?.title || 'Formation'}</span>
          </span>
          <span className="text-xs text-slate-500 font-semibold">
            {sessions.length} session(s)
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Chargement des sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <CalendarRange className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold">Aucune session programmée pour cette formation.</p>
            <Button onClick={handleOpenCreate} variant="outline" size="sm" className="mt-4">
              Créer la première session
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Période</th>
                  <th className="px-6 py-3.5">Horaires & Jours</th>
                  <th className="px-6 py-3.5">Lieu / Salle</th>
                  <th className="px-6 py-3.5 text-center">Places</th>
                  <th className="px-6 py-3.5 text-center">Statut</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {sessions.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900 block">
                        Du {new Date(s.startDate).toLocaleDateString('fr-FR')}
                      </span>
                      {s.endDate && (
                        <span className="text-[11px] text-slate-400 block">
                          au {new Date(s.endDate).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{s.schedule || 'À définir'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{s.location || 'Centre B.C.A.'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                        <Users className="w-3 h-3 text-slate-400" />
                        {s.enrolledCount || 0} / {s.maxSeats || s.maxParticipants || 15}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(s._id)}
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

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSession ? 'Modifier la session' : 'Planifier une session'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Date de début *"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
            <Input
              label="Date de fin estimée"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>

          <Input
            label="Rythme & Horaires *"
            value={formData.schedule}
            onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
            placeholder="ex. Les samedis de 09h00 à 13h00"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Lieu ou Salle"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="ex. Salle Multimédia A, Centre B.C.A."
            />
            <Input
              label="Capacité maximale (places)"
              type="number"
              value={formData.maxParticipants}
              onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
            />
          </div>

          <Select
            label="Statut de la session *"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={SESSION_STATUSES}
            required
          />

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button onClick={() => setModalOpen(false)} variant="ghost" size="sm">
              Annuler
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={submitting}>
              {editingSession ? 'Mettre à jour' : 'Enregistrer la session'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Supprimer cette session ?"
        message="Êtes-vous sûr de vouloir supprimer cette session ? Les inscriptions associées devront être réassignées."
      />
    </div>
  );
};

export default SessionsManager;
