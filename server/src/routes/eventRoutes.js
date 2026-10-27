import { Router } from 'express';
import { eventController } from '../controllers/eventController.js';
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
router.get('/', eventController.getEvents);
router.get('/upcoming', eventController.getUpcomingEvents);
router.get('/:slug', eventController.getEventBySlug);
router.post(
  '/propose',
  formSubmissionLimiter,
  antiSpam,
  multerUpload.single('flyerImage'),
  processSingleImage('events', { width: 1000 }),
  eventController.proposeEvent
);

// ==========================================
// ROUTES ADMIN - PROPOSITIONS
// ==========================================
router.get(
  '/admin/proposals',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  eventController.getProposals
);
router.patch(
  '/admin/proposals/:id/moderate',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  eventController.moderateProposal
);

// ==========================================
// ROUTES ADMIN - ÉVÉNEMENTS (CRUD)
// ==========================================
router.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  multerUpload.single('coverImage'),
  processSingleImage('events', { width: 1200 }),
  eventController.createEvent
);
router.put(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  multerUpload.single('coverImage'),
  processSingleImage('events', { width: 1200 }),
  eventController.updateEvent
);
router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  eventController.deleteEvent
);

export default router;
