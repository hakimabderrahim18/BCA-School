import { Router } from 'express';
import { adSlotController } from '../controllers/adSlotController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import { ROLES } from '../config/roles.js';
import { multerUpload, processSingleImage } from '../middlewares/upload.js';

const router = Router();

// ==========================================
// ROUTES PUBLIQUES & LISTE
// ==========================================
router.get('/', adSlotController.getAllAds);
router.get('/active', adSlotController.getActiveAds);
router.post('/:id/click', adSlotController.recordClick);

const uploadAdBanner = (req, res, next) => {
  multerUpload.fields([
    { name: 'imageUrl', maxCount: 1 },
    { name: 'image', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
  ])(req, res, (err) => {
    if (err) return next(err);
    if (req.files) {
      if (req.files['imageUrl'] && req.files['imageUrl'][0]) {
        req.file = req.files['imageUrl'][0];
      } else if (req.files['image'] && req.files['image'][0]) {
        req.file = req.files['image'][0];
      } else if (req.files['banner'] && req.files['banner'][0]) {
        req.file = req.files['banner'][0];
      }
    }
    next();
  });
};

// ==========================================
// ROUTES ADMIN
// ==========================================
router.get(
  '/admin/all',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  adSlotController.getAllAds
);
router.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  uploadAdBanner,
  processSingleImage('ads', { width: 1400 }),
  adSlotController.createAd
);
router.put(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  uploadAdBanner,
  processSingleImage('ads', { width: 1400 }),
  adSlotController.updateAd
);
router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  adSlotController.deleteAd
);

export default router;