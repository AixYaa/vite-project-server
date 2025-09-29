import type { Request, Response } from 'express';
import { AuthService } from '@/services/authService.js';
import { successResponse, errorResponse } from '@/utils/response.js';
import { logger } from '@/utils/logger.js';
import type { LoginRequest, AuthenticatedRequest, UpdateUserRequest } from '@/types/index.js';
import { UserService } from '@/services/userService.js';

export class AuthController {
  /**
   * 用户登录
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const loginData: LoginRequest = req.body;
      const result = await AuthService.login(loginData);
      successResponse(res, result, '登录成功');
    } catch (error) {
      logger.error('登录失败', error);
      errorResponse(res, (error as Error).message, 401);
    }
  }

  /**
   * 刷新令牌
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const result = await AuthService.refreshToken(refreshToken);
      successResponse(res, result, '令牌刷新成功');
    } catch (error) {
      logger.error('令牌刷新失败', error);
      errorResponse(res, (error as Error).message, 401);
    }
  }

  /**
   * 获取用户信息
   */
  static async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      successResponse(res, {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }, '获取用户信息成功');
    } catch (error) {
      logger.error('获取用户信息失败', error);
      errorResponse(res, '获取用户信息失败', 500);
    }
  }

  /**
   * 用户登出
   */
  static async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const authHeader = req.headers.authorization;
      const accessToken = authHeader ? authHeader.split(' ')[1] : undefined;
      
      await AuthService.logout(userId, accessToken);
      successResponse(res, null, '登出成功');
    } catch (error) {
      logger.error('登出失败', error);
      errorResponse(res, '登出失败', 500);
    }
  }

  /**
   * 更新当前用户资料
   */
  static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const updateData: UpdateUserRequest = req.body;

      // 不允许通过该接口修改角色和状态
      if (updateData.role) delete (updateData as any).role;
      if (typeof (updateData as any).isActive !== 'undefined') delete (updateData as any).isActive;

      // 如果要更新用户名或邮箱需要做唯一性校验
      if (updateData.username) {
        const exists = await UserService.isUsernameExists(updateData.username, userId);
        if (exists) {
          errorResponse(res, '用户名已存在', 400);
          return;
        }
      }
      if (updateData.email) {
        const exists = await UserService.isEmailExists(updateData.email, userId);
        if (exists) {
          errorResponse(res, '邮箱已存在', 400);
          return;
        }
      }

      const user = await UserService.updateUser(userId, updateData);
      if (!user) {
        errorResponse(res, '用户不存在', 404);
        return;
      }

      successResponse(res, {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }, '资料更新成功');
    } catch (error) {
      logger.error('更新用户资料失败', error);
      errorResponse(res, '更新用户资料失败', 500);
    }
  }
}
