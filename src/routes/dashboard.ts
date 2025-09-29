import { Router } from 'express';
import { DashboardController } from '@/controllers/dashboardController.js';
import { authenticate } from '@/middleware/auth.js';

const router = Router();

// 所有仪表盘接口都需要认证
router.get('/stats', authenticate, DashboardController.getStats);
router.get('/system-status', authenticate, DashboardController.getSystemStatus);
router.get('/recent-activities', authenticate, DashboardController.getRecentActivities);
router.get('/access-trend', authenticate, DashboardController.getAccessTrend);
router.get('/user-info', authenticate, DashboardController.getUserInfo);

export default router;
