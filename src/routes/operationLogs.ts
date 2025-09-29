import { Router } from 'express';
import { OperationLogController } from '../controllers/operationLogController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// 所有操作日志接口都需要认证和管理员权限
router.get('/', authenticate, requireAdmin, OperationLogController.list);
router.get('/stats', authenticate, requireAdmin, OperationLogController.getStats);
router.delete('/cleanup', authenticate, requireAdmin, OperationLogController.cleanup);

export default router;
