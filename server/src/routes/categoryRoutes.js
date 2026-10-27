import { Router } from 'express';
import { categoryController } from '../controllers/categoryController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import { ROLES } from '../config/roles.js';

const router = Router();

// Routes publiques
router.get('/', categoryController.getCategories);

// Routes d'administration
router.post('/', authenticate, authorize(ROLES.ADMIN, ROLES.EDITOR), categoryController.createCategory);
router.put('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.EDITOR), categoryController.updateCategory);
router.delete('/:id', authenticate, authorize(ROLES.ADMIN), categoryController.deleteCategory);

export default router;
