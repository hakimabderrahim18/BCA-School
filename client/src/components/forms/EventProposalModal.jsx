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
import { CalendarPlus } from 'lucide-react';

export const EventProposalModal = ({ isOpen, onClose, categories = [] }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flyerFile, setFlyerFile] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    startDate: '',
    startTime: '09:00',
    venue: '',
    commune: 'Tiaret',
    organizerName: '',
    organizerPhone: '',
    organizerEmail: '',
    description: '',
    website: '',
    website_hp: '', // Honeypot
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFlyerFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title?.trim()) {
      toast.error(t('events.error_title', 'Veuillez saisir le titre de l’événement.'));
      return;
    }
    if (!formData.category) {
      toast.error(t('events.error_category', 'Veuillez sélectionner une catégorie.'));
      return;
    }
    if (!formData.startDate) {
      toast.error(t('events.error_date', 'Veuillez renseigner la date de l’événement.'));
      return;
    }
    if (!formData.venue?.trim()) {
      toast.error(t('events.error_venue', 'Veuillez préciser le lieu ou la salle.'));
      return;
    }
    if (!formData.organizerName?.trim()) {
      toast.error(t('events.error_organizer', 'Veuillez renseigner le nom de l’organisateur.'));
      return;
    }
    if (!formData.organizerPhone?.trim()) {
      toast.error(t('events.error_phone', 'Veuillez indiquer un numéro de téléphone de contact.'));
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
      // Fallback description si laissée vide
      if (!formData.description?.trim()) {
        data.set('description', formData.title.trim());
      }
      // Fallback email si laissé vide
      if (!formData.organizerEmail?.trim()) {
        data.set('organizerEmail', 'contact@bca-tiaret.dz');
      }

      if (flyerFile) {
        data.append('flyerImage', flyerFile);
      }

      const response = await api.post('/events/propose', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        toast.success(
          t(
            'events.propose_success',
            'Votre événement a été proposé avec succès ! Il sera publié après vérification.'
          )
        );
        onClose();
        setFormData({
          title: '',
          category: '',
          startDate: '',
          startTime: '09:00',
          venue: '',
          commune: 'Tiaret',
          organizerName: '',
          organizerPhone: '',
          organizerEmail: '',
          description: '',
          website: '',
          website_hp: '',
        });
        setFlyerFile(null);
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Erreur lors de la transmission.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('events.propose_modal_title', 'Proposer un Événement à Tiaret')}
      description={t(
        'events.propose_modal_desc',
        "Partagez votre salon, atelier, spectacle ou rencontre associative sur l'agenda public B.C.A."
      )}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <HoneypotField
          value={formData.website_hp}
          onChange={handleChange}
          name="website_hp"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t('events.event_title', "Intitulé de l'événement *")}
            name="title"
            required
            placeholder="Ex: Salon de l'artisanat et des métiers"
            value={formData.title}
            onChange={handleChange}
          />

          <Select
            label={t('events.category', 'Catégorie *')}
            name="category"
            required
            value={formData.category}
            onChange={handleChange}
            placeholder={t('events.select_category', 'Sélectionner la catégorie')}
          >
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t('events.start_date', 'Date de déroulement *')}
            name="startDate"
            type="date"
            required
            value={formData.startDate}
            onChange={handleChange}
          />
          <Input
            label={t('events.start_time', 'Heure de début')}
            name="startTime"
            type="time"
            value={formData.startTime}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t('events.venue', 'Lieu / Salle *')}
            name="venue"
            required
            placeholder="Ex: Maison de la Culture, Salle omnisports..."
            value={formData.venue}
            onChange={handleChange}
          />
          <Input
            label={t('events.commune', 'Commune *')}
            name="commune"
            required
            placeholder="Tiaret, Sougueur, Frenda..."
            value={formData.commune}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label={t('events.organizer_name', 'Organisateur *')}
            name="organizerName"
            required
            placeholder="Association, club..."
            value={formData.organizerName}
            onChange={handleChange}
          />
          <Input
            label={t('events.contact_phone', 'Téléphone contact *')}
            name="organizerPhone"
            required
            placeholder="05 / 06 / 07..."
            value={formData.organizerPhone}
            onChange={handleChange}
          />
          <Input
            label={t('events.contact_email', 'Email contact')}
            name="organizerEmail"
            type="email"
            placeholder="contact@event.dz"
            value={formData.organizerEmail}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            {t('events.flyer_label', "Affiche ou visuel de l'événement (JPG / PNG / WebP)")}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-xs text-slate-500 file:me-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
          />
        </div>

        <Textarea
          label={t('events.detailed_desc', 'Description & Programme')}
          name="description"
          rows={3}
          placeholder="Programme, intervenants, conditions d'accès (gratuit/payant)..."
          value={formData.description}
          onChange={handleChange}
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="ghost" size="md" onClick={onClose}>
            {t('actions.cancel', 'Annuler')}
          </Button>
          <Button
            type="submit"
            variant="accent"
            size="md"
            isLoading={isSubmitting}
            leftIcon={<CalendarPlus className="w-4 h-4" />}
          >
            {t('events.submit_for_validation', 'Soumettre pour validation')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};