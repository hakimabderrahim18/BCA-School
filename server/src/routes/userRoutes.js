import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import { ROLES } from '../config/roles.js';

const router = Router();

// Toutes les routes de gestion d'utilisateurs sont strictement réservées au super-admin
router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/', userController.getUsers);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;
