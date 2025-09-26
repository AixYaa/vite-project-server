import { Router } from 'express';
import { MenuController } from '@/controllers/menuController.js';
import { authenticate, requireAdmin, requireSuperAdmin } from '@/middleware/auth.js';

const router = Router();

router.get('/', authenticate, requireAdmin, MenuController.list);
router.get('/tree', authenticate, requireAdmin, MenuController.tree);
router.get('/my', authenticate, MenuController.myMenus);
router.get('/:id', authenticate, requireAdmin, MenuController.getById);
router.post('/', authenticate, requireAdmin, MenuController.create);
router.put('/:id', authenticate, requireAdmin, MenuController.update);
router.delete('/:id', authenticate, requireAdmin, MenuController.remove);
router.post('/sync', authenticate, requireSuperAdmin, MenuController.sync);

export default router;


