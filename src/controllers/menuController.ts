import type { Response } from 'express';
import { MenuService } from '@/services/menuService.js';
import { successResponse, successPaginatedResponse, errorResponse, notFoundResponse } from '@/utils/response.js';
import { logger } from '@/utils/logger.js';
import type { AuthenticatedRequest, PaginationParams } from '@/types/index.js';
import { UserRole } from '@/types/index.js';

export class MenuController {
  static async list(req: AuthenticatedRequest, res: Response) {
    try {
      const params: PaginationParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 50,
        sort: (req.query.sort as string) || 'order',
        order: (req.query.order as 'asc' | 'desc') || 'asc',
      };
      const { items, total, pages } = await MenuService.list(params);
      successPaginatedResponse(res, items, { page: params.page, limit: params.limit, total, pages }, '获取菜单列表成功');
    } catch (error) {
      logger.error('获取菜单列表失败', error);
      errorResponse(res, '获取菜单列表失败', 500);
    }
  }

  static async tree(_req: AuthenticatedRequest, res: Response) {
    try {
      const items = await MenuService.tree();
      successResponse(res, items, '获取菜单树成功');
    } catch (error) {
      logger.error('获取菜单树失败', error);
      errorResponse(res, '获取菜单树失败', 500);
    }
  }

  static async myMenus(req: AuthenticatedRequest, res: Response) {
    try {
      const role = (req.user?.role as UserRole) || UserRole.USER;
      const items = await MenuService.treeForUser(role);
      successResponse(res, items, '获取用户菜单成功');
    } catch (error) {
      logger.error('获取用户菜单失败', error);
      errorResponse(res, '获取用户菜单失败', 500);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const item = await MenuService.getById(req.params.id);
      if (!item) return notFoundResponse(res, '菜单不存在');
      successResponse(res, item, '获取菜单成功');
    } catch (error) {
      logger.error('获取菜单失败', error);
      errorResponse(res, '获取菜单失败', 500);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response) {
    try {
      const item = await MenuService.create(req.body);
      successResponse(res, item, '创建菜单成功', 201);
    } catch (error) {
      logger.error('创建菜单失败', error);
      errorResponse(res, '创建菜单失败', 500);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const exists = await MenuService.getById(id);
      if (!exists) return notFoundResponse(res, '菜单不存在');
      const item = await MenuService.update(id, req.body);
      successResponse(res, item, '更新菜单成功');
    } catch (error) {
      logger.error('更新菜单失败', error);
      errorResponse(res, '更新菜单失败', 500);
    }
  }

  static async remove(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const ok = await MenuService.remove(id);
      if (!ok) return notFoundResponse(res, '菜单不存在');
      successResponse(res, null, '删除菜单成功');
    } catch (error) {
      logger.error('删除菜单失败', error);
      errorResponse(res, '删除菜单失败', 500);
    }
  }

  static async sync(req: AuthenticatedRequest, res: Response) {
    try {
      const items = req.body?.items || [];
      const tree = await MenuService.syncMenus(items as any[]);
      successResponse(res, tree, '菜单同步成功');
    } catch (error) {
      logger.error('菜单同步失败', error);
      errorResponse(res, '菜单同步失败', 500);
    }
  }
}


