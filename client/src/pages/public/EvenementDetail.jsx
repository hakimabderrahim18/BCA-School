import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Globe,
  Share2,
  ArrowLeft,
  CalendarCheck,
  AlertCircle,
} from 'lucide-react';
import api from '../../services/api';
import { SEOHelmet } from '../../components/common/SEOHelmet';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ShareButtons } from '../../components/common/ShareButtons';
import { getImageUrl } from '../../utils/imageUrl';

export const EvenementDetail = () => {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isArabic = (i18n.language || 'fr').toLowerCase().startsWith('ar');
  const dateLocale = isArabic ? 'ar-DZ' : 'fr-FR';

  useEffect(() => {
    const fetchEvent = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/events/${slug}`);
        if (res.data.success) {
          setEvent(res.data.data);
        }
      } catch (err) {
        console.error('Erreur chargement événement :', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="py-24 text-center text-slate-500 text-sm">
        {t('common.loading', 'Chargement de la fiche événement...')}
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl shadow-card text-center border border-slate-200">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900">
          {t('events.event_not_found', 'Événement introuvable')}
        </h2>
        <Button to="/evenements" variant="primary" size="md" className="mt-4">
          {t('events.back_to_agenda', "Retour à l'agenda")}
        </Button>
      </div>
    );
  }

  // Données structurées Schema.org Event
  const eventSchema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    startDate: event.startDate,
    endDate: event.endDate || event.startDate,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: event.location?.venue,
      address: {
        '@type': 'PostalAddress',
        addressLocality: event.location?.commune,
        addressRegion: 'Tiaret',
        addressCountry: 'DZ',
      },
    },
    image: [event.coverImage],
    description: event.description,
    organizer: {
      '@type': 'Organization',
      name: event.organizer?.name,
    },
  };

  return (
    <article className="bg-slate-50 min-h-screen pb-20">
      <SEOHelmet
        title={event.title}
        description={event.description}
        image={event.coverImage}
        url={`/evenements/${event.slug}`}
        type="event"
        schemaJson={eventSchema}
      />

      <header className="bg-brand-950 text-white py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex items-center gap-2">
            <Link to="/evenements" className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1">
              <ArrowLeft className="w-3 h-3 rtl:rotate-180" /> {t('nav.events', 'Agenda')}
            </Link>
            <span className="text-slate-600">/</span>
            <Badge variant="brand">{event.category?.name || (typeof event.category === 'string' ? event.category : 'Événement')}</Badge>
            {event.isFree && (
              <Badge variant="success">{t('events.free_entry_badge', 'Entrée Gratuite')}</Badge>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-snug">
            {event.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300 pt-2 border-t border-brand-900">
            <span className="flex items-center gap-1.5 font-semibold text-accent-400">
              <Calendar className="w-4 h-4" />
              {new Date(event.startDate).toLocaleDateString(dateLocale, {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-1.5" dir="ltr">
              <Clock className="w-4 h-4 text-accent-400" />
              <bdi>{event.startTime || '09:00'} {event.endTime ? `- ${event.endTime}` : ''}</bdi>
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-accent-400" />
              {typeof event.location === 'object' ? `${event.location?.venue || 'Tiaret'}, ${event.location?.commune || 'Tiaret'}` : (event.location || 'Tiaret')}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-2xl shadow-card border border-slate-200/80 overflow-hidden p-6 sm:p-10 space-y-8">
          {/* Affiche de l'événement */}
          {event.coverImage && (
            <div className="rounded-xl overflow-hidden shadow-sm bg-slate-900 max-h-[500px]">
              <img
                src={getImageUrl(event.coverImage)}
                alt={event.title}
                className="w-full h-full object-contain mx-auto"
              />
            </div>
          )}

          {/* Description */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              {t('events.about_title', "À Propos de l'Événement")}
            </h2>
            {event.description?.includes('<') ? (
              <div
                className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed"
                dangerouslySetInnerHTML={{ __html: event.description }}
              />
            ) : (
              <div className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
                {event.description}
              </div>
            )}
          </div>

          {/* Coordonnées de l'organisateur */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('events.organizer_contact', 'Organisateur & Contact')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-brand-600" />
                <span className="font-semibold">{event.organizer?.name}</span>
              </div>
              {event.organizer?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-brand-600" />
                  <a href={`tel:${event.organizer.phone}`} className="hover:underline" dir="ltr">
                    {event.organizer.phone}
                  </a>
                </div>
              )}
              {event.organizer?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-brand-600" />
                  <a href={`mailto:${event.organizer.email}`} className="hover:underline">
                    {event.organizer.email}
                  </a>
                </div>
              )}
              {event.organizer?.website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-brand-600" />
                  <a href={event.organizer.website} target="_blank" rel="noreferrer" className="hover:underline">
                    {t('events.official_website', 'Site web officiel')}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Partage Social */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4">
            <ShareButtons url={`/evenements/${event.slug}`} title={event.title} />
          </div>
        </div>
      </main>
    </article>
  );
};

export default EvenementDetail;