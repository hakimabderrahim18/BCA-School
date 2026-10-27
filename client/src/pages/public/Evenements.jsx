import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Calendar as CalendarIcon,
  List,
  MapPin,
  Clock,
  PlusCircle,
  Filter,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';
import { SEOHelmet } from '../../components/common/SEOHelmet';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { EventProposalModal } from '../../components/forms/EventProposalModal';
import { getImageUrl } from '../../utils/imageUrl';

export const Evenements = () => {
  const { t, i18n } = useTranslation();
  const isArabic = (i18n?.language || 'fr').toLowerCase().startsWith('ar');
  const dateLocale = isArabic ? 'ar-DZ' : 'fr-FR';

  const [viewMode, setViewMode] = useState('list'); // 'list' ou 'calendar'
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCommune, setSelectedCommune] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const formatEventDate = (dateVal, options) => {
    if (!dateVal) return '';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    try {
      return d.toLocaleDateString(dateLocale, options);
    } catch {
      return String(dateVal);
    }
  };

  // Communes courantes de la Wilaya de Tiaret (14)
  const communes = ['Tiaret', 'Sougueur', 'Frenda', 'Rahouia', 'Mechraa Sfa', 'Ksar Chellala', 'Mahdia'];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories?type=event');
        if (res.data.success) setCategories(res.data.data);
      } catch (err) {
        console.error('Erreur chargement catégories événements :', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory) params.append('category', selectedCategory);
        if (selectedCommune) params.append('commune', selectedCommune);

        if (viewMode === 'calendar') {
          params.append('year', currentDate.getFullYear());
          params.append('month', currentDate.getMonth() + 1);
        }

        const res = await api.get(`/events?${params.toString()}`);
        if (res.data.success) setEvents(res.data.data);
      } catch (err) {
        console.error('Erreur chargement événements :', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [viewMode, selectedCategory, selectedCommune, currentDate]);

  // Logique du Calendrier Mensuel
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayIndex = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  // Ajustement pour commencer le Samedi (culture algérienne) ou Lundi
  const startingDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getEventsForDay = (day) => {
    return events.filter((e) => {
      const d = new Date(e.startDate);
      return (
        d.getDate() === day &&
        d.getMonth() === currentDate.getMonth() &&
        d.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <SEOHelmet
        title="Agenda & Événements à Tiaret"
        description="Consultez les salons, conférences, journées portes ouvertes et événements culturels à Tiaret."
      />

      {/* En-tête de section */}
      <section className="bg-brand-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="inline-block px-3 py-1 rounded-full bg-accent-500/20 text-accent-400 border border-accent-400/30 text-xs font-bold uppercase tracking-wider">
            Agenda Local & Rencontres
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            {t('events.title')}
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300">
            {t('events.subtitle')}
          </p>
          <div className="pt-2">
            <Button
              onClick={() => setIsProposalModalOpen(true)}
              variant="accent"
              size="lg"
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              {t('actions.propose_event')}
            </Button>
          </div>
        </div>
      </section>

      {/* Barre d'outils : bascule Liste/Calendrier & Filtres */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-7">
        <div className="bg-white rounded-2xl shadow-card border border-slate-200/80 p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Bascule Mode d'affichage */}
          <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                viewMode === 'list' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4" />
              <span>{t('events.view_list')}</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                viewMode === 'calendar' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>{t('events.view_calendar')}</span>
            </button>
          </div>

          {/* Filtres par Catégorie et Commune */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 sm:flex-initial text-xs border border-slate-300 rounded-xl px-3 py-2.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">{t('actions.all_categories')}</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={selectedCommune}
              onChange={(e) => setSelectedCommune(e.target.value)}
              className="flex-1 sm:flex-initial text-xs border border-slate-300 rounded-xl px-3 py-2.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">{t('actions.all_communes')}</option>
              {communes.map((com) => (
                <option key={com} value={com}>
                  {com}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Contenu : VUE LISTE ou VUE CALENDRIER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {viewMode === 'list' ? (
          /* ================= VUE LISTE ================= */
          isLoading ? (
            <div className="py-20 text-center text-slate-500 text-sm">
              {t('common.loading', 'Chargement des événements...')}
            </div>
          ) : events.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-lg mx-auto shadow-soft">
              <CalendarIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900">
                {t('events.no_events_found', 'Aucun événement à cette période')}
              </h3>
              <p className="text-xs text-slate-500 mt-1 mb-6">
                {t('events.no_events_sub', 'Aucune manifestation ne correspond aux critères sélectionnés.')}
              </p>
              <Button onClick={() => setIsProposalModalOpen(true)} variant="accent" size="sm">
                {t('actions.propose_event', 'Proposer un événement')}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((ev) => (
                <div
                  key={ev._id}
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-card transition flex flex-col justify-between"
                >
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img
                      src={getImageUrl(ev.coverImage, 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80')}
                      alt={ev.title || 'Événement'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-3 start-3">
                      <Badge variant="brand">{ev.category?.name || (typeof ev.category === 'string' ? ev.category : 'Événement')}</Badge>
                    </div>
                    {ev.isFree && (
                      <div className="absolute bottom-3 end-3 bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-md">
                        {t('events.free_entry', 'Entrée Libre')}
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-brand-600">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        <span>
                          {formatEventDate(ev.startDate, {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      <h2 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition leading-snug line-clamp-2">
                        <Link to={`/evenements/${ev.slug}`}>{ev.title}</Link>
                      </h2>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {ev.summary || (typeof ev.description === 'string' ? ev.description.replace(/<[^>]+>/g, '') : '')}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{typeof ev.location === 'object' ? `${ev.location?.venue || 'Tiaret'}, ${ev.location?.commune || 'Tiaret'}` : (ev.location || 'Tiaret')}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{ev.startTime || '09:00'} {ev.endTime ? `- ${ev.endTime}` : ''}</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        to={`/evenements/${ev.slug}`}
                        variant="primary"
                        size="sm"
                        className="w-full"
                      >
                        {t('events.view_details', 'Consulter la fiche')}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* ================= VUE CALENDRIER ================= */
          <div className="bg-white rounded-2xl shadow-card border border-slate-200/80 p-6 sm:p-8">
            {/* Navigation Mois */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 capitalize">
                {formatEventDate(currentDate, { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={prevMonth}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
                >
                  <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
                >
                  <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </div>
            </div>

            {/* En-tête des jours */}
            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
              {isArabic ? (
                <>
                  <span>إثنين</span>
                  <span>ثلاثاء</span>
                  <span>أربعاء</span>
                  <span>خميس</span>
                  <span>جمعة</span>
                  <span>سبت</span>
                  <span>أحد</span>
                </>
              ) : (
                <>
                  <span>Lun</span>
                  <span>Mar</span>
                  <span>Mer</span>
                  <span>Jeu</span>
                  <span>Ven</span>
                  <span>Sam</span>
                  <span>Dim</span>
                </>
              )}
            </div>

            {/* Grille des Jours du Mois */}
            <div className="grid grid-cols-7 gap-2">
              {[...Array(startingDay)].map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[90px] p-2 bg-slate-50/50 rounded-xl" />
              ))}

              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1;
                const dayEvents = getEventsForDay(day);
                const hasEvents = dayEvents.length > 0;

                return (
                  <div
                    key={day}
                    className={`min-h-[90px] p-2 rounded-xl border transition flex flex-col justify-between ${
                      hasEvents
                        ? 'border-brand-300 bg-brand-50/40'
                        : 'border-slate-100 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`text-xs font-bold self-start w-6 h-6 flex items-center justify-center rounded-full ${
                        hasEvents ? 'bg-brand-600 text-white' : 'text-slate-700'
                      }`}
                    >
                      {day}
                    </span>

                    {hasEvents && (
                      <div className="mt-1 space-y-1">
                        {dayEvents.map((ev) => (
                          <Link
                            key={ev._id}
                            to={`/evenements/${ev.slug}`}
                            className="block text-[10px] font-semibold text-brand-900 bg-white/90 border border-brand-200 rounded px-1.5 py-0.5 truncate hover:bg-brand-600 hover:text-white transition"
                            title={ev.title}
                          >
                            {ev.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Modale "Proposer un événement" */}
      <EventProposalModal
        isOpen={isProposalModalOpen}
        onClose={() => setIsProposalModalOpen(false)}
        categories={categories}
      />
    </div>
  );
};

export default Evenements;
