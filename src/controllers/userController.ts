import type { Response } from 'express';
import { UserService } from '@/services/userService.js';
import { successResponse, successPaginatedResponse, errorResponse, notFoundResponse } from '@/utils/response.js';
import { logger } from '@/utils/logger.js';
import type { AuthenticatedRequest, CreateUserRequest, UpdateUserRequest, PaginationParams } from '@/types/index.js';

export class UserController {
  /**
   * 获取用户列表
   */
  static async getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const params: PaginationParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sort: req.query.sort as string || 'createdAt',
        order: (req.query.order as 'asc' | 'desc') || 'desc',
      };

      const { users, total, pages } = await UserService.getUsers(params);
      
      successPaginatedResponse(res, users, {
        page: params.page,
        limit: params.limit,
        total,
        pages,
      }, '获取用户列表成功');
    } catch (error) {
      logger.error('获取用户列表失败', error);
      errorResponse(res, '获取用户列表失败', 500);
    }
  }

  /**
   * 根据ID获取用户
   */
  static async getUserById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await UserService.findUserById(id);
      
      if (!user) {
        notFoundResponse(res, '用户不存在');
        return;
      }

      successResponse(res, user, '获取用户信息成功');
    } catch (error) {
      logger.error('获取用户信息失败', error);
      errorResponse(res, '获取用户信息失败', 500);
    }
  }

  /**
   * 创建用户
   */
  static async createUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userData: CreateUserRequest = req.body;

      // 检查用户名是否已存在
      const isUsernameExists = await UserService.isUsernameExists(userData.username);
      if (isUsernameExists) {
        errorResponse(res, '用户名已存在', 400);
        return;
      }

      // 检查邮箱是否已存在
      const isEmailExists = await UserService.isEmailExists(userData.email);
      if (isEmailExists) {
        errorResponse(res, '邮箱已存在', 400);
        return;
      }

      const user = await UserService.createUser(userData);
      successResponse(res, user, '用户创建成功', 201);
    } catch (error) {
      logger.error('创建用户失败', error);
      errorResponse(res, '创建用户失败', 500);
    }
  }

  /**
   * 更新用户
   */
  static async updateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateUserRequest = req.body;

      // 检查用户是否存在
      const existingUser = await UserService.findUserById(id);
      if (!existingUser) {
        notFoundResponse(res, '用户不存在');
        return;
      }

      // 如果要更新用户名，检查是否已存在
      if (updateData.username && updateData.username !== existingUser.username) {
        const isUsernameExists = await UserService.isUsernameExists(updateData.username, id);
        if (isUsernameExists) {
          errorResponse(res, '用户名已存在', 400);
          return;
        }
      }

      // 如果要更新邮箱，检查是否已存在
      if (updateData.email && updateData.email !== existingUser.email) {
        const isEmailExists = await UserService.isEmailExists(updateData.email, id);
        if (isEmailExists) {
          errorResponse(res, '邮箱已存在', 400);
          return;
        }
      }

      const user = await UserService.updateUser(id, updateData);
      if (!user) {
        notFoundResponse(res, '用户不存在');
        return;
      }

      successResponse(res, user, '用户更新成功');
    } catch (error) {
      logger.error('更新用户失败', error);
      errorResponse(res, '更新用户失败', 500);
    }
  }

  /**
   * 删除用户
   */
  static async deleteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // 不能删除自己
      if (id === req.userId) {
        errorResponse(res, '不能删除自己的账户', 400);
        return;
      }

      const deleted = await UserService.deleteUser(id);
      if (!deleted) {
        notFoundResponse(res, '用户不存在');
        return;
      }

      successResponse(res, null, '用户删除成功');
    } catch (error) {
      logger.error('删除用户失败', error);
      errorResponse(res, '删除用户失败', 500);
    }
  }
}
