import { Router } from 'express';
import { OperationLogController } from '../controllers/operationLogController.js';
import { authenticate, requirePermission } from '../middleware/auth.js';

const router = Router();

// 所有操作日志接口都需要认证 + 细粒度权限
router.get('/', authenticate, requirePermission('operationLog:view'), OperationLogController.list);
router.get('/stats', authenticate, requirePermission('operationLog:view'), OperationLogController.getStats);
router.delete('/cleanup', authenticate, requirePermission('operationLog:delete'), OperationLogController.cleanup);

export default router;
