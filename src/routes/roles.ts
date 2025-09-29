import { Router } from 'express';
import { RoleController } from '@/controllers/roleController.js';
import { authenticate, requirePermission } from '@/middleware/auth.js';

const router = Router();

router.get('/', authenticate, requirePermission('role:view'), RoleController.list);
router.get('/:id', authenticate, requirePermission('role:view'), RoleController.getById);
router.post('/', authenticate, requirePermission('role:create'), RoleController.create);
router.put('/:id', authenticate, requirePermission('role:edit'), RoleController.update);
router.delete('/:id', authenticate, requirePermission('role:delete'), RoleController.remove);

// API Keys for roles
router.get('/:id/api-keys', authenticate, requirePermission('role:view'), RoleController.listApiKeys);
router.post('/:id/api-keys', authenticate, requirePermission('role:edit'), RoleController.generateApiKey);
router.put('/:id/api-keys/toggle', authenticate, requirePermission('role:edit'), RoleController.toggleApiKey);
router.delete('/:id/api-keys/:key', authenticate, requirePermission('role:edit'), RoleController.revokeApiKey);

export default router;


