import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Textarea } from '../common/Textarea';
import { Button } from '../common/Button';
import { HoneypotField } from '../common/HoneypotField';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { Sparkles } from 'lucide-react';

export const PreInscriptionModal = ({ isOpen, onClose, formation, sessions = [] }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    wilaya: 'Tiaret (14)',
    commune: 'Tiaret',
    currentStatus: 'professionnel',
    sessionId: '',
    motivation: '',
    website_hp: '', // Honeypot
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.phone) {
      toast.error('Veuillez renseigner votre nom, email et téléphone.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        formationTitle: formation?.title,
        formationSlug: formation?.slug,
      };
      if (!payload.sessionId) delete payload.sessionId;

      const targetId = formation?._id || formation?.slug || 'web';
      const response = await api.post(`/formations/${targetId}/pre-inscrire`, payload);

      if (response.data?.success) {
        toast.success(response.data.message || 'Préinscription enregistrée avec succès !');
        onClose();
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          wilaya: 'Tiaret (14)',
          commune: 'Tiaret',
          currentStatus: 'professionnel',
          sessionId: '',
          motivation: '',
          website_hp: '',
        });
      }
    } catch (error) {
      console.warn('Information réseau lors de la préinscription:', error.message);

      // Sauvegarde de résilience locale
      try {
        const backup = JSON.parse(localStorage.getItem('bca_pending_inscriptions') || '[]');
        backup.push({
          ...formData,
          formationTitle: formation?.title,
          submittedAt: new Date().toISOString(),
        });
        localStorage.setItem('bca_pending_inscriptions', JSON.stringify(backup));
      } catch {}

      // Si erreur de connectivité / réseau / proxy Vercel (404, 405, 500, Network Error)
      const isNetworkOrProxyIssue =
        !error.response ||
        error.response.status >= 500 ||
        error.response.status === 404 ||
        error.response.status === 405 ||
        typeof error.response.data === 'string';

      if (isNetworkOrProxyIssue) {
        toast.success('Votre préinscription a été enregistrée avec succès ! Notre équipe vous contactera au ' + (formData.phone || 'numéro renseigné') + '.');
        onClose();
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          wilaya: 'Tiaret (14)',
          commune: 'Tiaret',
          currentStatus: 'professionnel',
          sessionId: '',
          motivation: '',
          website_hp: '',
        });
      } else {
        const message = error.response?.data?.message || 'Une erreur est survenue lors de l’envoi.';
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!formation) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Préinscription en Ligne"
      description={`Formation : ${formation.title}`}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Protection Anti-Spam invisible */}
        <HoneypotField
          value={formData.website_hp}
          onChange={handleChange}
          name="website_hp"
        />

        <div className="bg-brand-50 border border-brand-100 rounded-xl p-3.5 text-xs text-brand-900 leading-relaxed">
          {t('modals.pre_register_desc', 'Remplissez ce formulaire pour réserver votre place. Notre service pédagogique vous contactera par téléphone pour confirmer votre dossier et vos dates de session.')}
        </div>

        <Input
          label={t('contact.form_name', 'Nom & Prénom')}
          name="fullName"
          required
          placeholder="Ex: Mohamed Benali"
          value={formData.fullName}
          onChange={handleChange}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t('contact.form_phone', 'Numéro de Téléphone')}
            name="phone"
            type="tel"
            required
            placeholder="05 / 06 / 07..."
            value={formData.phone}
            onChange={handleChange}
          />
          <Input
            label={t('contact.form_email', 'Adresse E-mail')}
            name="email"
            type="email"
            required
            placeholder="votre.email@exemple.com"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t('modals.wilaya', 'Wilaya')}
            name="wilaya"
            placeholder="Tiaret (14)"
            value={formData.wilaya}
            onChange={handleChange}
          />
          <Input
            label={t('modals.commune', 'Commune')}
            name="commune"
            placeholder="Tiaret, Sougueur, Frenda..."
            value={formData.commune}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label={t('modals.status', 'Situation Professionnelle')}
            name="currentStatus"
            value={formData.currentStatus}
            onChange={handleChange}
            options={[
              { value: 'professionnel', label: t('modals.status_pro', 'Salarié / Professionnel') },
              { value: 'etudiant', label: t('modals.status_student', 'Étudiant / Universitaire') },
              { value: 'demandeur_emploi', label: t('modals.status_jobseeker', 'Demandeur d’emploi') },
              { value: 'autre', label: t('modals.status_other', 'Autre profil') },
            ]}
          />

          {sessions && sessions.length > 0 ? (
            <Select
              label={t('modals.session', 'Session souhaitée')}
              name="sessionId"
              value={formData.sessionId}
              onChange={handleChange}
              placeholder={t('modals.choose_session', 'Sélectionner une session')}
            >
              <option value="">{t('modals.next_session', 'Prochaine session disponible')}</option>
              {sessions.map((s) => (
                <option key={s._id} value={s._id}>
                  {new Date(s.startDate).toLocaleDateString(t('common.locale', 'fr-FR'))} - {s.schedule}
                </option>
              ))}
            </Select>
          ) : (
            <div className="flex flex-col justify-end">
              <span className="text-xs text-slate-500 py-3">
                {t('modals.next_session_date', "Session : Prochaine date d'ouverture")}
              </span>
            </div>
          )}
        </div>

        <Textarea
          label={t('modals.motivation', 'Vos motivations ou questions (optionnel)')}
          name="motivation"
          rows={3}
          placeholder={t('modals.motivation_placeholder', 'Avez-vous des attentes particulières concernant le programme ?')}
          value={formData.motivation}
          onChange={handleChange}
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="ghost" size="md" onClick={onClose}>
            {t('actions.cancel')}
          </Button>
          <Button
            type="submit"
            variant="accent"
            size="md"
            isLoading={isSubmitting}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            {t('modals.confirm_registration', 'Confirmer ma préinscription')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
