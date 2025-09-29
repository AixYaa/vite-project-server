import { OperationLog } from '../models/OperationLog.js';
import type { IOperationLog } from '../models/OperationLog.js';

export class OperationLogService {
  /**
   * 记录操作日志
   */
  static async logOperation(logData: {
    userId: string;
    username: string;
    action: string;
    resource: string;
    resourceId?: string;
    method: string;
    url: string;
    ip: string;
    userAgent: string;
    status: 'success' | 'failed';
    errorMessage?: string;
    duration: number;
  }) {
    try {
      const log = new OperationLog(logData);
      await log.save();
      return log;
    } catch (error) {
      console.error('记录操作日志失败:', error);
      throw error;
    }
  }

  /**
   * 获取最近活动记录
   */
  static async getRecentActivities(limit: number = 10) {
    try {
      // 排除“查看”类操作，不在最近活动中展示
      const activities = await OperationLog.find({ action: { $ne: 'view' } })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      return activities.map(activity => ({
        action: this.formatAction(activity.action),
        user: activity.username,
        time: this.formatTime(activity.createdAt),
        status: activity.status === 'success' ? '成功' : '失败',
        resource: activity.resource,
        method: activity.method,
        url: activity.url,
        duration: activity.duration,
        errorMessage: activity.errorMessage
      }));
    } catch (error) {
      console.error('获取最近活动失败:', error);
      throw error;
    }
  }

  /**
   * 获取操作统计
   */
  static async getOperationStats(days: number = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const [totalOps, successOps, failedOps, topActions] = await Promise.all([
        OperationLog.countDocuments({ createdAt: { $gte: startDate } }),
        OperationLog.countDocuments({ 
          createdAt: { $gte: startDate },
          status: 'success'
        }),
        OperationLog.countDocuments({ 
          createdAt: { $gte: startDate },
          status: 'failed'
        }),
        OperationLog.aggregate([
          { $match: { createdAt: { $gte: startDate } } },
          { $group: { _id: '$action', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 }
        ])
      ]);

      return {
        total: totalOps,
        success: successOps,
        failed: failedOps,
        successRate: totalOps > 0 ? Math.round((successOps / totalOps) * 100) : 0,
        topActions: topActions.map(item => ({
          action: this.formatAction(item._id),
          count: item.count
        }))
      };
    } catch (error) {
      console.error('获取操作统计失败:', error);
      throw error;
    }
  }

  /**
   * 清理过期日志
   */
  static async cleanExpiredLogs() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const result = await OperationLog.deleteMany({
        createdAt: { $lt: thirtyDaysAgo }
      });
      
      return result.deletedCount;
    } catch (error) {
      console.error('清理过期日志失败:', error);
      throw error;
    }
  }

  /**
   * 格式化操作名称
   */
  private static formatAction(action: string): string {
    const actionMap: Record<string, string> = {
      'create': '创建',
      'update': '更新',
      'delete': '删除',
      'view': '查看',
      'login': '登录',
      'logout': '登出',
      'assign': '分配',
      'remove': '移除',
      'export': '导出',
      'import': '导入',
      'download': '下载',
      'upload': '上传'
    };

    return actionMap[action] || action;
  }

  /**
   * 格式化时间
   */
  private static formatTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    
    return date.toLocaleDateString('zh-CN');
  }
}
