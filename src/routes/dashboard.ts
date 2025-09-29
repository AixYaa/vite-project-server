import { Router } from 'express';
import { DashboardController } from '@/controllers/dashboardController.js';
import { authenticate, requirePermission } from '@/middleware/auth.js';

const router = Router();

// 所有仪表盘接口都需要认证
router.get('/stats', authenticate, requirePermission('dashboard:view'), DashboardController.getStats);
router.get('/system-status', authenticate, requirePermission('dashboard:view'), DashboardController.getSystemStatus);
router.get('/recent-activities', authenticate, requirePermission('dashboard:view'), DashboardController.getRecentActivities);
router.get('/access-trend', authenticate, requirePermission('dashboard:view'), DashboardController.getAccessTrend);
router.get('/user-info', authenticate, requirePermission('dashboard:view'), DashboardController.getUserInfo);

export default router;
