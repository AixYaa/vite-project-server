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

// 友好权限名称兜底映射（当数据库中未找到名称时使用）
const FRIENDLY_PERMISSION_NAME: Record<string, string> = {
  'user:view': '查看用户',
  'user:create': '创建用户',
  'user:edit': '编辑用户',
  'user:delete': '删除用户',
  'role:view': '查看角色',
  'role:create': '创建角色',
  'role:edit': '编辑角色',
  'role:delete': '删除角色',
  'menu:view': '查看菜单',
  'menu:create': '创建菜单',
  'menu:edit': '编辑菜单',
  'menu:delete': '删除菜单',
  'permission:view': '查看权限',
  'permission:create': '创建权限',
  'permission:edit': '编辑权限',
  'permission:delete': '删除权限',
  'dashboard:view': '查看仪表盘',
  'operationLog:view': '查看操作日志',
  'operationLog:delete': '清理操作日志',
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
        try {
          const { Permission } = await import('@/models/Permission.js');
          const p = await Permission.findOne({ code: permissionCode }).lean();
          const friendly = p?.name || FRIENDLY_PERMISSION_NAME[permissionCode] || permissionCode;
          unauthorizedResponse(res, `缺少权限: ${friendly}${friendly === permissionCode ? '' : ` (${permissionCode})`}`);
        } catch (e) {
          const friendly = FRIENDLY_PERMISSION_NAME[permissionCode] || permissionCode;
          unauthorizedResponse(res, `缺少权限: ${friendly}${friendly === permissionCode ? '' : ` (${permissionCode})`}`);
        }
        return;
      }

      next();
    } catch (error) {
      logger.error('权限验证失败', error);
      unauthorizedResponse(res, '权限验证失败');
    }
  };
};
