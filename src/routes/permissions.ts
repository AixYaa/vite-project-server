import { Router } from 'express';
import { PermissionController } from '@/controllers/permissionController.js';
import { authenticate, requirePermission } from '@/middleware/auth.js';

const router = Router();

router.get('/', authenticate, requirePermission('permission:view'), PermissionController.list);
router.get('/tree', authenticate, requirePermission('permission:view'), PermissionController.tree);
router.get('/:id', authenticate, requirePermission('permission:view'), PermissionController.getById);
router.post('/', authenticate, requirePermission('permission:create'), PermissionController.create);
router.put('/:id', authenticate, requirePermission('permission:edit'), PermissionController.update);
router.delete('/:id', authenticate, requirePermission('permission:delete'), PermissionController.remove);

export default router;


