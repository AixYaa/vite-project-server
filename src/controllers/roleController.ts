import type { Response } from 'express';
import { RoleService } from '@/services/roleService.js';
import { successResponse, successPaginatedResponse, errorResponse, notFoundResponse } from '@/utils/response.js';
import { logger } from '@/utils/logger.js';
import type { AuthenticatedRequest, PaginationParams } from '@/types/index.js';

export class RoleController {
  static async list(req: AuthenticatedRequest, res: Response) {
    try {
      const params: PaginationParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sort: (req.query.sort as string) || 'createdAt',
        order: (req.query.order as 'asc' | 'desc') || 'desc',
      };
      const { items, total, pages } = await RoleService.list(params);
      successPaginatedResponse(res, items, { page: params.page, limit: params.limit, total, pages }, '获取角色列表成功');
    } catch (error) {
      logger.error('获取角色列表失败', error);
      errorResponse(res, '获取角色列表失败', 500);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const item = await RoleService.getById(id);
      if (!item) return notFoundResponse(res, '角色不存在');
      successResponse(res, item, '获取角色成功');
    } catch (error) {
      logger.error('获取角色失败', error);
      errorResponse(res, '获取角色失败', 500);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response) {
    try {
      const { name, code } = req.body as any;
      if (await RoleService.isNameExists(name)) return errorResponse(res, '角色名称已存在', 400);
      if (await RoleService.isCodeExists(code)) return errorResponse(res, '角色编码已存在', 400);
      const item = await RoleService.create(req.body);
      successResponse(res, item, '创建角色成功', 201);
    } catch (error) {
      logger.error('创建角色失败', error);
      errorResponse(res, '创建角色失败', 500);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const exists = await RoleService.getById(id);
      if (!exists) return notFoundResponse(res, '角色不存在');

      const { name, code } = req.body as any;
      if (name && (await RoleService.isNameExists(name, id))) return errorResponse(res, '角色名称已存在', 400);
      if (code && (await RoleService.isCodeExists(code, id))) return errorResponse(res, '角色编码已存在', 400);

      const item = await RoleService.update(id, req.body);
      successResponse(res, item, '更新角色成功');
    } catch (error) {
      logger.error('更新角色失败', error);
      errorResponse(res, '更新角色失败', 500);
    }
  }

  static async remove(req: AuthenticatedRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const ok = await RoleService.remove(id);
      if (!ok) return notFoundResponse(res, '角色不存在');
      successResponse(res, null, '删除角色成功');
    } catch (error) {
      logger.error('删除角色失败', error);
      errorResponse(res, '删除角色失败', 500);
    }
  }

  // -------- API Keys --------
  static async listApiKeys(req: AuthenticatedRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const keys = await RoleService.listApiKeys(id);
      successResponse(res, keys, '获取API密钥列表成功');
    } catch (error) {
      logger.error('获取API密钥列表失败', error);
      errorResponse(res, '获取API密钥列表失败', 500);
    }
  }

  static async generateApiKey(req: AuthenticatedRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const { remark = '' } = (req.body || {}) as any;
      const result = await RoleService.generateApiKey(id, remark);
      // 仅本次返回明文 secret
      successResponse(res, result, '生成API密钥成功');
    } catch (error) {
      logger.error('生成API密钥失败', error);
      errorResponse(res, '生成API密钥失败', 500);
    }
  }

  static async toggleApiKey(req: AuthenticatedRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const { key, isActive } = (req.body || {}) as any;
      if (!key) return errorResponse(res, '缺少参数key', 400);
      await RoleService.toggleApiKey(id, key, Boolean(isActive));
      successResponse(res, null, '更新API密钥状态成功');
    } catch (error) {
      logger.error('更新API密钥状态失败', error);
      errorResponse(res, '更新API密钥状态失败', 500);
    }
  }

  static async revokeApiKey(req: AuthenticatedRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const key = req.params.key as string;
      const ok = await RoleService.revokeApiKey(id, key);
      if (!ok) return errorResponse(res, '密钥不存在', 404);
      successResponse(res, null, '撤销API密钥成功');
    } catch (error) {
      logger.error('撤销API密钥失败', error);
      errorResponse(res, '撤销API密钥失败', 500);
    }
  }
}


