import { Router } from 'express';
import { formationController } from '../controllers/formationController.js';
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
router.get('/', formationController.getFormations);
router.get('/featured', formationController.getFeaturedFormations);
router.get('/:slug', formationController.getFormationBySlug);
router.post('/:id/pre-inscrire', formSubmissionLimiter, antiSpam, formationController.preInscrire);

// ==========================================
// ROUTES ADMIN - PRÉINSCRIPTIONS
// ==========================================
router.get(
  '/admin/inscriptions',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  formationController.getInscriptions
);
router.get(
  '/admin/inscriptions/export/csv',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  formationController.exportInscriptionsCSV
);
router.patch(
  '/admin/inscriptions/:id/status',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  formationController.updateInscriptionStatus
);
router.delete(
  '/admin/inscriptions/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  formationController.deleteInscription
);

// ==========================================
// ROUTES ADMIN - FORMATIONS (CRUD)
// ==========================================
router.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  multerUpload.single('image'),
  processSingleImage('formations', { width: 1200 }),
  formationController.createFormation
);
router.put(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  multerUpload.single('image'),
  processSingleImage('formations', { width: 1200 }),
  formationController.updateFormation
);
router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  formationController.deleteFormation
);

// ==========================================
// ROUTES ADMIN - SESSIONS
// ==========================================
router.post(
  '/:id/sessions',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  formationController.createSession
);
router.put(
  '/sessions/:sessionId',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  formationController.updateSession
);
router.delete(
  '/sessions/:sessionId',
  authenticate,
  authorize(ROLES.ADMIN),
  formationController.deleteSession
);

export default router;
