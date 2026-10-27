import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Clock,
  Calendar,
  CheckCircle2,
  Users,
  Award,
  ChevronDown,
  Sparkles,
  MapPin,
  Share2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import api from '../../services/api';
import { SEOHelmet } from '../../components/common/SEOHelmet';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ShareButtons } from '../../components/common/ShareButtons';
import { PreInscriptionModal } from '../../components/forms/PreInscriptionModal';
import { getImageUrl } from '../../utils/imageUrl';

const cleanItem = (text) => {
  if (typeof text !== 'string') return String(text || '');
  let s = text.trim();
  // Nettoyer les caractères parasites de JSON mal échappé ou markdown
  s = s.replace(/^\[['"]*|['"]*\]$/g, '');
  s = s.replace(/^\\*["']+|\\*["']+$/g, '');
  s = s.replace(/^[\*\-\•]\s*/, '');
  s = s.replace(/\\"/g, '"');
  return s.trim();
};

const normalizeList = (arr) => {
  if (!arr) return [];
  if (typeof arr === 'string') {
    try {
      const parsed = JSON.parse(arr);
      if (Array.isArray(parsed)) return normalizeList(parsed);
    } catch {
      return arr
        .split('\n')
        .map(cleanItem)
        .filter(Boolean);
    }
  }
  if (Array.isArray(arr)) {
    return arr
      .flatMap((item) => {
        if (typeof item === 'string' && (item.trim().startsWith('[') || item.includes('","'))) {
          try {
            const parsed = JSON.parse(item);
            if (Array.isArray(parsed)) return parsed.map(cleanItem).filter(Boolean);
          } catch {}
        }
        const cleaned = cleanItem(item);
        return cleaned ? [cleaned] : [];
      })
      .filter(Boolean);
  }
  return [];
};

export const FormationDetail = () => {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const [formation, setFormation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeModule, setActiveModule] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  const isArabic = (i18n.language || 'fr').toLowerCase().startsWith('ar');
  const dateLocale = isArabic ? 'ar-DZ' : 'fr-FR';

  useEffect(() => {
    const fetchFormation = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/formations/${slug}`);
        if (res.data.success) {
          setFormation(res.data.data);
        }
      } catch (err) {
        console.error('Erreur chargement formation :', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormation();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="py-24 text-center text-slate-500 text-sm">
        {t('common.loading', 'Chargement des détails de la formation...')}
      </div>
    );
  }

  if (!formation) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl shadow-card text-center border border-slate-200">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900">
          {t('courses.course_not_found', 'Formation introuvable')}
        </h2>
        <p className="text-xs text-slate-500 mt-2 mb-6">
          {t('courses.course_not_found_desc', "Cette formation n'existe pas ou a été désactivée par l'administration.")}
        </p>
        <Button to="/formations" variant="primary" size="md">
          {t('courses.back_to_catalog', 'Retour au catalogue')}
        </Button>
      </div>
    );
  }

  const handleOpenRegistration = (session = null) => {
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  const objectives = normalizeList(formation.objectives);
  const targetAudience = normalizeList(formation.targetAudience);
  const prerequisites = normalizeList(formation.prerequisites);

  // Données structurées JSON-LD Schema.org Course
  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: formation.title,
    description: formation.summary,
    provider: {
      '@type': 'Organization',
      name: 'Centre B.C.A. Tiaret',
      sameAs: window.location.origin,
    },
    educationalCredentialAwarded: formation.certification,
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <SEOHelmet
        title={formation.title}
        description={formation.summary}
        image={getImageUrl(formation.image)}
        url={`/formations/${formation.slug}`}
        schemaJson={courseSchema}
      />

      {/* 1. En-tête de la formation */}
      <section className="bg-brand-950 text-white py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center gap-2">
                <Link to="/formations" className="text-xs text-slate-400 hover:text-white transition">
                  {t('nav.courses', 'Formations')}
                </Link>
                <span className="text-slate-600">/</span>
                <Badge variant="brand">{formation.category?.name}</Badge>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-snug">
                {formation.title}
              </h1>

              {formation.subtitle && (
                <p className="text-sm sm:text-base text-accent-300 font-medium">
                  {formation.subtitle}
                </p>
              )}

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                {formation.summary}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-accent-400" />
                  <span>
                    {formation.duration ? (
                      <strong>{formation.duration}</strong>
                    ) : (
                      <>
                        <strong>{formation.durationHours || 30}</strong> {t('courses.hours_of_training', 'h de formation')} ({formation.durationWeeks || 4} {t('courses.weeks', 'semaines')})
                      </>
                    )}
                  </span>
                </div>
                {formation.certification && (
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-accent-400" />
                    <span>{formation.certification}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Carte Tarif & Action Rapide */}
            <div className="lg:col-span-4 bg-white text-slate-900 rounded-2xl p-6 shadow-xl border border-slate-100 space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t('courses.session_price', 'TARIF DE SESSION')}
                </span>
                <span className="text-2xl font-extrabold text-brand-950 font-sans">
                  {formation.priceDisplay}
                </span>
              </div>

              <Button
                onClick={() => handleOpenRegistration()}
                variant="accent"
                size="lg"
                className="w-full"
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                {t('courses.enroll_now', "S'inscrire à cette formation")}
              </Button>

              <p className="text-[11px] text-slate-500 text-center leading-normal">
                {t('courses.no_payment_notice', 'Préinscription sans paiement immédiat. Confirmation par notre équipe.')}
              </p>

              <div className="pt-3 border-t border-slate-100">
                <ShareButtons url={`/formations/${formation.slug}`} title={formation.title} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Contenu Détaillé */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Colonne Principale */}
          <div className="lg:col-span-8 space-y-10">
            {/* Objectifs Pédagogiques */}
            {objectives.length > 0 && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-soft">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-brand-600" />
                  {t('courses.objectives', 'Objectifs Pédagogiques')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {objectives.map((obj, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-600 shrink-0 mt-2" />
                      <span>{obj}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description Détaillée */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-soft">
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                {t('courses.overview', 'Présentation de la Formation')}
              </h2>
              <div
                className="text-sm text-slate-700 leading-relaxed space-y-3 prose max-w-none"
                dangerouslySetInnerHTML={{ __html: formation.description }}
              />
            </div>

            {/* Programme Modulaire Accordéon */}
            {formation.program && formation.program.length > 0 && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-soft">
                <h2 className="text-lg font-bold text-slate-900 mb-2">
                  {t('courses.program_detailed', 'Programme Détaillé des Modules')}
                </h2>
                <p className="text-xs text-slate-500 mb-6">
                  {t('courses.program_sub', "Consultez les modules d'apprentissage pratiques abordés lors de la formation.")}
                </p>

                <div className="space-y-3">
                  {formation.program.map((mod, idx) => {
                    const isOpen = activeModule === idx;
                    return (
                      <div
                        key={idx}
                        className="rounded-xl border border-slate-200 overflow-hidden transition"
                      >
                        <button
                          type="button"
                          onClick={() => setActiveModule(isOpen ? -1 : idx)}
                          className="w-full p-4 text-start font-semibold text-sm flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition"
                        >
                          <span className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-md bg-brand-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                              {mod.moduleNumber || idx + 1}
                            </span>
                            <span className="text-slate-900">{mod.title}</span>
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 text-slate-400 transition-transform ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>

                        {isOpen && mod.content && (
                          <div className="p-4 bg-white text-xs text-slate-600 border-t border-slate-200 leading-relaxed whitespace-pre-line">
                            {cleanItem(mod.content)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Calendrier des Sessions Ouvertes */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-soft">
              <h2 className="text-lg font-bold text-slate-900 mb-2">
                {t('courses.sessions_in_tiaret', 'Sessions Programmées à Tiaret')}
              </h2>
              <p className="text-xs text-slate-500 mb-6">
                {t('courses.sessions_sub', "Réservez directement votre place pour la prochaine date d'ouverture.")}
              </p>

              {formation.sessions && formation.sessions.length > 0 ? (
                <div className="space-y-3">
                  {formation.sessions.map((sess) => (
                    <div
                      key={sess._id}
                      className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">
                            {t('courses.start_date_label', 'Début :')}{' '}
                            {new Date(sess.startDate).toLocaleDateString(dateLocale, {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                          {sess.isFull ? (
                            <Badge variant="danger">{t('courses.session_full', 'Complet')}</Badge>
                          ) : (
                            <Badge variant="success">
                              {sess.availableSeats} {t('courses.seats_left', 'places restantes')}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          {sess.schedule && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {sess.schedule}
                            </span>
                          )}
                          {sess.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {sess.location}
                            </span>
                          )}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleOpenRegistration(sess)}
                        disabled={sess.isFull}
                        variant="primary"
                        size="sm"
                      >
                        {sess.isFull
                          ? t('courses.session_full_btn', 'Session Complète')
                          : t('courses.book_session', 'Réserver cette session')}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900">
                  {t('courses.no_sessions_notice', "Aucune session n'est programmée actuellement. Vous pouvez effectuer une préinscription libre pour figurer sur la liste prioritaire de la prochaine ouverture.")}
                </div>
              )}
            </div>
          </div>

          {/* Colonne Latérale */}
          <div className="lg:col-span-4 space-y-6">
            {/* Formateur */}
            {formation.trainer && formation.trainer.name && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft text-center space-y-3">
                <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider block">
                  {t('courses.your_trainer', 'Votre Formateur')}
                </span>
                {formation.trainer.photo ? (
                  <img
                    src={getImageUrl(formation.trainer.photo)}
                    alt={formation.trainer.name}
                    className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-brand-500 shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-800 font-bold text-xl flex items-center justify-center mx-auto">
                    {formation.trainer.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{formation.trainer.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{formation.trainer.title}</p>
                </div>
                {formation.trainer.bio && (
                  <p className="text-xs text-slate-600 leading-relaxed">{formation.trainer.bio}</p>
                )}
              </div>
            )}

            {/* Public Cible & Prérequis */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft space-y-5">
              {targetAudience.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-brand-600" /> {t('courses.target_audience', 'Public Visé')}
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {targetAudience.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-brand-600 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {prerequisites.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    {t('courses.prerequisites', "Prérequis d'admission")}
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {prerequisites.map((req, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-accent-500 shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Besoin d'informations complémentaires */}
            <div className="bg-gradient-to-br from-brand-950 to-brand-900 text-white rounded-2xl p-6 space-y-3">
              <h3 className="font-bold text-sm">
                {t('courses.question_prompt', 'Une question sur ce programme ?')}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t('courses.question_sub', 'Nos conseillers pédagogiques répondent à vos interrogations par téléphone ou via WhatsApp.')}
              </p>
              <Button to="/contact" variant="accent" size="sm" className="w-full">
                {t('actions.contact_us', 'Nous contacter directement')}
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Modale de Préinscription */}
      <PreInscriptionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSession(null);
        }}
        formation={formation}
        sessions={formation.sessions || []}
      />
    </div>
  );
};

export default FormationDetail;