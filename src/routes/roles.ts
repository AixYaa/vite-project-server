import { Router } from 'express';
import { RoleController } from '@/controllers/roleController.js';
import { authenticate, requirePermission, requireSuperAdmin } from '@/middleware/auth.js';

const router = Router();

router.get('/', authenticate, requirePermission('role:view'), RoleController.list);
router.get('/:id', authenticate, requirePermission('role:view'), RoleController.getById);
router.post('/', authenticate, requirePermission('role:create'), RoleController.create);
router.put('/:id', authenticate, requirePermission('role:edit'), RoleController.update);
router.delete('/:id', authenticate, requirePermission('role:delete'), RoleController.remove);

export default router;


