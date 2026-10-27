import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Clock, BookOpen, Sparkles, Filter, CheckCircle2, Award } from 'lucide-react';
import api from '../../services/api';
import { SEOHelmet } from '../../components/common/SEOHelmet';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { PreInscriptionModal } from '../../components/forms/PreInscriptionModal';
import { getImageUrl } from '../../utils/imageUrl';

export const Formations = () => {
  const { t } = useTranslation();

  const [formations, setFormations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Modale de préinscription
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Chargement des catégories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories?type=formation');
        if (res.data.success) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.error('Erreur chargement catégories :', err);
      }
    };
    fetchCategories();
  }, []);

  // Chargement des formations filtrées
  useEffect(() => {
    const fetchFormations = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page,
          limit: 9,
        });
        if (selectedCategory) params.append('category', selectedCategory);
        if (search) params.append('search', search);

        const res = await api.get(`/formations?${params.toString()}`);
        if (res.data.success) {
          setFormations(res.data.data);
          setTotalPages(res.data.meta?.totalPages || 1);
        }
      } catch (err) {
        console.error('Erreur chargement formations :', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormations();
  }, [selectedCategory, search, page]);

  const handleOpenInscription = (course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <SEOHelmet
        title="Catalogue des Formations Professionnelles"
        description="Découvrez l'ensemble de nos formations certifiantes à Tiaret : Infographie, Web, Langues, Comptabilité et Bureautique."
      />

      {/* En-tête de section */}
      <section className="bg-brand-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="inline-block px-3 py-1 rounded-full bg-accent-500/20 text-accent-400 border border-accent-400/30 text-xs font-bold uppercase tracking-wider">
            {t('courses.certified_badge', 'Compétences Pratiques Certifiées')}
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            {t('courses.title')}
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300">
            {t('courses.subtitle')}
          </p>
        </div>
      </section>

      {/* Barre d'outils : Recherche et Filtres par Catégorie */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-7">
        <div className="bg-white rounded-2xl shadow-card border border-slate-200/80 p-4 sm:p-6 space-y-4">
          {/* Recherche textuelle */}
          <div className="relative">
            <Search className="w-5 h-5 absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={t('courses.search_placeholder', 'Rechercher une formation (ex: Photoshop, Web, Anglais, Comptabilité)...')}
              className="w-full ps-12 pe-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
            />
          </div>

          {/* Filtres par Catégorie (Pills) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
            <button
              onClick={() => {
                setSelectedCategory('');
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === ''
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t('actions.all_categories', 'Toutes les catégories')}
            </button>

            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => {
                  setSelectedCategory(cat._id);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedCategory === cat._id
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grille des Formations */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {isLoading ? (
          <div className="py-20 text-center text-slate-500 text-sm">
            {t('common.loading', 'Chargement du catalogue des formations...')}
          </div>
        ) : formations.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-lg mx-auto my-12 shadow-soft">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900">
              {t('courses.course_not_found', 'Aucune formation trouvée')}
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              {t('courses.course_not_found_desc', 'Aucun résultat ne correspond à votre filtre de recherche actuel.')}
            </p>
            <Button
              onClick={() => {
                setSelectedCategory('');
                setSearch('');
              }}
              variant="outline"
              size="sm"
            >
              {t('actions.reset_filters', 'Réinitialiser les filtres')}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {formations.map((course) => (
              <div
                key={course._id}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-card transition-all duration-300 flex flex-col justify-between"
              >
                <div className="relative h-52 overflow-hidden bg-slate-100">
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
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition leading-snug line-clamp-2">
                      <Link to={`/formations/${course.slug}`}>{course.title}</Link>
                    </h3>
                    <p className="mt-2 text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {course.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5 font-medium text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      <span>{course.duration || (course.durationHours ? `${course.durationHours} ${t('courses.hours', 'heures')}` : 'Durée flexible')}</span>
                    </div>
                    {course.durationWeeks ? (
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <BookOpen className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                        <span>{course.durationWeeks} {t('courses.weeks', 'semaines')}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Award className="w-3.5 h-3.5 text-accent-500 shrink-0" />
                        <span>{course.isCertified ? 'Certifiante' : 'Pratique'}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button
                      to={`/formations/${course.slug}`}
                      variant="ghost"
                      size="sm"
                      className="w-full"
                    >
                      {t('courses.consult_program', 'Programme')}
                    </Button>
                    <Button
                      onClick={() => handleOpenInscription(course)}
                      variant="primary"
                      size="sm"
                      className="w-full"
                    >
                      {t('actions.register', "S'inscrire")}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contrôle de Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p)}
        />
      </main>

      {/* Modale de Préinscription */}
      <PreInscriptionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCourse(null);
        }}
        formation={selectedCourse}
        sessions={selectedCourse?.sessions || []}
      />
    </div>
  );
};

export default Formations;
