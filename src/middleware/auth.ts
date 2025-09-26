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

    if (!roles.includes(req.user.role)) {
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
