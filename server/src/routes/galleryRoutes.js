import { Router } from 'express';
import { galleryController } from '../controllers/galleryController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import { ROLES } from '../config/roles.js';
import { multerUpload, processSingleImage } from '../middlewares/upload.js';

const router = Router();

// ==========================================
// ROUTES PUBLIQUES
// ==========================================
router.get('/', galleryController.getAlbums);
router.get('/:slug', galleryController.getAlbumBySlug);

// ==========================================
// ROUTES ADMIN - ALBUMS & MÉDIAS
// ==========================================
router.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  multerUpload.single('coverImage'),
  processSingleImage('gallery', { width: 1200 }),
  galleryController.createAlbum
);
router.put(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  multerUpload.single('coverImage'),
  processSingleImage('gallery', { width: 1200 }),
  galleryController.updateAlbum
);
router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  galleryController.deleteAlbum
);

router.post(
  '/:id/media',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  multerUpload.single('file'),
  processSingleImage('gallery', { width: 1400 }),
  galleryController.addMediaItem
);
router.delete(
  '/media/:mediaId',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  galleryController.deleteMediaItem
);

export default router;
