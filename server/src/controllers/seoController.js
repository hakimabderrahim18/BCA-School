import Formation from '../models/Formation.js';
import Article from '../models/Article.js';
import Event from '../models/Event.js';
import Prestation from '../models/Prestation.js';
import Annonceur from '../models/Annonceur.js';

export const seoController = {
  /**
   * Génération dynamique du sitemap.xml conforme aux normes Google et moteurs de recherche
   * GET /sitemap.xml
   */
  async generateSitemap(req, res) {
    try {
      const baseUrl = process.env.CLIENT_URL || `${req.protocol}://${req.get('host')}`;
      const now = new Date().toISOString();

      // Pages statiques principales avec fréquence et priorité
      const staticPages = [
        { url: '/', changefreq: 'daily', priority: '1.0' },
        { url: '/a-propos', changefreq: 'weekly', priority: '0.8' },
        { url: '/formations', changefreq: 'daily', priority: '0.9' },
        { url: '/prestations', changefreq: 'weekly', priority: '0.9' },
        { url: '/actualites', changefreq: 'daily', priority: '0.9' },
        { url: '/evenements', changefreq: 'daily', priority: '0.9' },
        { url: '/annonces-publicite', changefreq: 'daily', priority: '0.8' },
        { url: '/galerie', changefreq: 'weekly', priority: '0.7' },
        { url: '/contact', changefreq: 'monthly', priority: '0.8' },
        { url: '/mentions-legales', changefreq: 'yearly', priority: '0.3' },
        { url: '/confidentialite', changefreq: 'yearly', priority: '0.3' },
      ];

      // Récupération concurrente des contenus dynamiques indexables
      const [formations, articles, events, prestations, annonceurs] = await Promise.all([
        Formation.find({ isActive: true }).select('slug updatedAt').lean(),
        Article.find({ status: 'published' }).select('slug updatedAt publishedAt').lean(),
        Event.find({ status: 'published' }).select('slug updatedAt date').lean(),
        Prestation.find({ isActive: true }).select('slug updatedAt').lean(),
        Annonceur.find({ status: 'active' }).select('slug updatedAt').lean(),
      ]);

      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

      // 1. Pages statiques
      for (const page of staticPages) {
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
        xml += `    <lastmod>${now}</lastmod>\n`;
        xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
        xml += `    <priority>${page.priority}</priority>\n`;
        xml += '  </url>\n';
      }

      // 2. Formations
      for (const f of formations) {
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/formations/${f.slug}</loc>\n`;
        xml += `    <lastmod>${(f.updatedAt || new Date()).toISOString()}</lastmod>\n`;
        xml += '    <changefreq>weekly</changefreq>\n';
        xml += '    <priority>0.8</priority>\n';
        xml += '  </url>\n';
      }

      // 3. Articles d'actualité
      for (const a of articles) {
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/actualites/${a.slug}</loc>\n`;
        xml += `    <lastmod>${(a.updatedAt || a.publishedAt || new Date()).toISOString()}</lastmod>\n`;
        xml += '    <changefreq>daily</changefreq>\n';
        xml += '    <priority>0.8</priority>\n';
        xml += '  </url>\n';
      }

      // 4. Événements de l'agenda
      for (const e of events) {
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/evenements/${e.slug}</loc>\n`;
        xml += `    <lastmod>${(e.updatedAt || new Date()).toISOString()}</lastmod>\n`;
        xml += '    <changefreq>weekly</changefreq>\n';
        xml += '    <priority>0.8</priority>\n';
        xml += '  </url>\n';
      }

      // 5. Prestations
      for (const p of prestations) {
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/prestations/${p.slug}</loc>\n`;
        xml += `    <lastmod>${(p.updatedAt || new Date()).toISOString()}</lastmod>\n`;
        xml += '    <changefreq>monthly</changefreq>\n';
        xml += '    <priority>0.8</priority>\n';
        xml += '  </url>\n';
      }

      // 6. Fiches annonceurs de l'annuaire
      for (const an of annonceurs) {
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/annonces-publicite/${an.slug}</loc>\n`;
        xml += `    <lastmod>${(an.updatedAt || new Date()).toISOString()}</lastmod>\n`;
        xml += '    <changefreq>monthly</changefreq>\n';
        xml += '    <priority>0.7</priority>\n';
        xml += '  </url>\n';
      }

      xml += '</urlset>';

      res.header('Content-Type', 'application/xml; charset=utf-8');
      res.header('Cache-Control', 'public, max-age=3600'); // Cache 1 heure
      return res.send(xml);
    } catch (error) {
      console.error('[SEO] Erreur génération sitemap:', error);
      return res.status(500).send('Erreur lors de la génération du sitemap');
    }
  },

  /**
   * Génération dynamique du robots.txt
   * GET /robots.txt
   */
  generateRobotsTxt(req, res) {
    const baseUrl = process.env.CLIENT_URL || `${req.protocol}://${req.get('host')}`;

    const robots = `# robots.txt pour la plateforme B.C.A. Tiaret
User-agent: *
Allow: /
Allow: /formations/
Allow: /prestations/
Allow: /actualites/
Allow: /evenements/
Allow: /annonces-publicite/
Allow: /galerie/
Allow: /contact/
Allow: /uploads/

# Sections privées et administration
Disallow: /admin/
Disallow: /api/
Disallow: /uploads/backups/

# Emplacement du sitemap
Sitemap: ${baseUrl}/sitemap.xml
`;

    res.header('Content-Type', 'text/plain; charset=utf-8');
    res.header('Cache-Control', 'public, max-age=86400'); // Cache 24 heures
    return res.send(robots);
  },
};

export default seoController;
