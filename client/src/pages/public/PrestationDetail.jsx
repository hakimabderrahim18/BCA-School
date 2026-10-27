import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Briefcase,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';
import api from '../../services/api';
import { SEOHelmet } from '../../components/common/SEOHelmet';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ShareButtons } from '../../components/common/ShareButtons';
import { QuoteModal } from '../../components/forms/QuoteModal';
import { getImageUrl } from '../../utils/imageUrl';

export const PrestationDetail = () => {
  const { slug } = useParams();
  const { t } = useTranslation();
  const [prestation, setPrestation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  useEffect(() => {
    const fetchPrestation = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/prestations/${slug}`);
        if (res.data.success) {
          setPrestation(res.data.data);
        }
      } catch (err) {
        console.error('Erreur chargement prestation :', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrestation();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="py-24 text-center text-slate-500 text-sm">
        {t('common.loading', 'Chargement des détails de la prestation...')}
      </div>
    );
  }

  if (!prestation) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl shadow-card text-center border border-slate-200">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900">
          {t('services.service_not_found', 'Prestation introuvable')}
        </h2>
        <Button to="/prestations" variant="primary" size="md" className="mt-4">
          {t('services.back_to_services', 'Retour aux prestations')}
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <SEOHelmet
        title={prestation.title}
        description={prestation.summary}
        image={prestation.image}
        url={`/prestations/${prestation.slug}`}
      />

      {/* En-tête de la prestation */}
      <section className="bg-brand-950 text-white py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center gap-2">
                <Link to="/prestations" className="text-xs text-slate-400 hover:text-white transition">
                  {t('nav.services', 'Prestations')}
                </Link>
                <span className="text-slate-600">/</span>
                <Badge variant="brand">{prestation.category?.name}</Badge>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-snug">
                {prestation.title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                {prestation.summary}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-slate-300">
                {prestation.delay && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-accent-400" />
                    <span>
                      {t('services.estimated_delay', 'Délai estimé :')} <strong>{prestation.delay}</strong>
                    </span>
                  </div>
                )}
                {prestation.priceDisplay && (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent-400" />
                    <span>
                      {t('courses.price', 'Tarif :')} <strong>{prestation.priceDisplay}</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Carte CTA Devis */}
            <div className="lg:col-span-4 bg-white text-slate-900 rounded-2xl p-6 shadow-xl border border-slate-100 space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  {t('services.indicative_pricing', 'Tarification indicative')}
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-brand-950 block mt-1">
                  {prestation.priceDisplay}
                </span>
              </div>

              <Button
                onClick={() => setIsQuoteOpen(true)}
                variant="accent"
                size="lg"
                className="w-full"
                leftIcon={<Briefcase className="w-4 h-4" />}
              >
                {t('services.request_quote_btn', 'Demander un devis gratuit')}
              </Button>

              <p className="text-[11px] text-slate-500 text-center leading-normal">
                {t('services.quote_notice', "Devis personnalisé sous 24h avec plan d'action adapté.")}
              </p>

              <div className="pt-3 border-t border-slate-100">
                <ShareButtons url={`/prestations/${prestation.slug}`} title={prestation.title} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contenu Détaillé */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-10">
            {/* Description Complète */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-soft">
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                {t('services.description_title', 'Description de la Prestation')}
              </h2>
              <div
                className="text-sm text-slate-700 leading-relaxed space-y-3 prose max-w-none"
                dangerouslySetInnerHTML={{ __html: prestation.description }}
              />
            </div>

            {/* Bénéfices Clés */}
            {prestation.benefits && prestation.benefits.length > 0 && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-soft">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  {t('services.benefits_title', 'Ce Que Cette Prestation Vous Apporte')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {prestation.benefits.map((b, i) => (
                    <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                      <span className="text-xs sm:text-sm text-slate-800 font-medium">{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Étapes du Projet */}
            {prestation.steps && prestation.steps.length > 0 && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-soft">
                <h2 className="text-lg font-bold text-slate-900 mb-2">
                  {t('services.steps_title', 'Les Étapes de Notre Accompagnement')}
                </h2>
                <p className="text-xs text-slate-500 mb-6">
                  {t('services.steps_sub', 'Une méthodologie claire et transparente pour mener votre projet au succès.')}
                </p>

                <div className="space-y-4">
                  {prestation.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                      <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {step.stepNumber || idx + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">{step.title}</h3>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Réalisations Liées */}
            {prestation.realisations && prestation.realisations.length > 0 && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-soft">
                <h2 className="text-lg font-bold text-slate-900 mb-6">
                  {t('services.recent_works', 'Exemples de Réalisations Récentes')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {prestation.realisations.map((real) => (
                    <div key={real._id} className="rounded-xl overflow-hidden border border-slate-200">
                      <img
                        src={getImageUrl(real.coverImage)}
                        alt={real.title}
                        className="w-full h-40 object-cover"
                      />
                      <div className="p-4">
                        <span className="text-[10px] font-bold text-brand-600 uppercase">
                          {real.clientName}
                        </span>
                        <h4 className="font-bold text-xs text-slate-900 mt-1">{real.title}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Colonne Latérale */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-brand-600" />
                {t('services.how_it_works', 'Comment ça fonctionne ?')}
              </h3>
              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-brand-600">1.</span>
                  <span>{t('services.step1', 'Envoyez votre demande de devis en ligne via notre formulaire.')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-brand-600">2.</span>
                  <span>{t('services.step2', 'Un consultant vous contacte sous 24h pour affiner votre cahier des charges.')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-brand-600">3.</span>
                  <span>{t('services.step3', 'Validation du devis et démarrage de la production à Tiaret.')}</span>
                </li>
              </ul>
            </div>

            <div className="bg-brand-950 text-white rounded-2xl p-6 space-y-3">
              <h3 className="font-bold text-sm">
                {t('services.discuss_project', 'Discuter directement de votre projet')}
              </h3>
              <p className="text-xs text-slate-300">
                {t('services.discuss_sub', "Besoin d'un conseil immédiat ou d'un rendez-vous dans nos locaux ?")}
              </p>
              <Button to="/contact" variant="accent" size="sm" className="w-full">
                {t('services.book_meeting', 'Prendre rendez-vous')}
              </Button>
            </div>
          </div>
        </div>
      </main>

      <QuoteModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        prestation={prestation}
        initialType="prestation"
      />
    </div>
  );
};

export default PrestationDetail;