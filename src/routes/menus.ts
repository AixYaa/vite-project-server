import { Router } from 'express';
import { MenuController } from '@/controllers/menuController.js';
import { authenticate, requireAdmin, requireSuperAdmin, requirePermission } from '@/middleware/auth.js';

const router = Router();

router.get('/', authenticate, requirePermission('menu:view'), MenuController.list);
router.get('/tree', authenticate, requirePermission('menu:view'), MenuController.tree);
router.get('/my', authenticate, MenuController.myMenus);
router.get('/:id', authenticate, requirePermission('menu:view'), MenuController.getById);
router.post('/', authenticate, requirePermission('menu:create'), MenuController.create);
router.put('/:id', authenticate, requirePermission('menu:edit'), MenuController.update);
router.delete('/:id', authenticate, requirePermission('menu:delete'), MenuController.remove);
router.post('/sync', authenticate, requireSuperAdmin, MenuController.sync);

export default router;


