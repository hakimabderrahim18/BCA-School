import { Router } from 'express';
import { contactController } from '../controllers/contactController.js';
import { settingsController } from '../controllers/settingsController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import { ROLES } from '../config/roles.js';
import { formSubmissionLimiter } from '../middlewares/rateLimiter.js';
import { antiSpam } from '../middlewares/antiSpam.js';

const router = Router();

// ==========================================
// ROUTES PUBLIQUES
// ==========================================
router.post('/', formSubmissionLimiter, antiSpam, contactController.sendMessage);
router.get('/testimonials', settingsController.getTestimonials);
router.get('/partners', settingsController.getPartners);

// ==========================================
// ROUTES ADMIN - MESSAGES
// ==========================================
router.get(
  '/messages',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  contactController.getMessages
);
router.get(
  '/messages/export/csv',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  contactController.exportMessagesCSV
);
router.get(
  '/messages/:id',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  contactController.getMessageById
);
router.patch(
  '/messages/:id/status',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  contactController.updateMessageStatus
);
router.post(
  '/messages/:id/reply',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  contactController.replyMessage
);
router.delete(
  '/messages/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  contactController.deleteMessage
);

export default router;
