import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { SEOHelmet } from '../../components/common/SEOHelmet';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { StatusBadge } from '../../components/admin/StatusBadge';
import {
  Mail,
  Search,
  Eye,
  Trash2,
  Phone,
  Calendar,
  FileSpreadsheet,
  Reply,
  CheckCircle,
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: '', label: 'Tous les messages' },
  { value: 'nouveau', label: 'Non lus / Nouveaux' },
  { value: 'traite', label: 'Traités' },
  { value: 'archive', label: 'Archivés' },
];

export const ContactMessagesManager = () => {
  const { showToast } = useToast();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Inspect modal
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Delete State
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;

      const res = await api.get('/contact/messages', { params });
      setMessages(res.data.data || []);
    } catch (err) {
      console.error('Erreur chargement messages:', err);
      showToast('Impossible de charger les messages de contact.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [statusFilter]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.patch(`/contact/messages/${id}/status`, { status });
      showToast('Statut du message actualisé.', 'success');
      if (selectedMessage && selectedMessage._id === id) {
        setSelectedMessage((prev) => ({ ...prev, status }));
      }
      fetchMessages();
    } catch (err) {
      console.error('Erreur mise à jour message:', err);
      showToast('Erreur lors de la modification du statut.', 'error');
    }
  };

  const handleExportCSV = async () => {
    try {
      showToast('Génération du fichier Excel (CSV)...', 'info');
      const response = await api.get('/contact/messages/export/csv', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `messages_contact_bca_${new Date().toISOString().slice(0, 10)}.csv`);
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
      await api.delete(`/contact/messages/${deleteId}`);
      showToast('Message supprimé.', 'success');
      setDeleteId(null);
      if (selectedMessage?._id === deleteId) setSelectedMessage(null);
      fetchMessages();
    } catch (err) {
      console.error('Erreur suppression:', err);
      showToast('Erreur lors de la suppression.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = messages.filter((m) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      m.fullName?.toLowerCase().includes(term) ||
      m.email?.toLowerCase().includes(term) ||
      m.phone?.includes(term) ||
      m.subject?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <SEOHelmet title="Boîte de Réception des Messages - B.C.A. Admin" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <Mail className="w-6 h-6 mr-2 text-brand-600" />
            Messages de Contact Reçus
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Consultez et répondez aux demandes d'informations envoyées via le formulaire public.
          </p>
        </div>
        <Button onClick={handleExportCSV} variant="outline" size="md">
          <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600" /> Exporter en CSV (Excel)
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par expéditeur, sujet, email, téléphone..."
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
            <p className="text-xs text-slate-500">Chargement des messages...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Mail className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold">Aucun message de contact dans cette vue.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Expéditeur</th>
                  <th className="px-6 py-3.5">Objet / Sujet</th>
                  <th className="px-6 py-3.5">Date de réception</th>
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
                        <span className="text-[11px] text-slate-400 block font-mono">{item.email}</span>
                        <span className="text-[10px] text-slate-400 block font-mono" dir="ltr">
                          <bdi>{item.phone}</bdi>
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800 block line-clamp-1">
                        {item.subject}
                      </span>
                      <span className="text-[11px] text-slate-400 block line-clamp-1">
                        {item.message}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(item.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <select
                        value={item.status}
                        onChange={(e) => handleUpdateStatus(item._id, e.target.value)}
                        className="px-2 py-1 rounded-lg text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-700 focus:outline-none focus:border-brand-500"
                      >
                        <option value="nouveau">Nouveau</option>
                        <option value="traite">Traité</option>
                        <option value="archive">Archivé</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedMessage(item);
                            if (item.status === 'nouveau') handleUpdateStatus(item._id, 'traite');
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50"
                          title="Lire le message"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <a
                          href={`mailto:${item.email}?subject=RE: ${encodeURIComponent(item.subject)}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50"
                          title="Répondre par e-mail"
                        >
                          <Reply className="w-4 h-4" />
                        </a>
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

      {/* Inspect Message Modal */}
      {selectedMessage && (
        <Modal
          isOpen={!!selectedMessage}
          onClose={() => setSelectedMessage(null)}
          title={`Message : ${selectedMessage.subject}`}
          size="lg"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedMessage.fullName}</h3>
                <span className="text-xs text-slate-400">
                  Envoyé le {new Date(selectedMessage.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <StatusBadge status={selectedMessage.status} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                <span className="font-bold text-slate-700 block uppercase tracking-wider">
                  Coordonnées
                </span>
                <p className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-brand-600" />
                  <a href={`tel:${selectedMessage.phone}`} className="font-bold hover:underline" dir="ltr">
                    <bdi>{selectedMessage.phone}</bdi>
                  </a>
                </p>
                <p className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-3.5 h-3.5 text-brand-600" />
                  <a href={`mailto:${selectedMessage.email}`} className="hover:underline">
                    {selectedMessage.email}
                  </a>
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                <span className="font-bold text-slate-700 block uppercase tracking-wider">
                  Objet
                </span>
                <p className="font-bold text-slate-900 text-sm">{selectedMessage.subject}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-900 block mb-2">Message transmis :</span>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line text-sm">
                {selectedMessage.message}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  onClick={() => handleUpdateStatus(selectedMessage._id, 'traite')}
                  variant="outline"
                  size="sm"
                >
                  <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Marquer Traité
                </Button>
              </div>
              <a
                href={`mailto:${selectedMessage.email}?subject=RE: ${encodeURIComponent(selectedMessage.subject)}`}
                className="inline-flex items-center px-4 py-2 rounded-xl bg-brand-600 text-white font-semibold text-xs hover:bg-brand-700 transition"
              >
                <Reply className="w-4 h-4 mr-1.5" /> Répondre par e-mail
              </a>
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
        title="Supprimer ce message ?"
        message="Êtes-vous sûr de vouloir supprimer définitivement ce message de la boîte de réception ?"
      />
    </div>
  );
};

export default ContactMessagesManager;
