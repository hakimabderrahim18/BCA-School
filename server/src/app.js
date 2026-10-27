import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import path from 'path';
import fs from 'fs';

import { generalLimiter } from './middlewares/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { sendSuccess } from './utils/apiResponse.js';
import apiRouter from './routes/index.js';
import { seoController } from './controllers/seoController.js';
import { crawlerPrerender } from './middlewares/crawlerPrerender.js';

const app = express();

// 1. Headers de sécurité HTTP avec Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Autorise le chargement des images par le frontend
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  })
);

// 2. Configuration CORS (Cross-Origin Resource Sharing)
const clientUrls = (process.env.CLIENT_URL || '')
  .split(',')
  .map((u) => u.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const allowedOrigins = [
  ...clientUrls,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Autorise les requêtes sans origin (outils serveur, postman, curl)
      if (!origin) return callback(null, true);

      // Autorise si dans la liste configurée ou si sous-domaine de déploiement vercel / render
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.onrender.com') ||
        process.env.NODE_ENV !== 'production'
      ) {
        callback(null, true);
      } else {
        callback(new Error(`Origine CORS non autorisée : ${origin}`));
      }
    },
    credentials: true, // Autorise l'envoi de cookies HTTP-Only
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'x-recaptcha-token'],
  })
);

// 3. Journalisation des requêtes HTTP (Morgan)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 4. Compression des réponses HTTP (Gzip)
app.use(compression());

// 5. Parsers de corps de requêtes & cookies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'bca_cookie_secret_tiaret_2026'));

// 6. Nettoyage contre les injections NoSQL (Sanitization)
app.use(mongoSanitize());

// 7. Servir les fichiers médias uploadés de manière statique
const uploadsPath = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// 8. Prérendu pour robots de réseaux sociaux (WhatsApp, Facebook, LinkedIn, Twitter)
app.use(crawlerPrerender);

// 9. Routes SEO dynamiques (sitemap.xml et robots.txt)
app.get('/sitemap.xml', seoController.generateSitemap);
app.get('/robots.txt', seoController.generateRobotsTxt);

// 10. Limiteur de requêtes général sur toutes les routes API
const apiRoutePrefixes = [
  '/api',
  '/auth',
  '/users',
  '/categories',
  '/formations',
  '/prestations',
  '/articles',
  '/events',
  '/annonceurs',
  '/ads',
  '/gallery',
  '/albums',
  '/contact',
  '/settings',
  '/dashboard',
  '/upload',
];
app.use(apiRoutePrefixes, generalLimiter);

// 11. Route de diagnostic / santé (Health Check)
app.get(['/health', '/api/health'], (req, res) => {
  return sendSuccess(res, 200, 'Serveur API B.C.A. opérationnel', {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
  });
});

// 12. Montage de l'ensemble des routes API REST (sur /api et en racine directe sans /api)
app.use('/api', apiRouter);
app.use('/', apiRouter);

// 13. Gestion des erreurs 404 (Route non trouvée)
app.use(notFoundHandler);

// 14. Middleware global d'interception et de formatage des erreurs
app.use(errorHandler);

export default app;
