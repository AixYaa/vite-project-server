import { Router } from 'express';
import { PermissionController } from '@/controllers/permissionController.js';
import { authenticate, requireAdmin } from '@/middleware/auth.js';

const router = Router();

router.get('/', authenticate, requireAdmin, PermissionController.list);
router.get('/:id', authenticate, requireAdmin, PermissionController.getById);
router.post('/', authenticate, requireAdmin, PermissionController.create);
router.put('/:id', authenticate, requireAdmin, PermissionController.update);
router.delete('/:id', authenticate, requireAdmin, PermissionController.remove);

export default router;


