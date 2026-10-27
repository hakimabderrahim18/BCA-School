import Article from '../models/Article.js';
import Formation from '../models/Formation.js';
import Event from '../models/Event.js';
import Annonceur from '../models/Annonceur.js';
import SiteSettings from '../models/SiteSettings.js';

const CRAWLER_USER_AGENTS = [
  'facebookexternalhit',
  'facebot',
  'twitterbot',
  'whatsapp',
  'linkedinbot',
  'telegrambot',
  'slackbot',
  'discordbot',
  'skypeuripreview',
  'applebot',
  'bingbot',
];

/**
 * Middleware de prérendu Open Graph & JSON-LD pour les robots d'indexation et réseaux sociaux.
 * Permet un partage riche (image, titre, description) sur WhatsApp, Facebook, LinkedIn et Twitter
 * tout en conservant la légèreté d'une SPA React pour les visiteurs normaux.
 */
export const crawlerPrerender = async (req, res, next) => {
  const userAgent = (req.get('user-agent') || '').toLowerCase();
  const isCrawler = CRAWLER_USER_AGENTS.some((bot) => userAgent.includes(bot));

  if (!isCrawler) {
    return next();
  }

  const { path } = req;
  const baseUrl = process.env.CLIENT_URL || `${req.protocol}://${req.get('host')}`;

  try {
    let metadata = {
      title: 'B.C.A. Tiaret - Centre de Formation & Communication',
      description: 'Centre de formation agréé et agence de communication média à Tiaret.',
      image: `${baseUrl}/uploads/settings/logo-bca.webp`,
      url: `${baseUrl}${path}`,
      type: 'website',
      schemaType: 'EducationalOrganization',
    };

    // 1. Détection Article (/actualites/:slug)
    const articleMatch = path.match(/^\/actualites\/([a-zA-Z0-9_-]+)/);
    if (articleMatch) {
      const slug = articleMatch[1];
      const article = await Article.findOne({ slug, status: 'published' }).lean();
      if (article) {
        metadata = {
          title: `${article.title} - B.C.A. Tiaret`,
          description: article.excerpt || article.title,
          image: article.coverImage?.startsWith('http') ? article.coverImage : `${baseUrl}${article.coverImage}`,
          url: `${baseUrl}/actualites/${slug}`,
          type: 'article',
          schemaType: 'NewsArticle',
          publishedTime: article.publishedAt || article.createdAt,
        };
      }
    }

    // 2. Détection Formation (/formations/:slug)
    const formationMatch = path.match(/^\/formations\/([a-zA-Z0-9_-]+)/);
    if (formationMatch) {
      const slug = formationMatch[1];
      const formation = await Formation.findOne({ slug, isActive: true }).lean();
      if (formation) {
        metadata = {
          title: `${formation.title} - Formation B.C.A. Tiaret`,
          description: formation.shortDescription || `Formation certifiante à Tiaret : ${formation.title}`,
          image: formation.image?.startsWith('http') ? formation.image : `${baseUrl}${formation.image}`,
          url: `${baseUrl}/formations/${slug}`,
          type: 'website',
          schemaType: 'Course',
        };
      }
    }

    // 3. Détection Événement (/evenements/:slug)
    const eventMatch = path.match(/^\/evenements\/([a-zA-Z0-9_-]+)/);
    if (eventMatch) {
      const slug = eventMatch[1];
      const event = await Event.findOne({ slug, status: 'published' }).lean();
      if (event) {
        metadata = {
          title: `${event.title} - Agenda B.C.A. Tiaret`,
          description: event.description?.slice(0, 200) || `Événement à Tiaret : ${event.title}`,
          image: event.coverImage?.startsWith('http') ? event.coverImage : `${baseUrl}${event.coverImage}`,
          url: `${baseUrl}/evenements/${slug}`,
          type: 'event',
          schemaType: 'Event',
        };
      }
    }

    // 4. Détection Annonceur (/annonces-publicite/:slug)
    const annonceurMatch = path.match(/^\/annonces-publicite\/([a-zA-Z0-9_-]+)/);
    if (annonceurMatch) {
      const slug = annonceurMatch[1];
      const annonceur = await Annonceur.findOne({ slug, status: 'active' }).lean();
      if (annonceur) {
        metadata = {
          title: `${annonceur.name} - Annuaire B.C.A. Tiaret`,
          description: annonceur.shortDescription || `${annonceur.name}, établissement à Tiaret.`,
          image: annonceur.logo?.startsWith('http') ? annonceur.logo : `${baseUrl}${annonceur.logo}`,
          url: `${baseUrl}/annonces-publicite/${slug}`,
          type: 'business.business',
          schemaType: 'LocalBusiness',
        };
      }
    }

    // Génération de la page HTML minimale avec balises Open Graph complètes
    const html = `<!DOCTYPE html>
<html lang="fr" dir="ltr">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(metadata.title)}</title>
  <meta name="description" content="${escapeHtml(metadata.description)}">
  <link rel="canonical" href="${metadata.url}">

  <!-- Open Graph / Facebook / WhatsApp -->
  <meta property="og:type" content="${metadata.type}">
  <meta property="og:url" content="${metadata.url}">
  <meta property="og:title" content="${escapeHtml(metadata.title)}">
  <meta property="og:description" content="${escapeHtml(metadata.description)}">
  <meta property="og:image" content="${metadata.image}">
  <meta property="og:site_name" content="B.C.A. Tiaret">
  <meta property="og:locale" content="fr_DZ">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${metadata.url}">
  <meta name="twitter:title" content="${escapeHtml(metadata.title)}">
  <meta name="twitter:description" content="${escapeHtml(metadata.description)}">
  <meta name="twitter:image" content="${metadata.image}">

  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "${metadata.schemaType}",
    "name": "${escapeHtml(metadata.title)}",
    "description": "${escapeHtml(metadata.description)}",
    "url": "${metadata.url}",
    "image": "${metadata.image}"
  }
  </script>
</head>
<body>
  <h1>${escapeHtml(metadata.title)}</h1>
  <p>${escapeHtml(metadata.description)}</p>
  <img src="${metadata.image}" alt="${escapeHtml(metadata.title)}">
</body>
</html>`;

    return res.status(200).send(html);
  } catch (error) {
    console.error('[CrawlerPrerender] Erreur génération prerender:', error);
    next();
  }
};

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default crawlerPrerender;
