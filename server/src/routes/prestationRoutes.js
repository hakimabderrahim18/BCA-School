import { Router } from 'express';
import { prestationController } from '../controllers/prestationController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import { ROLES } from '../config/roles.js';
import { formSubmissionLimiter } from '../middlewares/rateLimiter.js';
import { antiSpam } from '../middlewares/antiSpam.js';
import { multerUpload, processSingleImage } from '../middlewares/upload.js';

const router = Router();

// ==========================================
// ROUTES PUBLIQUES
// ==========================================
router.get('/', prestationController.getPrestations);
router.get('/featured', prestationController.getFeaturedPrestations);
router.get('/realisations', prestationController.getRealisations);
router.get('/:slug', prestationController.getPrestationBySlug);
router.post('/quotes', formSubmissionLimiter, antiSpam, prestationController.requestQuote);

// ==========================================
// ROUTES ADMIN - PRESTATIONS
// ==========================================
router.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  multerUpload.single('image'),
  processSingleImage('prestations', { width: 1200 }),
  prestationController.createPrestation
);
router.put(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  multerUpload.single('image'),
  processSingleImage('prestations', { width: 1200 }),
  prestationController.updatePrestation
);
router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  prestationController.deletePrestation
);

// ==========================================
// ROUTES ADMIN - RÉALISATIONS
// ==========================================
router.post(
  '/admin/realisations',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  multerUpload.single('coverImage'),
  processSingleImage('prestations', { width: 1200 }),
  prestationController.createRealisation
);
router.put(
  '/admin/realisations/:id',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  multerUpload.single('coverImage'),
  processSingleImage('prestations', { width: 1200 }),
  prestationController.updateRealisation
);
router.delete(
  '/admin/realisations/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  prestationController.deleteRealisation
);

// ==========================================
// ROUTES ADMIN - DEMANDES DE DEVIS
// ==========================================
router.get(
  '/admin/quotes',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  prestationController.getQuotes
);
router.get(
  '/admin/quotes/export/csv',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  prestationController.exportQuotesCSV
);
router.patch(
  '/admin/quotes/:id/status',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  prestationController.updateQuoteStatus
);
router.delete(
  '/admin/quotes/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  prestationController.deleteQuote
);

export default router;
