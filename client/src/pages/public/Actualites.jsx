import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Calendar, User, ArrowRight, Eye, Newspaper } from 'lucide-react';
import api from '../../services/api';
import { SEOHelmet } from '../../components/common/SEOHelmet';
import { Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { Button } from '../../components/common/Button';
import { getImageUrl } from '../../utils/imageUrl';
import { FALLBACK_ARTICLES } from '../../data/fallbackData';

export const Actualites = () => {
  const { t, i18n } = useTranslation();
  const isArabic = (i18n?.language || 'fr').toLowerCase().startsWith('ar');
  const dateLocale = isArabic ? 'ar-DZ' : 'fr-FR';

  const [articles, setArticles] = useState(FALLBACK_ARTICLES);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const formatArticleDate = (dateVal) => {
    if (!dateVal) return '';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    try {
      return d.toLocaleDateString(dateLocale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return String(dateVal);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories?type=article');
        if (res.data.success) setCategories(res.data.data);
      } catch (err) {
        console.error('Erreur chargement catégories articles :', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({ page, limit: 9 });
        if (selectedCategory) params.append('category', selectedCategory);
        if (search) params.append('search', search);

        const res = await api.get(`/articles?${params.toString()}`);
        if (res.data.success) {
          setArticles(res.data.data);
          setTotalPages(res.data.meta?.totalPages || 1);
        }
      } catch (err) {
        console.error('Erreur chargement articles :', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [selectedCategory, search, page]);

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <SEOHelmet
        title="Actualités & Informations Locales"
        description="Retrouvez toutes les actualités du centre B.C.A., les nouvelles économiques et culturelles de Tiaret et de la région."
      />

      <section className="bg-brand-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="inline-block px-3 py-1 rounded-full bg-accent-500/20 text-accent-400 border border-accent-400/30 text-xs font-bold uppercase tracking-wider">
            {t('home.regional_portal', "Portail d'Information Locale")}
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            {t('news.title')}
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300">
            {t('news.subtitle')}
          </p>
        </div>
      </section>

      {/* Barre d'outils recherche et catégories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-7">
        <div className="bg-white rounded-2xl shadow-card border border-slate-200/80 p-4 sm:p-6 space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={t('news.search_placeholder', 'Rechercher une actualité, un événement ou un article...')}
              className="w-full ps-12 pe-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
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
              {t('actions.all_categories', 'Tous les articles')}
            </button>
            {categories.map((c) => (
              <button
                key={c._id}
                onClick={() => {
                  setSelectedCategory(c._id);
                  setPage(1);
                }}
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
        </div>
      </section>

      {/* Grille des Articles */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {isLoading ? (
          <div className="py-20 text-center text-slate-500 text-sm">
            {t('common.loading', 'Chargement des actualités...')}
          </div>
        ) : articles.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-lg mx-auto my-12 shadow-soft">
            <Newspaper className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900">
              {t('news.not_found', 'Aucun article trouvé')}
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              {t('courses.course_not_found_desc', 'Aucun article ne correspond à vos critères de recherche.')}
            </p>
            <Button
              onClick={() => {
                setSelectedCategory('');
                setSearch('');
              }}
              variant="outline"
              size="sm"
            >
              {t('actions.reset_filters', 'Réinitialiser')}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((art) => (
              <article
                key={art._id}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-card transition-all duration-300 flex flex-col justify-between"
              >
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={getImageUrl(art.coverImage)}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 start-3">
                    <Badge variant="brand">{art.category?.name}</Badge>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatArticleDate(art.publishedAt || art.createdAt)}
                      </span>
                      {art.viewsCount > 0 && (
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          {art.viewsCount} {t('news.views', 'vues')}
                        </span>
                      )}
                    </div>

                    <h2 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition leading-snug line-clamp-2">
                      <Link to={`/actualites/${art.slug}`}>{art.title}</Link>
                    </h2>

                    <p className="mt-2 text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {art.summary}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-brand-600" />
                      {art.author?.name || 'Rédaction B.C.A.'}
                    </span>

                    <Link
                      to={`/actualites/${art.slug}`}
                      className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition"
                    >
                      {t('news.read_more', "Lire l'article")}
                      <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p)}
        />
      </main>
    </div>
  );
};

export default Actualites;
