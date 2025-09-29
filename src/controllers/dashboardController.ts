import type { Response } from 'express';
import { DashboardService } from '../services/dashboardService.js';
import { successResponse, errorResponse } from '@/utils/response.js';
import { logger } from '@/utils/logger.js';
import type { AuthenticatedRequest } from '@/types/index.js';

export class DashboardController {
  /**
   * 获取仪表盘统计数据
   */
  static async getStats(req: AuthenticatedRequest, res: Response) {
    try {
      const stats = await DashboardService.getStats();
      successResponse(res, stats, '获取统计数据成功');
    } catch (error) {
      logger.error('获取统计数据失败', error);
      errorResponse(res, '获取统计数据失败', 500);
    }
  }

  /**
   * 获取系统状态信息
   */
  static async getSystemStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const status = await DashboardService.getSystemStatus();
      successResponse(res, status, '获取系统状态成功');
    } catch (error) {
      logger.error('获取系统状态失败', error);
      errorResponse(res, '获取系统状态失败', 500);
    }
  }

  /**
   * 获取最近活动记录
   */
  static async getRecentActivities(req: AuthenticatedRequest, res: Response) {
    try {
      const { limit = 10 } = req.query;
      const activities = await DashboardService.getRecentActivities(Number(limit));
      successResponse(res, activities, '获取最近活动成功');
    } catch (error) {
      logger.error('获取最近活动失败', error);
      errorResponse(res, '获取最近活动失败', 500);
    }
  }

  /**
   * 获取访问趋势数据
   */
  static async getAccessTrend(req: AuthenticatedRequest, res: Response) {
    try {
      const { range = '7d' } = req.query;
      const trend = await DashboardService.getAccessTrend(range as string);
      successResponse(res, trend, '获取访问趋势成功');
    } catch (error) {
      logger.error('获取访问趋势失败', error);
      errorResponse(res, '获取访问趋势失败', 500);
    }
  }

  /**
   * 获取用户信息
   */
  static async getUserInfo(req: AuthenticatedRequest, res: Response) {
    try {
      const userInfo = await DashboardService.getUserInfo(req.user!);
      successResponse(res, userInfo, '获取用户信息成功');
    } catch (error) {
      logger.error('获取用户信息失败', error);
      errorResponse(res, '获取用户信息失败', 500);
    }
  }
}
