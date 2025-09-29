import type { Response } from 'express';
import { PermissionService } from '@/services/permissionService.js';
import { successResponse, successPaginatedResponse, errorResponse, notFoundResponse } from '@/utils/response.js';
import { logger } from '@/utils/logger.js';
import type { AuthenticatedRequest, PaginationParams } from '@/types/index.js';

export class PermissionController {
  static async list(req: AuthenticatedRequest, res: Response) {
    try {
      const params: PaginationParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sort: (req.query.sort as string) || 'createdAt',
        order: (req.query.order as 'asc' | 'desc') || 'desc',
      };
      const { items, total, pages } = await PermissionService.list(params);
      successPaginatedResponse(res, items, { page: params.page, limit: params.limit, total, pages }, '获取权限列表成功');
    } catch (error) {
      logger.error('获取权限列表失败', error);
      errorResponse(res, '获取权限列表失败', 500);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const item = await PermissionService.getById(id);
      if (!item) return notFoundResponse(res, '权限不存在');
      successResponse(res, item, '获取权限成功');
    } catch (error) {
      logger.error('获取权限失败', error);
      errorResponse(res, '获取权限失败', 500);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response) {
    try {
      const { name, code, description } = req.body as any;
      if (await PermissionService.isNameExists(name)) return errorResponse(res, '权限名称已存在', 400);
      if (await PermissionService.isCodeExists(code)) return errorResponse(res, '权限编码已存在', 400);
      const item = await PermissionService.create({ name, code, description });
      successResponse(res, item, '创建权限成功', 201);
    } catch (error) {
      logger.error('创建权限失败', error);
      errorResponse(res, '创建权限失败', 500);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const exists = await PermissionService.getById(id);
      if (!exists) return notFoundResponse(res, '权限不存在');

      const { name, code } = req.body as any;
      if (name && (await PermissionService.isNameExists(name, id))) return errorResponse(res, '权限名称已存在', 400);
      if (code && (await PermissionService.isCodeExists(code, id))) return errorResponse(res, '权限编码已存在', 400);

      const item = await PermissionService.update(id, req.body);
      successResponse(res, item, '更新权限成功');
    } catch (error) {
      logger.error('更新权限失败', error);
      errorResponse(res, '更新权限失败', 500);
    }
  }

  static async remove(req: AuthenticatedRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const ok = await PermissionService.remove(id);
      if (!ok) return notFoundResponse(res, '权限不存在');
      successResponse(res, null, '删除权限成功');
    } catch (error) {
      logger.error('删除权限失败', error);
      errorResponse(res, '删除权限失败', 500);
    }
  }

  static async tree(_req: AuthenticatedRequest, res: Response) {
    try {
      const tree = await PermissionService.tree();
      successResponse(res, tree, '获取权限树成功');
    } catch (error) {
      logger.error('获取权限树失败', error);
      errorResponse(res, '获取权限树失败', 500);
    }
  }
}


