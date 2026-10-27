import { Router } from 'express';
import { articleController } from '../controllers/articleController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import { ROLES } from '../config/roles.js';
import { multerUpload, processSingleImage } from '../middlewares/upload.js';

const router = Router();

// ==========================================
// ROUTES PUBLIQUES
// ==========================================
router.get('/', articleController.getArticles);
router.get('/featured', articleController.getFeaturedArticles);
router.get('/latest', articleController.getLatestArticles);
router.get('/:slug', articleController.getArticleBySlug);

// ==========================================
// ROUTES ADMIN (ARTICLES)
// ==========================================
router.get(
  '/admin/all',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EDITOR, ROLES.WRITER),
  articleController.getAdminArticles
);

router.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EDITOR, ROLES.WRITER),
  multerUpload.single('coverImage'),
  processSingleImage('articles', { width: 1200 }),
  articleController.createArticle
);

router.put(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EDITOR, ROLES.WRITER),
  multerUpload.single('coverImage'),
  processSingleImage('articles', { width: 1200 }),
  articleController.updateArticle
);

router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EDITOR, ROLES.WRITER),
  articleController.deleteArticle
);

export default router;
