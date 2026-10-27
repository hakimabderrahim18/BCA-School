import { Router } from 'express';
import { settingsController } from '../controllers/settingsController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import { ROLES } from '../config/roles.js';
import { multerUpload, processSingleImage } from '../middlewares/upload.js';

const router = Router();

// ==========================================
// ROUTES PUBLIQUES
// ==========================================
router.get('/', settingsController.getSettings);
router.get('/partners', settingsController.getPartners);
router.get('/testimonials', settingsController.getTestimonials);

// ==========================================
// ROUTES ADMIN - PARAMÈTRES GÉNÉRAUX
// ==========================================
router.put(
  '/',
  authenticate,
  authorize(ROLES.ADMIN),
  multerUpload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'logoWhite', maxCount: 1 },
    { name: 'favicon', maxCount: 1 },
    { name: 'heroSlide1', maxCount: 1 },
    { name: 'heroSlide2', maxCount: 1 },
    { name: 'heroSlide3', maxCount: 1 },
    { name: 'ctaBanner', maxCount: 1 },
  ]),
  settingsController.updateSettings
);

// ==========================================
// ROUTES ADMIN - PARTENAIRES & LOGOS
// ==========================================
router.get(
  '/partners/admin',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  settingsController.getAllPartnersAdmin
);
router.post(
  '/partners',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  multerUpload.single('logo'),
  processSingleImage('partners', { width: 500 }),
  settingsController.createPartner
);
router.put(
  '/partners/:id',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  multerUpload.single('logo'),
  processSingleImage('partners', { width: 500 }),
  settingsController.updatePartner
);
router.delete(
  '/partners/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  settingsController.deletePartner
);

// ==========================================
// ROUTES ADMIN - TÉMOIGNAGES
// ==========================================
router.get(
  '/testimonials/admin',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  settingsController.getAllTestimonialsAdmin
);
router.post(
  '/testimonials',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  multerUpload.single('avatar'),
  processSingleImage('partners', { width: 300 }),
  settingsController.createTestimonial
);
router.put(
  '/testimonials/:id',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  multerUpload.single('avatar'),
  processSingleImage('partners', { width: 300 }),
  settingsController.updateTestimonial
);
router.delete(
  '/testimonials/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  settingsController.deleteTestimonial
);

export default router;
