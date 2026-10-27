import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import { ROLES } from '../config/roles.js';

const router = Router();

router.get('/stats', authenticate, authorize(ROLES.ADMIN, ROLES.EDITOR), dashboardController.getStats);

export default router;
