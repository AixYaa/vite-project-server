import { User } from '@/models/User.js';
import { Role } from '@/models/Role.js';
import { Menu } from '@/models/Menu.js';
import { Permission } from '@/models/Permission.js';
import { SystemMonitorService } from './systemMonitorService.js';
import { OperationLogService } from './operationLogService.js';
import type { IUser } from '@/types/index.js';

export class DashboardService {
  /**
   * 获取统计数据
   */
  static async getStats() {
    try {
      const [userCount, roleCount, menuCount, permissionCount] = await Promise.all([
        User.countDocuments(),
        Role.countDocuments(),
        Menu.countDocuments(),
        Permission.countDocuments()
      ]);

      // 获取最近7天的用户增长数据
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentUserCount = await User.countDocuments({
        createdAt: { $gte: sevenDaysAgo }
      });

      // 计算变化百分比
      const userChangePercent = userCount > 0 ? 
        Math.round((recentUserCount / userCount) * 100) : 0;

      return {
        users: {
          total: userCount,
          change: `+${userChangePercent}%`,
          changeType: userChangePercent >= 0 ? 'positive' : 'negative'
        },
        roles: {
          total: roleCount,
          change: `+${Math.floor(Math.random() * 5)}`,
          changeType: 'positive'
        },
        menus: {
          total: menuCount,
          change: `+${Math.floor(Math.random() * 3)}`,
          changeType: 'positive'
        },
        permissions: {
          total: permissionCount,
          change: `+${Math.floor(Math.random() * 8)}`,
          changeType: 'positive'
        }
      };
    } catch (error) {
      throw new Error('获取统计数据失败');
    }
  }

  /**
   * 获取系统状态
   */
  static async getSystemStatus() {
    try {
      return await SystemMonitorService.getSystemStatus();
    } catch (error) {
      console.error('获取系统状态失败:', error);
      throw new Error('获取系统状态失败');
    }
  }

  /**
   * 获取最近活动记录
   */
  static async getRecentActivities(limit: number = 10) {
    try {
      return await OperationLogService.getRecentActivities(limit);
    } catch (error) {
      console.error('获取最近活动失败:', error);
      // 如果获取失败，返回空数组而不是抛出错误
      return [];
    }
  }

  /**
   * 获取访问趋势数据
   */
  static async getAccessTrend(range: string = '7d') {
    try {
      // 将范围转换为天数
      let days = 7;
      if (range === '30d') days = 30;
      if (range === '90d') days = 90;

      const endDate = new Date();
      // 设定到当天末尾，确保包含今天
      endDate.setHours(23, 59, 59, 999);
      const startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - (days - 1));
      startDate.setHours(0, 0, 0, 0);

      // 从操作日志聚合真实的访问趋势
      const { OperationLog } = await import('@/models/OperationLog.js');

      const agg = await OperationLog.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        // 规范化为 yyyy-MM-dd 字符串
        {
          $project: {
            dateStr: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            userId: 1,
            method: 1,
          },
        },
        {
          $group: {
            _id: '$dateStr',
            visits: { $sum: 1 }, // 总请求次数
            usersSet: { $addToSet: '$userId' }, // 去重用户ID
            pageViews: {
              $sum: {
                $cond: [{ $eq: ['$method', 'GET'] }, 1, 0],
              },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // 将聚合结果映射为按天全量数组，缺失日期补0
      const dateToData: Record<string, { visits: number; users: number; pageViews: number }> = {};
      for (const row of agg as any[]) {
        const key: string = String(row?._id ?? '');
        if (!key) continue;
        const usersSet: any[] = Array.isArray(row?.usersSet) ? row.usersSet : [];
        dateToData[key] = {
          visits: Number(row?.visits) || 0,
          users: usersSet.filter(Boolean).length,
          pageViews: Number(row?.pageViews) || 0,
        };
      }

      const result: Array<{ date: string; visits: number; users: number; pageViews: number }> = [];
      const cursor = new Date(startDate);
      while (cursor <= endDate) {
        const dateStr = cursor.toISOString().split('T')[0];
        const d = dateToData[dateStr] || { visits: 0, users: 0, pageViews: 0 };
        result.push({ date: dateStr, visits: d.visits, users: d.users, pageViews: d.pageViews });
        cursor.setDate(cursor.getDate() - 0 + 1);
      }

      return {
        range,
        data: result,
      };
    } catch (error) {
      // 出错时返回空数据，避免前端报错
      return { range, data: [] };
    }
  }

  /**
   * 获取用户信息
   */
  static async getUserInfo(user: IUser) {
    try {
      return {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar || '',
        lastLoginAt: user.lastLoginAt,
        isActive: user.isActive
      };
    } catch (error) {
      throw new Error('获取用户信息失败');
    }
  }
}
