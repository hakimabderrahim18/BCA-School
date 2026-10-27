import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  Target,
  Sparkles,
  Users,
  Award,
  Building,
  CheckCircle,
  Quote,
} from 'lucide-react';
import api from '../../services/api';
import { SEOHelmet } from '../../components/common/SEOHelmet';
import { Button } from '../../components/common/Button';
import { getImageUrl } from '../../utils/imageUrl';

export const About = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState(null);
  const [partners, setPartners] = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const [settingsRes, partnersRes, testimonialsRes] = await Promise.all([
          api.get('/settings'),
          api.get('/settings/partners'),
          api.get('/settings/testimonials'),
        ]);

        if (settingsRes.data.success) setSettings(settingsRes.data.data);
        if (partnersRes.data.success) setPartners(partnersRes.data.data);
        if (testimonialsRes.data.success) setTestimonials(testimonialsRes.data.data);
      } catch (err) {
        console.error('Erreur chargement page À propos :', err);
      }
    };

    fetchAboutData();
  }, []);

  const about = settings?.about || {};

  return (
    <div className="bg-slate-50 min-h-screen">
      <SEOHelmet
        title="À Propos de B.C.A."
        description="Présentation, mission, équipe pédagogique, locaux et valeurs du centre B.C.A. à Tiaret."
      />

      {/* En-tête de page */}
      <section className="bg-brand-950 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="inline-block px-3 py-1 rounded-full bg-accent-500/20 text-accent-400 border border-accent-400/30 text-xs font-bold uppercase tracking-wider">
            Notre Histoire & Notre Vocation
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Le Centre B.C.A. à Tiaret
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Pôle d'excellence en formation professionnelle continue et solutions globales de communication pour particuliers, entreprises et institutions de la région.
          </p>
        </div>
      </section>

      {/* 1. Présentation & Mission */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block">
                Qui Sommes-Nous ?
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                Un Centre Moderne Ancré au Cœur de la Dynamique de Tiaret
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {about.presentation ||
                  'B.C.A. est né de la volonté de doter la wilaya de Tiaret d’une structure pédagogique et d’une agence de communication de standard professionnel élevé. Nous formons des profils directement opérationnels et accompagnons les entreprises dans leur croissance.'}
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                {about.history ||
                  'Fondé pour répondre aux nouveaux enjeux de la digitalisation, de la gestion d’entreprise et de la communication de marque, B.C.A. combine l’exigence académique et l’esprit pratique du terrain.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm mb-1">
                    <Target className="w-4 h-4 text-brand-600" />
                    <span>Notre Mission</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {about.mission || 'Transmettre des compétences concrètes et certifiées facilitant l’insertion professionnelle et la performance économique.'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm mb-1">
                    <Award className="w-4 h-4 text-accent-500" />
                    <span>Agrément & Qualité</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Formations certifiantes reconnues avec délivrance d’attestations de réussite et suivi post-formation.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-card border border-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80"
                  alt="Équipe B.C.A. Tiaret"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -start-6 bg-brand-950 text-white p-6 rounded-2xl shadow-xl hidden sm:block max-w-xs border border-brand-800">
                <span className="text-2xl font-extrabold text-accent-400 block font-sans">+500</span>
                <span className="text-xs text-slate-300 font-medium leading-snug">
                  Stagiaires diplômés et formés avec succès au centre B.C.A.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Nos Valeurs Fondamentales */}
      <section className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block mb-2">
              Principes d'Action
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Nos Valeurs d'Engagement
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(about.values || [
              'Excellence pédagogique',
              'Pratique orientée marché',
              'Écoute & Proximité',
              'Innovation continue',
            ]).map((value, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft text-center space-y-3"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">{value}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Chaque cours et chaque prestation sont conçus avec rigueur pour garantir des résultats mesurables.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Équipe Pédagogique et Direction */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block mb-2">
              Encadrement
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Direction & Équipe Pédagogique
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Des formateurs experts chevronnés combinant savoir académique et expérience du monde de l'entreprise.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {(about.team?.length > 0
              ? about.team
              : [
                  {
                    name: 'Direction Générale B.C.A.',
                    role: 'Directeur du Centre',
                    bio: 'Spécialiste en management de formation professionnelle et stratégies de communication.',
                    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
                  },
                  {
                    name: 'M. Sofiane Cherif',
                    role: 'Directeur Artistique & Formateur Infographie',
                    bio: 'Diplômé en Beaux-Arts et PAO, plus de 12 ans d’expérience sur les logiciels de création.',
                    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
                  },
                  {
                    name: 'Ing. Walid Benali',
                    role: 'Formateur Développement Web & Systèmes',
                    bio: 'Ingénieur Full Stack, consultant en digitalisation et architecture logicielle MERN.',
                    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
                  },
                ]
            ).map((member, i) => (
              <div
                key={i}
                className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200/80 shadow-soft text-center p-6 space-y-4"
              >
                <img
                  src={getImageUrl(member.photo, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80')}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-brand-500 shadow-md"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900">{member.name}</h3>
                  <span className="text-xs text-brand-600 font-semibold block mt-0.5">
                    {member.role}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Locaux & Équipements */}
      <section className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block mb-2">
              Infrastructures
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Nos Locaux & Équipements à Tiaret
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Des espaces modernes climatisés avec postes de travail individuels et fibre optique haut débit.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80"
                alt="Laboratoire informatique"
                className="w-full h-48 object-cover"
              />
              <div className="p-5">
                <h3 className="font-bold text-sm text-slate-900">Laboratoire Informatique & Web</h3>
                <p className="text-xs text-slate-500 mt-1">Postes équipés d'écrans HD, suites logicielles complètes et connexion très haut débit.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80"
                alt="Salle de conférence"
                className="w-full h-48 object-cover"
              />
              <div className="p-5">
                <h3 className="font-bold text-sm text-slate-900">Salle de Séminaires & Langues</h3>
                <p className="text-xs text-slate-500 mt-1">Équipée d'un système de projection multimédia interactif et sonorisation professionnelle.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"
                alt="Espace d'accueil et coworking"
                className="w-full h-48 object-cover"
              />
              <div className="p-5">
                <h3 className="font-bold text-sm text-slate-900">Espace Accueil & Échanges</h3>
                <p className="text-xs text-slate-500 mt-1">Un cadre agréable et convivial pour les temps de pause, le réseautage et l'orientation.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Agréments & Partenaires */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block mb-2">
            Réseau & Agrément
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
            Agréments et Partenariats
          </h2>
          <p className="max-w-2xl mx-auto text-sm text-slate-500 mb-12">
            Le centre B.C.A. collabore étroitement avec les institutions et entreprises de la wilaya de Tiaret.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            {partners.map((partner) => (
              <div key={partner._id} className="flex flex-col items-center">
                <img
                  src={getImageUrl(partner.logo)}
                  alt={partner.name}
                  className="h-14 w-auto max-w-[160px] object-contain opacity-80 hover:opacity-100 transition"
                />
                <span className="text-xs font-semibold text-slate-600 mt-2">{partner.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CTA vers Formations & Contact */}
      <section className="bg-brand-950 text-white py-14 text-center">
        <div className="max-w-3xl mx-auto px-4 space-y-5">
          <h2 className="text-2xl sm:text-3xl font-extrabold">Venez Nous Rencontrer à Tiaret</h2>
          <p className="text-sm text-slate-300">
            Nos portes sont ouvertes du Samedi au Jeudi pour visiter nos salles et échanger avec nos conseillers.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Button to="/contact" variant="accent" size="lg">
              Nous Contacter
            </Button>
            <Button to="/formations" variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              Voir les Formations
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
