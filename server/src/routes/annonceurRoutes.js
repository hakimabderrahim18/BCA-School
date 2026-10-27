import { Router } from 'express';
import { annonceurController } from '../controllers/annonceurController.js';
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
router.get('/', annonceurController.getAnnonceurs);
router.get('/featured', annonceurController.getFeaturedAnnonceurs);
router.get('/petites/annonces', annonceurController.getPetitesAnnonces);
router.post(
  '/petites/annonces',
  formSubmissionLimiter,
  antiSpam,
  multerUpload.single('image'),
  processSingleImage('ads', { width: 1000 }),
  annonceurController.createPetiteAnnonce
);
router.get('/:slug', annonceurController.getAnnonceurBySlug);

// ==========================================
// ROUTES ADMIN - ANNONCEURS
// ==========================================
router.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  multerUpload.single('logo'),
  processSingleImage('partners', { width: 600 }),
  annonceurController.createAnnonceur
);
router.put(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  multerUpload.single('logo'),
  processSingleImage('partners', { width: 600 }),
  annonceurController.updateAnnonceur
);
router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  annonceurController.deleteAnnonceur
);

// ==========================================
// ROUTES ADMIN - MODÉRATION PETITES ANNONCES
// ==========================================
router.get(
  '/admin/petites/annonces',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  annonceurController.getAdminPetitesAnnonces
);
router.patch(
  '/admin/petites/annonces/:id/moderate',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  annonceurController.moderatePetiteAnnonce
);
router.delete(
  '/admin/petites/annonces/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  annonceurController.deletePetiteAnnonce
);

export default router;
