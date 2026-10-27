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
import { Send } from 'lucide-react';

export const QuoteModal = ({
  isOpen,
  onClose,
  prestation = null,
  initialType = 'prestation',
  adSlotInterest = '',
}) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    email: '',
    phone: '',
    budget: '50 000 - 150 000 DZD',
    deadline: 'Dans le mois',
    projectDescription: '',
    type: initialType,
    adSlotInterest: adSlotInterest || '',
    website_hp: '', // Honeypot
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.phone || !formData.projectDescription) {
      toast.error('Veuillez compléter les informations indispensables du devis.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        prestationId: prestation ? prestation._id : null,
      };

      const response = await api.post('/prestations/quotes', payload);

      if (response.data.success) {
        toast.success('Votre demande de devis a été envoyée ! Un chargé d’affaires vous répondra sous 24h.');
        onClose();
        setFormData({
          fullName: '',
          company: '',
          email: '',
          phone: '',
          budget: '50 000 - 150 000 DZD',
          deadline: 'Dans le mois',
          projectDescription: '',
          type: initialType,
          adSlotInterest: '',
          website_hp: '',
        });
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Erreur lors de la transmission du devis.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        prestation
          ? `${t('actions.request_quote')}: ${prestation.title}`
          : initialType === 'publicite'
          ? t('ads.request_ad_quote', 'Demander un Devis Publicitaire')
          : t('services.request_quote_title', 'Demande de Devis Personnalisé')
      }
      description={t('services.request_quote_desc', 'Recevez une proposition détaillée chiffrée adaptée à vos besoins et délais.')}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <HoneypotField
          value={formData.website_hp}
          onChange={handleChange}
          name="website_hp"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t('contact.form_name', 'Nom & Prénom')}
            name="fullName"
            required
            placeholder="Ex: Amina Saadi"
            value={formData.fullName}
            onChange={handleChange}
          />
          <Input
            label={t('modals.company', 'Entreprise ou Organisation')}
            name="company"
            placeholder="Ex: SARL Tiaret Trading"
            value={formData.company}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t('contact.form_phone', 'Téléphone')}
            name="phone"
            type="tel"
            required
            placeholder="05 / 06 / 07..."
            value={formData.phone}
            onChange={handleChange}
          />
          <Input
            label={t('contact.form_email', 'E-mail')}
            name="email"
            type="email"
            required
            placeholder="contact@entreprise.dz"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label={t('modals.budget', 'Budget estimé')}
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            options={[
              { value: '< 30 000 DZD', label: '< 30 000 DZD' },
              { value: '30 000 - 80 000 DZD', label: '30 000 - 80 000 DZD' },
              { value: '80 000 - 200 000 DZD', label: '80 000 - 200 000 DZD' },
              { value: '> 200 000 DZD', label: '> 200 000 DZD' },
              { value: 'A définir', label: t('modals.budget_tbd', 'À définir selon proposition') },
            ]}
          />

          <Select
            label={t('modals.deadline', 'Délai souhaité')}
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            options={[
              { value: 'Urgent (< 1 semaine)', label: t('modals.deadline_urgent', 'Urgent (moins d’une semaine)') },
              { value: 'Dans le mois', label: t('modals.deadline_month', 'Dans le mois') },
              { value: 'Dans 2 à 3 mois', label: t('modals.deadline_few_months', 'Dans 2 à 3 mois') },
              { value: 'Projet futur', label: t('modals.deadline_future', 'Projet à l’étude') },
            ]}
          />
        </div>

        <Textarea
          label={t('modals.project_desc', 'Description de votre projet & objectifs')}
          name="projectDescription"
          required
          rows={4}
          placeholder={t('modals.project_desc_placeholder', 'Détaillez vos besoins (supports souhaités, charte existante, public cible, canaux de diffusion)...')}
          value={formData.projectDescription}
          onChange={handleChange}
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="ghost" size="md" onClick={onClose}>
            {t('actions.cancel')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            rightIcon={<Send className="w-4 h-4" />}
          >
            {t('actions.send', 'Envoyer ma demande de devis')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
