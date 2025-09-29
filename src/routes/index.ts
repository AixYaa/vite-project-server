import { Router } from 'express';
import authRoutes from './auth.js';
import userRoutes from './users.js';
import roleRoutes from './roles.js';
import permissionRoutes from './permissions.js';
import menuRoutes from './menus.js';
import dashboardRoutes from './dashboard.js';
import operationLogRoutes from './operationLogs.js';
import uploadsRoutes, { serveSecure } from './uploads.js';
import { operationLogMiddleware } from '../middleware/operationLog.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// 健康检查路由
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '服务运行正常',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API 路由
// 登录/登出等认证相关：无需 authenticate，但需要记录操作日志
router.use('/auth', operationLogMiddleware, authRoutes);

// 公开的签名文件访问（仅凭签名访问，无需令牌）- 放在受保护uploads之前
router.get('/uploads/secure', serveSecure);

// 其余受保护资源：先认证，再记录日志，再进入各自路由
router.use('/users', authenticate, operationLogMiddleware, userRoutes);
router.use('/roles', authenticate, operationLogMiddleware, roleRoutes);
router.use('/permissions', authenticate, operationLogMiddleware, permissionRoutes);
router.use('/menus', authenticate, operationLogMiddleware, menuRoutes);
router.use('/dashboard', authenticate, operationLogMiddleware, dashboardRoutes);
router.use('/operation-logs', authenticate, operationLogMiddleware, operationLogRoutes);
router.use('/uploads', authenticate, operationLogMiddleware, uploadsRoutes);

export default router;
