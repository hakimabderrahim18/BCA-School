import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import api from '../../services/api';
import { SEOHelmet } from '../../components/common/SEOHelmet';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { QuoteModal } from '../../components/forms/QuoteModal';
import { getImageUrl } from '../../utils/imageUrl';

export const Prestations = () => {
  const { t } = useTranslation();
  const [prestations, setPrestations] = useState([]);
  const [realisations, setRealisations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [selectedPrestation, setSelectedPrestation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [prestRes, realRes, catRes] = await Promise.all([
          api.get('/prestations'),
          api.get('/prestations/realisations?limit=6'),
          api.get('/categories?type=prestation'),
        ]);

        if (prestRes.data.success) setPrestations(prestRes.data.data);
        if (realRes.data.success) setRealisations(realRes.data.data);
        if (catRes.data.success) setCategories(catRes.data.data);
      } catch (err) {
        console.error('Erreur chargement prestations :', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredPrestations = selectedCategory
    ? prestations.filter((p) => p.category?._id === selectedCategory)
    : prestations;

  const handleOpenQuote = (prestation = null) => {
    setSelectedPrestation(prestation);
    setIsQuoteOpen(true);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <SEOHelmet
        title="Prestations & Solutions de Communication"
        description="Identité visuelle, création de supports, spots publicitaires vidéo 4K, gestion de réseaux sociaux et communication d'entreprise à Tiaret."
      />

      {/* En-tête */}
      <section className="bg-brand-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="inline-block px-3 py-1 rounded-full bg-accent-500/20 text-accent-400 border border-accent-400/30 text-xs font-bold uppercase tracking-wider">
            {t('services.agency_badge', 'Agence de Communication & Conseil')}
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            {t('services.title')}
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300">
            {t('services.subtitle')}
          </p>
          <div className="pt-2">
            <Button
              onClick={() => handleOpenQuote()}
              variant="accent"
              size="lg"
              leftIcon={<Briefcase className="w-4 h-4" />}
            >
              {t('services.request_custom_quote', 'Demander un devis personnalisé')}
            </Button>
          </div>
        </div>
      </section>

      {/* Filtres par Catégorie */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-7">
          <div className="bg-white rounded-2xl shadow-card border border-slate-200/80 p-3 sm:p-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === ''
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t('actions.all_categories', 'Toutes les prestations')}
            </button>
            {categories.map((c) => (
              <button
                key={c._id}
                onClick={() => setSelectedCategory(c._id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedCategory === c._id
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Grille des Prestations */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPrestations.map((p) => (
            <div
              key={p._id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-card transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img
                  src={getImageUrl(p.image)}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-3 start-3">
                  <Badge variant="brand">{p.category?.name}</Badge>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 hover:text-brand-600 transition leading-snug">
                    <Link to={`/prestations/${p.slug}`}>{p.title}</Link>
                  </h3>
                  <p className="mt-2 text-xs text-slate-500 line-clamp-3 leading-relaxed">
                    {p.summary}
                  </p>

                  {p.benefits && p.benefits.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {p.benefits.slice(0, 3).map((benefit, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-bold text-brand-700">{p.priceDisplay}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {p.delay}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button
                    to={`/prestations/${p.slug}`}
                    variant="ghost"
                    size="sm"
                    className="w-full"
                  >
                    {t('actions.more_info', 'Détails')}
                  </Button>
                  <Button
                    onClick={() => handleOpenQuote(p)}
                    variant="primary"
                    size="sm"
                    className="w-full"
                  >
                    {t('actions.request_quote', 'Devis')}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Section « Nos Réalisations » (Portfolio) */}
      {realisations.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-accent-600 block mb-2">
              Portfolio
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('services.realisations')}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Découvrez quelques-uns des projets graphiques, audiovisuels et digitaux menés pour nos clients à Tiaret.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {realisations.map((real) => (
              <div
                key={real._id}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-soft hover:shadow-card transition"
              >
                <div className="relative h-48 overflow-hidden bg-slate-950">
                  <img
                    src={getImageUrl(real.coverImage)}
                    alt={real.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 start-3">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-brand-950/80 text-white backdrop-blur-sm">
                      {real.clientName}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-2">
                  <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider block">
                    {real.prestation?.title}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition">
                    {real.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                    {real.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Modale de Devis */}
      <QuoteModal
        isOpen={isQuoteOpen}
        onClose={() => {
          setIsQuoteOpen(false);
          setSelectedPrestation(null);
        }}
        prestation={selectedPrestation}
        initialType="prestation"
      />
    </div>
  );
};

export default Prestations;
