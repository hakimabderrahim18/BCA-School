import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import { ROLES } from '../config/roles.js';
import { multerUpload, processSingleImage } from '../middlewares/upload.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const router = Router();

/**
 * Route universelle d'upload d'images (Admin / Editeur)
 * POST /api/upload
 */
router.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  (req, res, next) => {
    multerUpload.single('file')(req, res, (err) => {
      if (err) return sendError(res, 400, err.message);
      if (!req.file) {
        // Fallback si le champ s'appelle 'image'
        return multerUpload.single('image')(req, res, (err2) => {
          if (err2) return sendError(res, 400, err2.message);
          next();
        });
      }
      next();
    });
  },
  processSingleImage('general', { width: 1920, quality: 85 }),
  (req, res) => {
    if (!req.file) {
      return sendError(res, 400, 'Aucun fichier sélectionné.');
    }
    return sendSuccess(res, 200, 'Image téléversée avec succès', {
      url: req.file.path,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
    });
  }
);

export default router;
