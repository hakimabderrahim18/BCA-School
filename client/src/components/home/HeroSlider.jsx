import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '../common/Button';
import { getImageUrl } from '../../utils/imageUrl';

export const HeroSlider = ({ onOpenPreInscription, onOpenQuote, homePhotos }) => {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      tag: t('slider.slide1_tag', 'Centre de Formation Agréé B.C.A.'),
      title: t('slider.slide1_title', 'Formez-vous aux Métiers d’Avenir à Tiaret'),
      subtitle: t('slider.slide1_desc', 'Infographie, Développement Web, Langues & Comptabilité. Des cursus 100% pratiques animés par des professionnels reconnus.'),
      image: getImageUrl(
        homePhotos?.heroSlide1,
        'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1920&q=80'
      ),
      primaryBtn: { text: t('slider.slide1_btn1', "S'inscrire à une formation"), to: '/formations' },
      secondaryBtn: { text: t('slider.slide1_btn2', 'Nous contacter'), to: '/contact' },
    },
    {
      id: 2,
      tag: t('slider.slide2_tag', 'Agence de Communication & Médias'),
      title: t('slider.slide2_title', 'Propulsez l’Image et la Visibilité de Votre Entreprise'),
      subtitle: t('slider.slide2_desc', 'Création d’identités visuelles percutantes, spots publicitaires vidéo 4K et gestion professionnelle de vos réseaux sociaux.'),
      image: getImageUrl(
        homePhotos?.heroSlide2,
        'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1920&q=80'
      ),
      primaryBtn: { text: t('slider.slide2_btn1', 'Découvrir nos prestations'), to: '/prestations' },
      secondaryBtn: { text: t('slider.slide2_btn2', 'Demander un devis gratuit'), to: '/contact' },
    },
    {
      id: 3,
      tag: t('slider.slide3_tag', 'Portail d’Information & Annuaire Local'),
      title: t('slider.slide3_title', 'Toute l’Actualité et les Événements de la Wilaya de Tiaret'),
      subtitle: t('slider.slide3_desc', 'Agenda culturel et professionnel, petites annonces vérifiées et vitrine publicitaire pour les commerçants et acteurs régionaux.'),
      image: getImageUrl(
        homePhotos?.heroSlide3,
        'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1920&q=80'
      ),
      primaryBtn: { text: t('slider.slide3_btn1', 'Consulter l’agenda'), to: '/evenements' },
      secondaryBtn: { text: t('slider.slide3_btn2', 'Espace Annonceurs'), to: '/annonces-publicite' },
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="relative w-full h-[540px] sm:h-[620px] lg:h-[680px] overflow-hidden bg-slate-950">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          {/* Image de fond avec filtre d'obscurcissement dégradé pour la lisibilité */}
          <div
            className="absolute inset-0 bg-cover bg-center transform scale-105 transition-transform duration-10000"
            style={{ backgroundImage: `url(${slide.image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-950/95 via-brand-950/80 to-slate-950/40" />

          {/* Contenu textuel */}
          <div className="relative z-20 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
            <div className="max-w-2xl text-white space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/20 text-accent-400 border border-accent-400/30 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5" />
                {slide.tag}
              </span>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white drop-shadow-md">
                {slide.title}
              </h1>

              <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-normal">
                {slide.subtitle}
              </p>

              <div className="pt-3 flex flex-wrap items-center gap-3.5">
                <Button to={slide.primaryBtn.to} variant="accent" size="lg" rightIcon={<ArrowRight className="w-4 h-4 rtl:rotate-180" />}>
                  {slide.primaryBtn.text}
                </Button>
                <Button to={slide.secondaryBtn.to} variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  {slide.secondaryBtn.text}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Flèches de navigation */}
      <button
        onClick={prevSlide}
        className="absolute start-4 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition focus:outline-none"
        aria-label="Diapositive précédente"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 rtl:rotate-180" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute end-4 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition focus:outline-none"
        aria-label="Diapositive suivante"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 rtl:rotate-180" />
      </button>

      {/* Indicateurs (Dots) */}
      <div className="absolute bottom-6 inset-x-0 z-30 flex justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              i === currentSlide ? 'w-8 bg-accent-400' : 'w-2.5 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Aller au slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
