import type { Request, Response, NextFunction } from 'express';
import { OperationLogService } from '../services/operationLogService.js';
import type { AuthenticatedRequest } from '../types/index.js';

/**
 * 操作日志中间件
 * 自动记录API请求的操作日志
 */
export const operationLogMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const originalSend = res.send;

  // 重写res.send方法以捕获响应状态
  res.send = function(body) {
    const duration = Date.now() - startTime;
    
    // 异步记录日志，不阻塞响应
    setImmediate(async () => {
      try {
        const action = getActionFromRequest(req);
        const resource = getResourceFromRequest(req);
        const isLogin = req.method === 'POST' && /\/auth\/login/.test(req.originalUrl);
        
        const actorUserId = req.user?._id || (isLogin ? 'unknown' : 'anonymous');
        const actorUsername = req.user?.username || (isLogin ? (req as any).body?.username || 'anonymous' : 'anonymous');

        const logData: any = {
          userId: actorUserId,
          username: actorUsername,
          action,
          resource,
          method: req.method,
          url: req.originalUrl,
          ip: getClientIP(req),
          userAgent: req.get('User-Agent') || '',
          status: res.statusCode < 400 ? 'success' : 'failed',
          duration
        };

        if (req.params.id) {
          logData.resourceId = req.params.id;
        }

        if (res.statusCode >= 400) {
          logData.errorMessage = body;
        }

        await OperationLogService.logOperation(logData);
      } catch (error) {
        console.error('记录操作日志失败:', error);
      }
    });

    return originalSend.call(this, body);
  };

  next();
};

/**
 * 从请求中提取操作类型
 */
function getActionFromRequest(req: Request): string {
  const method = req.method;
  const url = req.originalUrl;

  // 根据HTTP方法和URL路径判断操作类型
  if (method === 'POST') {
    if (url.includes('/login')) return 'login';
    if (url.includes('/logout')) return 'logout';
    if (url.includes('/create') || url.includes('/add')) return 'create';
    return 'create';
  }
  
  if (method === 'PUT' || method === 'PATCH') {
    return 'update';
  }
  
  if (method === 'DELETE') {
    return 'delete';
  }
  
  if (method === 'GET') {
    if (url.includes('/export')) return 'export';
    if (url.includes('/download')) return 'download';
    return 'view';
  }

  return 'unknown';
}

/**
 * 从请求中提取资源类型
 */
function getResourceFromRequest(req: Request): string {
  const url = req.originalUrl;
  
  if (url.includes('/users')) return 'user';
  if (url.includes('/roles')) return 'role';
  if (url.includes('/menus')) return 'menu';
  if (url.includes('/permissions')) return 'permission';
  if (url.includes('/dashboard')) return 'dashboard';
  if (url.includes('/auth')) return 'auth';
  
  return 'unknown';
}

/**
 * 获取客户端IP地址
 */
function getClientIP(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    (req.headers['x-real-ip'] as string) ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    'unknown'
  );
}
