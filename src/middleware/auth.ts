import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '@/services/authService.js';
import { RedisService } from '@/services/redisService.js';
import { extractTokenFromHeader } from '@/utils/jwt.js';
import type { AuthenticatedRequest } from '@/types/index.js';
import { unauthorizedResponse } from '@/utils/response.js';
import { logger } from '@/utils/logger.js';

// 全局 Redis 服务实例
let redisService: RedisService | null = null;

export const setRedisService = (service: RedisService): void => {
  redisService = service;
};

/**
 * 认证中间件
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      unauthorizedResponse(res, '请提供访问令牌');
      return;
    }

    // 检查令牌是否在黑名单中
    if (redisService) {
      const isBlacklisted = await redisService.isTokenBlacklisted(token);
      if (isBlacklisted) {
        unauthorizedResponse(res, '令牌已失效');
        return;
      }
    }

    const user = await AuthService.validateToken(token);
    req.user = user;
    req.userId = user._id;

    next();
  } catch (error) {
    logger.error('认证失败', error);
    unauthorizedResponse(res, '无效的访问令牌');
  }
};

/**
 * 角色权限中间件
 */
export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      unauthorizedResponse(res, '请先登录');
      return;
    }

    // 支持角色编码和角色名称两种格式
    const userRole = req.user.role;
    const hasPermission = roles.some(role => 
      role === userRole || 
      role.toUpperCase() === userRole.toUpperCase()
    );

    if (!hasPermission) {
      unauthorizedResponse(res, '权限不足');
      return;
    }

    next();
  };
};

/**
 * 超级管理员权限中间件
 */
export const requireSuperAdmin = authorize('super_admin');

/**
 * 管理员权限中间件（超级管理员 + 管理员）
 */
export const requireAdmin = authorize('super_admin', 'admin');

/**
 * 权限点验证中间件
 */
export const requirePermission = (permissionCode: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        unauthorizedResponse(res, '请先登录');
        return;
      }

      // 超级管理员拥有所有权限
      if (req.user.role === 'super_admin' || req.user.role === 'SUPER_ADMIN') {
        next();
        return;
      }

      // 获取用户的角色信息（包含权限）
      const { Role } = await import('@/models/Role.js');
      const userRole = await Role.findOne({ code: req.user.role }).populate('permissions');
      
      if (!userRole) {
        unauthorizedResponse(res, '角色不存在');
        return;
      }

      // 检查用户是否有指定权限
      const hasPermission = userRole.permissions.some((permission: any) => 
        permission.code === permissionCode
      );

      if (!hasPermission) {
        unauthorizedResponse(res, `缺少权限: ${permissionCode}`);
        return;
      }

      next();
    } catch (error) {
      logger.error('权限验证失败', error);
      unauthorizedResponse(res, '权限验证失败');
    }
  };
};
