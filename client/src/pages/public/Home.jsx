import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  ArrowRight,
  Calendar,
  Clock,
  BookOpen,
  Briefcase,
  Users,
  CheckCircle2,
  ChevronRight,
  Quote,
  Star,
  MapPin,
} from 'lucide-react';

import api from '../../services/api';
import { SEOHelmet } from '../../components/common/SEOHelmet';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { HeroSlider } from '../../components/home/HeroSlider';
import { PartnersTicker } from '../../components/home/PartnersTicker';
import { AdBanner } from '../../components/home/AdBanner';
import { PreInscriptionModal } from '../../components/forms/PreInscriptionModal';
import { QuoteModal } from '../../components/forms/QuoteModal';
import { getImageUrl } from '../../utils/imageUrl';
import {
  FALLBACK_COURSES,
  FALLBACK_SERVICES,
  FALLBACK_EVENTS,
  FALLBACK_ARTICLES,
  FALLBACK_TESTIMONIALS,
  FALLBACK_PARTNERS,
} from '../../data/fallbackData';

export const Home = () => {
  const { t } = useTranslation();

  const [featuredCourses, setFeaturedCourses] = useState(FALLBACK_COURSES);
  const [featuredServices, setFeaturedServices] = useState(FALLBACK_SERVICES);
  const [latestArticles, setLatestArticles] = useState(FALLBACK_ARTICLES);
  const [upcomingEvents, setUpcomingEvents] = useState(FALLBACK_EVENTS);
  const [partners, setPartners] = useState(FALLBACK_PARTNERS);
  const [annonceurs, setAnnonceurs] = useState([]);
  const [testimonials, setTestimonials] = useState(FALLBACK_TESTIMONIALS);
  const [settings, setSettings] = useState(null);

  // État des modales
  const [selectedFormation, setSelectedFormation] = useState(null);
  const [isPreInscriptionOpen, setIsPreInscriptionOpen] = useState(false);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const results = await Promise.allSettled([
          api.get('/formations/featured'),
          api.get('/prestations/featured'),
          api.get('/articles/latest'),
          api.get('/events/upcoming'),
          api.get('/settings/partners'),
          api.get('/annonceurs/featured'),
          api.get('/settings/testimonials'),
          api.get('/settings'),
        ]);

        const [
          coursesRes,
          servicesRes,
          articlesRes,
          eventsRes,
          partnersRes,
          annonceursRes,
          testimonialsRes,
          settingsRes,
        ] = results;

        if (coursesRes.status === 'fulfilled' && coursesRes.value.data?.success) {
          setFeaturedCourses(coursesRes.value.data.data);
        }
        if (servicesRes.status === 'fulfilled' && servicesRes.value.data?.success) {
          setFeaturedServices(servicesRes.value.data.data);
        }
        if (articlesRes.status === 'fulfilled' && articlesRes.value.data?.success) {
          setLatestArticles(articlesRes.value.data.data);
        }
        if (eventsRes.status === 'fulfilled' && eventsRes.value.data?.success) {
          setUpcomingEvents(eventsRes.value.data.data);
        }
        if (partnersRes.status === 'fulfilled' && partnersRes.value.data?.success) {
          setPartners(partnersRes.value.data.data);
        }
        if (annonceursRes.status === 'fulfilled' && annonceursRes.value.data?.success) {
          setAnnonceurs(annonceursRes.value.data.data);
        }
        if (testimonialsRes.status === 'fulfilled' && testimonialsRes.value.data?.success) {
          setTestimonials(testimonialsRes.value.data.data);
        }
        if (settingsRes.status === 'fulfilled' && settingsRes.value.data?.success) {
          setSettings(settingsRes.value.data.data);
        }
      } catch (err) {
        console.error('Erreur de chargement des données accueil :', err);
      }
    };

    fetchHomeData();
  }, []);

  const handleOpenInscription = (formation) => {
    setSelectedFormation(formation);
    setIsPreInscriptionOpen(true);
  };

  return (
    <div>
      <SEOHelmet
        title="Accueil"
        description="Centre B.C.A. à Tiaret : formations professionnelles certifiantes, agence de communication globale, actualités locales et support publicitaire."
      />

      {/* 1. Grand Slider Principal */}
      <HeroSlider
        onOpenPreInscription={() => setIsPreInscriptionOpen(true)}
        onOpenQuote={() => setIsQuoteOpen(true)}
        homePhotos={settings?.homePhotos}
      />

      {/* 2. Bandeau Chiffres Clés & Avantages */}
      <section className="bg-brand-950 text-white py-10 border-b border-brand-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-accent-400 block font-sans">
                +500
              </span>
              <span className="text-xs sm:text-sm text-slate-300 font-medium">
                {t('home.stat_students')}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-accent-400 block font-sans">
                25+
              </span>
              <span className="text-xs sm:text-sm text-slate-300 font-medium">
                {t('home.stat_courses')}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-accent-400 block font-sans">
                98%
              </span>
              <span className="text-xs sm:text-sm text-slate-300 font-medium">
                {t('home.stat_satisfaction')}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-accent-400 block font-sans">
                40+
              </span>
              <span className="text-xs sm:text-sm text-slate-300 font-medium">
                {t('home.stat_partners')}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Prochaines Formations en Vedette */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block mb-2">
                {t('home.pole_formation', 'Pôle Formation B.C.A.')}
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {t('home.upcoming_courses')}
              </h2>
              <p className="mt-2 text-sm text-slate-500 max-w-xl">
                {t('home.upcoming_courses_sub')}
              </p>
            </div>
            <Button
              to="/formations"
              variant="outline"
              size="md"
              rightIcon={<ArrowRight className="w-4 h-4 rtl:rotate-180" />}
            >
              {t('actions.view_all')}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.map((course) => (
              <div
                key={course._id}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-card transition-all duration-300 flex flex-col"
              >
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={getImageUrl(course.image)}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 start-3">
                    <Badge variant="brand">{course.category?.name}</Badge>
                  </div>
                  {course.priceDisplay && (
                    <div className="absolute bottom-3 end-3 bg-brand-950/90 backdrop-blur-sm text-accent-400 px-3 py-1 rounded-lg text-xs font-bold shadow-md">
                      {course.priceDisplay}
                    </div>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition leading-snug">
                      <Link to={`/formations/${course.slug}`}>{course.title}</Link>
                    </h3>
                    <p className="mt-2 text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {course.summary}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-brand-600" />
                      <span>{course.duration || (course.durationHours ? `${course.durationHours}h` : '')}</span>
                    </div>
                    {course.durationWeeks ? (
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-brand-600" />
                        <span>{course.durationWeeks} {t('courses.weeks', 'semaines')}</span>
                      </div>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button
                      to={`/formations/${course.slug}`}
                      variant="ghost"
                      size="sm"
                      className="w-full"
                    >
                      {t('actions.more_info')}
                    </Button>
                    <Button
                      onClick={() => handleOpenInscription(course)}
                      variant="primary"
                      size="sm"
                      className="w-full"
                    >
                      {t('actions.register')}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Première Bannière Publicitaire */}
      <AdBanner slotKey="home_banner_top" />

      {/* 5. Prestations d'Agence (Services aux Entreprises) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-accent-600 block mb-2">
                {t('home.agency_tag', 'Agence de Communication & Médias')}
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {t('home.agency_title', 'Solutions & Prestations sur Mesure')}
              </h2>
              <p className="mt-2 text-sm text-slate-500 max-w-xl">
                {t('home.agency_subtitle', 'Accompagnement complet des entreprises, commerçants et associations de Tiaret dans leur stratégie visuelle et digitale.')}
              </p>
            </div>
            <Button
              onClick={() => setIsQuoteOpen(true)}
              variant="accent"
              size="md"
              leftIcon={<Briefcase className="w-4 h-4" />}
            >
              {t('actions.request_quote')}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredServices.map((service) => (
              <div
                key={service._id}
                className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 shadow-soft hover:border-brand-300 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition mb-2">
                    <Link to={`/prestations/${service.slug}`}>{service.title}</Link>
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">
                    {service.summary}
                  </p>

                  {service.benefits && service.benefits.length > 0 && (
                    <ul className="space-y-2 mb-6">
                      {service.benefits.slice(0, 3).map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-700">{service.priceDisplay}</span>
                  <Link
                    to={`/prestations/${service.slug}`}
                    className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1"
                  >
                    {t('actions.more_info')} <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Section Mixte : Actualités & Agenda Événements */}
      <section className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Colonne Gauche : Dernières Actualités */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block">
                    {t('home.regional_portal', 'Portail Régional')}
                  </span>
                  <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                    {t('home.latest_news')}
                  </h2>
                </div>
                <Link
                  to="/actualites"
                  className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
                >
                  {t('actions.view_all')} <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </Link>
              </div>

              <div className="space-y-5">
                {latestArticles.slice(0, 3).map((article) => (
                  <article
                    key={article._id}
                    className="group bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition flex gap-4 items-center"
                  >
                    <img
                      src={getImageUrl(article.coverImage)}
                      alt={article.title}
                      className="w-24 h-24 rounded-lg object-cover shrink-0 group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider block mb-1">
                        {article.category?.name}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition truncate leading-snug">
                        <Link to={`/actualites/${article.slug}`}>{article.title}</Link>
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {article.summary}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-2 block">
                        {new Date(article.publishedAt || article.createdAt).toLocaleDateString(t('common.locale', 'fr-FR'))}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Colonne Droite : Événements à Venir */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-accent-600 block">
                    {t('home.agenda_tag', 'Agenda Tiaret')}
                  </span>
                  <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                    {t('home.upcoming_events')}
                  </h2>
                </div>
                <Link
                  to="/evenements"
                  className="text-xs font-bold text-accent-600 hover:underline flex items-center gap-1"
                >
                  {t('actions.view_all')} <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </Link>
              </div>

              <div className="space-y-4">
                {upcomingEvents.slice(0, 3).map((event) => (
                  <div
                    key={event._id}
                    className="group bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition flex items-start gap-4"
                  >
                    {/* Badge Date Calendrier */}
                    <div className="w-14 h-16 rounded-xl bg-brand-50 border border-brand-200 flex flex-col items-center justify-center shrink-0 text-brand-900">
                      <span className="text-xs font-bold uppercase">
                        {new Date(event.startDate).toLocaleDateString(t('common.locale', 'fr-FR'), { month: 'short' })}
                      </span>
                      <span className="text-xl font-extrabold text-brand-700">
                        {new Date(event.startDate).getDate()}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-accent-600 uppercase tracking-wider block">
                        {event.category?.name}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition truncate">
                        <Link to={`/evenements/${event.slug}`}>{event.title}</Link>
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {event.location?.venue || 'Tiaret'}, {event.location?.commune || 'Tiaret'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {event.startTime || '09h00'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Deuxième Bannière Publicitaire */}
      <AdBanner slotKey="home_banner_middle" />

      {/* 8. Témoignages Stagiaires & Clients */}
      {testimonials.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block mb-2">
                {t('home.testimonials_tag', "Retours d'Expérience")}
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {t('home.testimonials_title', 'Ils Ont Choisi le Centre B.C.A.')}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {t('home.testimonials_subtitle', 'Découvrez les témoignages de nos apprenants et des entreprises locales accompagnées.')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.slice(0, 3).map((item) => (
                <div
                  key={item._id}
                  className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 shadow-soft flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1 text-amber-400 mb-4">
                      {[...Array(item.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <Quote className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-xs text-slate-700 leading-relaxed italic">
                      "{item.content}"
                    </p>
                  </div>

                  <div className="pt-4 mt-6 border-t border-slate-200 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-200 text-brand-800 flex items-center justify-center font-bold text-sm">
                      {(item.authorName || item.name || 'A').charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{item.authorName || item.name}</h4>
                      <span className="text-[11px] text-slate-500 block">
                        {item.roleOrCompany || item.role}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 9. Logos des Partenaires & Annonceurs */}
      <PartnersTicker partners={partners} annonceurs={annonceurs} />

      {/* 10. Grand Appel à l'Action Final */}
      <section className="relative overflow-hidden bg-brand-950 text-white py-20">
        {settings?.homePhotos?.ctaBanner && (
          <div
            className="absolute inset-0 bg-cover bg-center transform scale-105 opacity-20 pointer-events-none"
            style={{ backgroundImage: `url(${getImageUrl(settings.homePhotos.ctaBanner)})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-950/95 via-brand-950/85 to-brand-900/90 pointer-events-none" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center space-y-6">
          <span className="inline-block px-3 py-1 rounded-full bg-accent-500/20 text-accent-400 border border-accent-400/30 text-xs font-bold uppercase tracking-wider">
            {t('home.cta_tag', 'Rejoignez B.C.A.')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {t('home.cta_title', 'Prêt à Développer Vos Compétences ou Accélérer Votre Entreprise ?')}
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t('home.cta_desc', 'Inscrivez-vous dès aujourd’hui à nos prochaines sessions de formation ou contactez notre équipe pour concevoir votre stratégie de communication sur-mesure.')}
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Button
              to="/formations"
              variant="accent"
              size="lg"
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              {t('home.cta_btn1', 'Consulter nos formations')}
            </Button>
            <Button
              to="/contact"
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/10"
            >
              {t('home.cta_btn2', 'Contacter un conseiller')}
            </Button>
          </div>
        </div>
      </section>

      {/* Modale de Préinscription dynamique */}
      <PreInscriptionModal
        isOpen={isPreInscriptionOpen}
        onClose={() => {
          setIsPreInscriptionOpen(false);
          setSelectedFormation(null);
        }}
        formation={selectedFormation || featuredCourses[0]}
        sessions={selectedFormation?.sessions || []}
      />

      {/* Modale de Demande de Devis */}
      <QuoteModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        initialType="prestation"
      />
    </div>
  );
};

export default Home;
