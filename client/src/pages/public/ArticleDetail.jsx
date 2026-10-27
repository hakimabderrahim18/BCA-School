import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, User, Eye, ArrowLeft, Tag, Clock, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { SEOHelmet } from '../../components/common/SEOHelmet';
import { Badge } from '../../components/common/Badge';
import { ShareButtons } from '../../components/common/ShareButtons';
import { Button } from '../../components/common/Button';
import { getImageUrl } from '../../utils/imageUrl';

export const ArticleDetail = () => {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const isArabic = (i18n.language || 'fr').toLowerCase().startsWith('ar');
  const dateLocale = isArabic ? 'ar-DZ' : 'fr-FR';

  useEffect(() => {
    const fetchArticle = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/articles/${slug}`);
        if (res.data.success) {
          setArticle(res.data.data.article);
          setRelated(res.data.data.related || []);
        }
      } catch (err) {
        console.error('Erreur chargement article :', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="py-24 text-center text-slate-500 text-sm">
        {t('news.loading', "Chargement de l'article...")}
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl shadow-card text-center border border-slate-200">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900">
          {t('news.not_found', 'Article introuvable')}
        </h2>
        <Button to="/actualites" variant="primary" size="md" className="mt-4">
          {t('news.back_to_news', 'Retour aux actualités')}
        </Button>
      </div>
    );
  }

  // Schema.org Article JSON-LD
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    image: [article.coverImage],
    datePublished: article.publishedAt || article.createdAt,
    dateModified: article.updatedAt,
    author: [
      {
        '@type': 'Person',
        name: article.author?.name || 'Rédaction B.C.A.',
      },
    ],
    publisher: {
      '@type': 'Organization',
      name: 'Centre B.C.A. Tiaret',
      url: window.location.origin,
    },
    description: article.summary,
  };

  return (
    <article className="bg-slate-50 min-h-screen pb-20">
      <SEOHelmet
        title={article.seoTitle || article.title}
        description={article.seoDescription || article.summary}
        image={article.coverImage}
        url={`/actualites/${article.slug}`}
        type="article"
        schemaJson={articleSchema}
      />

      {/* En-tête de l'article */}
      <header className="bg-brand-950 text-white py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex items-center gap-2">
            <Link to="/actualites" className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1">
              <ArrowLeft className="w-3 h-3 rtl:rotate-180" /> {t('nav.news', 'Actualités')}
            </Link>
            <span className="text-slate-600">/</span>
            <Badge variant="brand">{article.category?.name}</Badge>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-snug">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2 border-t border-brand-900">
            <span className="flex items-center gap-1.5 font-medium">
              <User className="w-4 h-4 text-accent-400" />
              {article.author?.name || 'Rédaction B.C.A.'}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-accent-400" />
              {new Date(article.publishedAt || article.createdAt).toLocaleDateString(dateLocale, {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            {article.viewsCount > 0 && (
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-accent-400" />
                {article.viewsCount} {t('news.views', 'vues')}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Contenu de l'article */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-2xl shadow-card border border-slate-200/80 overflow-hidden p-6 sm:p-10 space-y-8">
          {/* Image de couverture */}
          {article.coverImage && (
            <div className="rounded-xl overflow-hidden shadow-sm">
              <img
                src={getImageUrl(article.coverImage)}
                alt={article.title}
                className="w-full h-auto max-h-[460px] object-cover"
              />
            </div>
          )}

          {/* Résumé introductif (Chapeau) */}
          {article.summary && (
            <div className="p-4 sm:p-6 bg-slate-50 border-l-4 rtl:border-l-0 rtl:border-r-4 border-brand-600 rounded-r-xl rtl:rounded-r-none rtl:rounded-l-xl text-sm sm:text-base text-slate-700 font-medium leading-relaxed italic">
              {article.summary}
            </div>
          )}

          {/* Corps de l'article (Texte riche) */}
          <div
            className="prose max-w-none text-sm sm:text-base text-slate-800 leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Vidéo intégrée éventuelle */}
          {article.videoUrl && (
            <div className="aspect-video rounded-xl overflow-hidden shadow-md bg-black my-6">
              <iframe
                src={article.videoUrl}
                title="Vidéo intégrée"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Tags de l'article */}
          {article.tags && article.tags.length > 0 && (
            <div className="pt-6 border-t border-slate-100 flex items-center gap-2 flex-wrap">
              <Tag className="w-4 h-4 text-slate-400 shrink-0" />
              {article.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 transition"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Boutons de Partage Réseaux Sociaux */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4">
            <ShareButtons url={`/actualites/${article.slug}`} title={article.title} />
          </div>
        </div>

        {/* Articles Similaires */}
        {related && related.length > 0 && (
          <div className="mt-16 space-y-6">
            <h3 className="text-xl font-bold text-slate-900">
              {t('news.related_articles', 'Dans la même catégorie')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {related.map((rel) => (
                <Link
                  key={rel._id}
                  to={`/actualites/${rel.slug}`}
                  className="group bg-white p-4 rounded-xl border border-slate-200 shadow-soft hover:shadow-md transition block"
                >
                  <img
                    src={getImageUrl(rel.coverImage)}
                    alt={rel.title}
                    className="w-full h-32 rounded-lg object-cover mb-3 group-hover:scale-105 transition-transform"
                  />
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-brand-600 transition line-clamp-2 leading-snug">
                    {rel.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 mt-2 block">
                    {new Date(rel.publishedAt || rel.createdAt).toLocaleDateString(dateLocale)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </article>
  );
};

export default ArticleDetail;