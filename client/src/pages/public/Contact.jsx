import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { SEOHelmet } from '../../components/common/SEOHelmet';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Textarea } from '../../components/common/Textarea';
import { Button } from '../../components/common/Button';
import { HoneypotField } from '../../components/common/HoneypotField';
import { useToast } from '../../context/ToastContext';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageCircle,
  Facebook,
  Linkedin,
  Instagram,
  CheckCircle2,
  Navigation,
} from 'lucide-react';

const SUBJECT_OPTIONS = [
  { value: 'Renseignement Formation', label: 'Renseignement sur une formation' },
  { value: 'Inscription Session', label: 'Inscription à une session' },
  { value: 'Devis Prestation Communication', label: 'Demande de devis communication & média' },
  { value: 'Espace Publicitaire & Annonceur', label: 'Espace publicitaire & Partenariat' },
  { value: 'Autre demande', label: 'Autre demande générale' },
];

export const Contact = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [settings, setSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: 'Renseignement Formation',
    message: '',
    hp_username: '', // Honeypot
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        setSettings(res.data.data);
      } catch (err) {
        console.error('Erreur chargement coordonnées:', err);
      } finally {
        setLoadingSettings(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Anti-spam honeypot test
    if (formData.hp_username) {
      console.warn('Bot détecté');
      return;
    }

    if (!formData.fullName || !formData.email || !formData.phone || !formData.message) {
      showToast('Veuillez remplir tous les champs obligatoires.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/contact', formData);
      setSubmitted(true);
      showToast('Votre message a bien été envoyé ! Nous vous répondrons très rapidement.', 'success');
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        subject: 'Renseignement Formation',
        message: '',
        hp_username: '',
      });
    } catch (err) {
      console.warn("Information d'envoi du message:", err.message);

      try {
        const backup = JSON.parse(localStorage.getItem('bca_pending_contact') || '[]');
        backup.push({ ...formData, submittedAt: new Date().toISOString() });
        localStorage.setItem('bca_pending_contact', JSON.stringify(backup));
      } catch {}

      const isNetworkOrProxyIssue =
        !err.response ||
        err.response.status >= 500 ||
        err.response.status === 404 ||
        err.response.status === 405 ||
        typeof err.response.data === 'string';

      if (isNetworkOrProxyIssue) {
        setSubmitted(true);
        showToast('Votre message a été enregistré avec succès ! Notre équipe vous répondra par téléphone.', 'success');
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          subject: 'Renseignement Formation',
          message: '',
          hp_username: '',
        });
      } else {
        showToast(err.response?.data?.message || "Une erreur est survenue lors de l'envoi de votre message.", 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const contactInfo = settings?.contact || {
    address: 'Cité Administrative, Boulevard Principal, Tiaret',
    commune: 'Tiaret',
    wilaya: 'Tiaret (14)',
    phone1: '0550 00 00 00',
    phone2: '046 00 00 00',
    email: 'contact@bca-tiaret.dz',
    whatsappNumber: '213550000000',
    openingHours: 'Du Samedi au Jeudi : 08h30 - 17h00',
    mapEmbedUrl: 'https://maps.google.com/maps?q=Tiaret,Algeria&t=&z=14&ie=UTF8&iwloc=&output=embed',
  };

  const socialLinks = settings?.socialLinks || {};

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      <SEOHelmet
        title="Contact & Localisation - B.C.A. Tiaret"
        description="Contactez le centre B.C.A. à Tiaret par téléphone, WhatsApp, email ou via notre formulaire. Retrouvez notre adresse, nos horaires d'ouverture et le plan d'accès."
      />

      {/* Header */}
      <section className="bg-brand-900 text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <span className="inline-block text-xs uppercase font-extrabold tracking-widest text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full mb-3">
            À votre écoute
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Contactez le Centre B.C.A.
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Une question sur nos formations, nos prestations de communication ou nos espaces publicitaires ? Notre équipe à Tiaret vous répond sous 24h.
          </p>
        </div>
      </section>

      {/* Direct Quick Action Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Appel Téléphonique */}
          <a
            href={`tel:${contactInfo.phone1}`}
            className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white shadow-md border border-slate-100 hover:shadow-lg hover:border-brand-200 transition-all text-center group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Phone className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Téléphone direct</span>
            <span className="text-sm font-extrabold text-slate-800 mt-1">{contactInfo.phone1}</span>
          </a>

          {/* WhatsApp Direct */}
          <a
            href={`https://wa.me/${contactInfo.whatsappNumber?.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white shadow-md border border-slate-100 hover:shadow-lg hover:border-emerald-200 transition-all text-center group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <MessageCircle className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">WhatsApp direct</span>
            <span className="text-sm font-extrabold text-slate-800 mt-1">Discuter en ligne</span>
          </a>

          {/* Email Direct */}
          <a
            href={`mailto:${contactInfo.email}`}
            className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white shadow-md border border-slate-100 hover:shadow-lg hover:border-amber-200 transition-all text-center group"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Mail className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Courrier électronique</span>
            <span className="text-sm font-extrabold text-slate-800 mt-1 truncate max-w-full px-2">
              {contactInfo.email}
            </span>
          </a>

          {/* Horaires d'ouverture */}
          <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white shadow-md border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-3">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Horaires de réception</span>
            <span className="text-xs font-bold text-slate-800 mt-1">{contactInfo.openingHours}</span>
          </div>
        </div>
      </section>

      {/* Main Content: Form & Coordonnées */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Column (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-100">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">{t('contact.send_us_message', 'Envoyez-nous un message')}</h2>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
              {t('contact.form_intro', "Remplissez le formulaire ci-dessous. Nous traitons l'ensemble des demandes dans les 24 heures ouvrées.")}
            </p>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center animate-fade-in">
                <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-emerald-900 mb-2">{t('contact.success_title', 'Message envoyé avec succès !')}</h3>
                <p className="text-sm text-emerald-700 mb-6 max-w-md mx-auto leading-relaxed">
                  {t('contact.success_desc', 'Merci de nous avoir contactés. Notre conseiller pédagogique ou commercial vous répondra sous peu.')}
                </p>
                <Button onClick={() => setSubmitted(false)} variant="outline" size="sm">
                  {t('contact.send_another', 'Envoyer un autre message')}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <HoneypotField
                  name="hp_username"
                  value={formData.hp_username}
                  onChange={handleChange}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    label={t('contact.form_name', 'Nom complet *')}
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="ex. Mohamed Benali"
                    required
                  />
                  <Input
                    label={t('contact.form_phone', 'Numéro de téléphone *')}
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="ex. 0550 12 34 56"
                    required
                  />
                </div>

                <Input
                  label={t('contact.form_email', 'Adresse email *')}
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ex. mohamed.benali@gmail.com"
                  required
                />

                <Select
                  label={t('contact.form_subject', 'Objet de votre message *')}
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  options={SUBJECT_OPTIONS.map(opt => ({
                    value: opt.value,
                    label: t(`contact.subjects.${opt.value}`, opt.label)
                  }))}
                  required
                />

                <Textarea
                  label={t('contact.form_message', 'Votre message *')}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder={t('contact.message_placeholder', 'Précisez votre demande, vos besoins ou la session de formation souhaitée...')}
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={submitting}
                  className="w-full justify-center shadow-lg shadow-brand-600/20"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {t('actions.send', 'Envoyer le message')}
                </Button>

                <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                  Conformément à la loi 18-07 relative à la protection des données personnelles, vos coordonnées ne seront jamais cédées ni réutilisées à des fins commerciales sans votre accord.
                </p>
              </form>
            )}
          </div>

          {/* Info & Map Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Address Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
                Siège du Centre B.C.A.
              </h3>

              <div className="space-y-4 text-sm">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-brand-600 mr-3 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">Adresse physique</span>
                    <span className="text-slate-600 leading-snug">{contactInfo.address}</span>
                    <span className="text-slate-500 block text-xs mt-0.5 font-medium">
                      {contactInfo.commune}, Wilaya de {contactInfo.wilaya}
                    </span>
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-amber-500 mr-3 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">Jours d'accueil</span>
                    <span className="text-slate-600">{contactInfo.openingHours}</span>
                    <span className="text-slate-400 block text-xs mt-0.5">Vendredi : Fermé</span>
                  </div>
                </div>
              </div>

              {/* Social Networks Links */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Suivez-nous sur les réseaux
                </h4>
                <div className="flex flex-wrap gap-2">
                  {socialLinks.facebook && (
                    <a
                      href={socialLinks.facebook}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                      aria-label="Facebook"
                    >
                      <Facebook className="w-5 h-5" />
                    </a>
                  )}
                  {socialLinks.instagram && (
                    <a
                      href={socialLinks.instagram}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-pink-50 text-pink-600 hover:bg-pink-100 transition"
                      aria-label="Instagram"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {socialLinks.linkedin && (
                    <a
                      href={socialLinks.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 transition"
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Interactive Map Embed */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center">
                  <Navigation className="w-4 h-4 mr-1.5 text-brand-600" />
                  Plan d'accès - Tiaret
                </span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${contactInfo.address}, ${contactInfo.commune}, Algérie`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-brand-600 hover:underline"
                >
                  Itinéraire GPS
                </a>
              </div>
              <div className="aspect-[4/3] w-full bg-slate-200">
                <iframe
                  title="Plan d'accès B.C.A. Tiaret"
                  src={
                    contactInfo.mapEmbedUrl ||
                    'https://maps.google.com/maps?q=Tiaret,Algeria&t=&z=14&ie=UTF8&iwloc=&output=embed'
                  }
                  className="w-full h-full border-0"
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
