import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Megaphone,
  CheckCircle2,
  Building2,
  Tag,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  PlusCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';
import { SEOHelmet } from '../../components/common/SEOHelmet';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { QuoteModal } from '../../components/forms/QuoteModal';
import { getImageUrl } from '../../utils/imageUrl';

export const AnnoncesPublicite = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('annuaire'); // 'annuaire' ou 'petites_annonces'
  const [settings, setSettings] = useState(null);
  const [annonceurs, setAnnonceurs] = useState([]);
  const [petitesAnnonces, setPetitesAnnonces] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [quoteInterest, setQuoteInterest] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [settingsRes, annRes, petitesRes, catRes] = await Promise.all([
          api.get('/settings'),
          api.get('/annonceurs'),
          api.get('/petites-annonces'),
          api.get('/categories?type=annonceur'),
        ]);

        if (settingsRes.data.success) setSettings(settingsRes.data.data);
        if (annRes.data.success) setAnnonceurs(annRes.data.data);
        if (petitesRes.data.success) setPetitesAnnonces(petitesRes.data.data);
        if (catRes.data.success) setCategories(catRes.data.data);
      } catch (err) {
        console.error('Erreur chargement page annonces :', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const rates = settings?.advertisingRates || [
    {
      title: 'Bannière En-Tête Accueil',
      description: 'Emplacement premium en haut de page d’accueil avec lien direct vers votre site ou WhatsApp.',
      price: '20 000 DZD / mois',
      duration: '30 jours',
    },
    {
      title: 'Fiche Annuaire Pro Dédiée',
      description: 'Page complète avec photos, coordonnées, horaires, carte interactive et réseaux sociaux.',
      price: '15 000 DZD / an',
      duration: '1 an',
    },
    {
      title: 'Article Sponsorisé & Réseaux',
      description: 'Rédaction d’un article vitrine complet avec relai sur nos pages Facebook et Instagram.',
      price: '10 000 DZD',
      duration: 'Publication permanente',
    },
  ];

  const handleOpenAdQuote = (offerTitle = '') => {
    setQuoteInterest(offerTitle);
    setIsQuoteOpen(true);
  };

  const filteredAnnonceurs = selectedCategory
    ? annonceurs.filter((a) => a.sector?._id === selectedCategory)
    : annonceurs;

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <SEOHelmet
        title="Annonces & Espace Publicitaire"
        description="Faites connaître votre entreprise à Tiaret : bannières web, fiches annonceurs dédiées, articles sponsorisés et petites annonces locales."
      />

      {/* 1. En-tête « Faites-vous connaître » */}
      <section className="bg-brand-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="inline-block px-3 py-1 rounded-full bg-accent-500/20 text-accent-400 border border-accent-400/30 text-xs font-bold uppercase tracking-wider">
            Visibilité Régionale Ciblée
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Faites-vous Connaître à Tiaret
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300">
            Assurez une visibilité maximale à votre commerce, cabinet ou entreprise auprès de milliers de visiteurs locaux grâce aux solutions publicitaires B.C.A.
          </p>
          <div className="pt-2">
            <Button
              onClick={() => handleOpenAdQuote('Pack Publicité B.C.A.')}
              variant="accent"
              size="lg"
              leftIcon={<Megaphone className="w-4 h-4" />}
            >
              Demander un devis publicitaire
            </Button>
          </div>
        </div>
      </section>

      {/* 2. Grille Tarifaire des Offres Publicitaires */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-7">
        <div className="bg-white rounded-2xl shadow-card border border-slate-200/80 p-6 sm:p-8">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-xl font-bold text-slate-900">Nos Formules Publicitaires</h2>
            <p className="text-xs text-slate-500 mt-1">
              Des tarifs transparents et ajustables pour tous les budgets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {rates.map((rate, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200 p-6 flex flex-col justify-between hover:border-brand-500 hover:shadow-md transition bg-slate-50/50"
              >
                <div className="space-y-3">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-brand-100 text-brand-700 uppercase">
                    {rate.duration}
                  </span>
                  <h3 className="font-bold text-base text-slate-900">{rate.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{rate.description}</p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-200 flex items-center justify-between">
                  <span className="font-extrabold text-brand-950 text-base font-sans">{rate.price}</span>
                  <Button
                    onClick={() => handleOpenAdQuote(rate.title)}
                    variant="primary"
                    size="sm"
                  >
                    Choisir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Bascule : Annuaire des Professionnels OU Petites Annonces */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="flex items-center justify-center gap-3 mb-10">
          <button
            onClick={() => setActiveTab('annuaire')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition ${
              activeTab === 'annuaire'
                ? 'bg-brand-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Annuaire des Annonceurs
          </button>
          <button
            onClick={() => setActiveTab('petites_annonces')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition ${
              activeTab === 'petites_annonces'
                ? 'bg-brand-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Petites Annonces Locales
          </button>
        </div>

        {activeTab === 'annuaire' ? (
          /* ================= ANNUAIRE ANNONCEURS ================= */
          <div className="space-y-8">
            {categories.length > 0 && (
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    selectedCategory === ''
                      ? 'bg-brand-950 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Tous les secteurs
                </button>
                {categories.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => setSelectedCategory(c._id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      selectedCategory === c._id
                        ? 'bg-brand-950 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAnnonceurs.map((ann) => (
                <div
                  key={ann._id}
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-card transition flex flex-col justify-between"
                >
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img
                      src={getImageUrl(ann.coverImage)}
                      alt={ann.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-3 start-3">
                      <Badge variant="brand">{ann.sector?.name}</Badge>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={getImageUrl(ann.logo)}
                        alt={ann.name}
                        className="w-12 h-12 rounded-xl object-contain border border-slate-200 p-1 bg-white shrink-0 -mt-10 shadow-md"
                      />
                      <div>
                        <h3 className="font-bold text-base text-slate-900 group-hover:text-brand-600 transition">
                          <Link to={`/annonces-publicite/${ann.slug}`}>{ann.name}</Link>
                        </h3>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" /> {ann.commune}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {ann.shortDescription}
                    </p>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1 truncate" dir="ltr">
                        <Phone className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                        {ann.phone}
                      </span>

                      <Link
                        to={`/annonces-publicite/${ann.slug}`}
                        className="font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1"
                      >
                        Consulter la page <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ================= PETITES ANNONCES LOCALES ================= */
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {petitesAnnonces.map((pa) => (
                <div
                  key={pa._id}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                      {pa.type === 'offre' ? 'Offre' : 'Demande'}
                    </span>
                    <span className="font-extrabold text-sm text-brand-700 font-sans">
                      {pa.priceDisplay}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 leading-snug">{pa.title}</h3>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {pa.description}
                  </p>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {pa.commune}
                    </span>
                    <a
                      href={`tel:${pa.contactPhone}`}
                      className="font-bold text-brand-600 hover:underline flex items-center gap-1"
                      dir="ltr"
                    >
                      <Phone className="w-3.5 h-3.5" /> {pa.contactPhone}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <QuoteModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        initialType="publicite"
        adSlotInterest={quoteInterest}
      />
    </div>
  );
};

export default AnnoncesPublicite;
