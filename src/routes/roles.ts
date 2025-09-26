import { Router } from 'express';
import { RoleController } from '@/controllers/roleController.js';
import { authenticate, requireAdmin, requireSuperAdmin } from '@/middleware/auth.js';

const router = Router();

router.get('/', authenticate, requireAdmin, RoleController.list);
router.get('/:id', authenticate, requireAdmin, RoleController.getById);
router.post('/', authenticate, requireSuperAdmin, RoleController.create);
router.put('/:id', authenticate, requireSuperAdmin, RoleController.update);
router.delete('/:id', authenticate, requireSuperAdmin, RoleController.remove);

export default router;


