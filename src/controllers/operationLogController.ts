import type { Response } from 'express';
import { OperationLogService } from '../services/operationLogService.js';
import { successResponse, successPaginatedResponse, errorResponse } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import type { AuthenticatedRequest, PaginationParams } from '../types/index.js';

export class OperationLogController {
  /**
   * 获取操作日志列表
   */
  static async list(req: AuthenticatedRequest, res: Response) {
    try {
      const params: PaginationParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        sort: (req.query.sort as string) || 'createdAt',
        order: (req.query.order as 'asc' | 'desc') || 'desc',
      };

      const { action, status, userId, startDate, endDate } = req.query;

      // 构建查询条件
      const filter: any = {};
      if (action) filter.action = action;
      if (status) filter.status = status;
      if (userId) filter.userId = userId;
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate as string);
        if (endDate) filter.createdAt.$lte = new Date(endDate as string);
      }

      const { OperationLog } = await import('../models/OperationLog.js');
      const skip = (params.page - 1) * params.limit;
      
      const [items, total] = await Promise.all([
        OperationLog.find(filter)
          .sort({ [params.sort]: params.order === 'asc' ? 1 : -1 })
          .skip(skip)
          .limit(params.limit)
          .lean(),
        OperationLog.countDocuments(filter)
      ]);

      const pages = Math.ceil(total / params.limit);
      
      successPaginatedResponse(res, items, { 
        page: params.page, 
        limit: params.limit, 
        total, 
        pages 
      }, '获取操作日志成功');
    } catch (error) {
      logger.error('获取操作日志失败', error);
      errorResponse(res, '获取操作日志失败', 500);
    }
  }

  /**
   * 获取操作统计
   */
  static async getStats(req: AuthenticatedRequest, res: Response) {
    try {
      const { days = 7 } = req.query;
      const stats = await OperationLogService.getOperationStats(Number(days));
      successResponse(res, stats, '获取操作统计成功');
    } catch (error) {
      logger.error('获取操作统计失败', error);
      errorResponse(res, '获取操作统计失败', 500);
    }
  }

  /**
   * 清理过期日志
   */
  static async cleanup(req: AuthenticatedRequest, res: Response) {
    try {
      const deletedCount = await OperationLogService.cleanExpiredLogs();
      successResponse(res, { deletedCount }, '清理过期日志成功');
    } catch (error) {
      logger.error('清理过期日志失败', error);
      errorResponse(res, '清理过期日志失败', 500);
    }
  }
}
