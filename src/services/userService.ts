import { User } from '@/models/User.js';
import type { IUser, CreateUserRequest, UpdateUserRequest, PaginationParams } from '@/types/index.js';
import { UserRole } from '@/types/index.js';
import { logger } from '@/utils/logger.js';

export class UserService {
  /**
   * 创建用户
   */
  static async createUser(userData: CreateUserRequest): Promise<IUser> {
    try {
      const user = new User(userData);
      await user.save();
      logger.info(`用户创建成功: ${user.username}`);
      return user;
    } catch (error) {
      logger.error('创建用户失败', error);
      throw error;
    }
  }

  /**
   * 根据ID查找用户
   */
  static async findUserById(id: string): Promise<IUser | null> {
    try {
      return await User.findById(id).select('+password');
    } catch (error) {
      logger.error('查找用户失败', error);
      throw error;
    }
  }

  /**
   * 根据用户名查找用户
   */
  static async findUserByUsername(username: string): Promise<IUser | null> {
    try {
      return await User.findOne({ username }).select('+password');
    } catch (error) {
      logger.error('查找用户失败', error);
      throw error;
    }
  }

  /**
   * 根据邮箱查找用户
   */
  static async findUserByEmail(email: string): Promise<IUser | null> {
    try {
      return await User.findOne({ email }).select('+password');
    } catch (error) {
      logger.error('查找用户失败', error);
      throw error;
    }
  }

  /**
   * 获取用户列表（分页）
   */
  static async getUsers(params: PaginationParams): Promise<{
    users: IUser[];
    total: number;
    pages: number;
  }> {
    try {
      const { page, limit, sort = 'createdAt', order = 'desc' } = params;
      const skip = (page - 1) * limit;

      const sortObj: any = {};
      sortObj[sort] = order === 'asc' ? 1 : -1;

      const [users, total] = await Promise.all([
        User.find()
          .sort(sortObj)
          .skip(skip)
          .limit(limit)
          .exec(),
        User.countDocuments(),
      ]);

      const pages = Math.ceil(total / limit);

      return { users, total, pages };
    } catch (error) {
      logger.error('获取用户列表失败', error);
      throw error;
    }
  }

  /**
   * 更新用户
   */
  static async updateUser(id: string, updateData: UpdateUserRequest): Promise<IUser | null> {
    try {
      const user = await User.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      
      if (user) {
        logger.info(`用户更新成功: ${user.username}`);
      }
      
      return user;
    } catch (error) {
      logger.error('更新用户失败', error);
      throw error;
    }
  }

  /**
   * 删除用户
   */
  static async deleteUser(id: string): Promise<boolean> {
    try {
      const result = await User.findByIdAndDelete(id);
      if (result) {
        logger.info(`用户删除成功: ${result.username}`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error('删除用户失败', error);
      throw error;
    }
  }

  /**
   * 更新最后登录时间
   */
  static async updateLastLogin(id: string): Promise<void> {
    try {
      await User.findByIdAndUpdate(id, { lastLoginAt: new Date() });
    } catch (error) {
      logger.error('更新最后登录时间失败', error);
      throw error;
    }
  }

  /**
   * 检查用户名是否存在
   */
  static async isUsernameExists(username: string, excludeId?: string): Promise<boolean> {
    try {
      const query: any = { username };
      if (excludeId) {
        query._id = { $ne: excludeId };
      }
      const user = await User.findOne(query);
      return !!user;
    } catch (error) {
      logger.error('检查用户名是否存在失败', error);
      throw error;
    }
  }

  /**
   * 检查邮箱是否存在
   */
  static async isEmailExists(email: string, excludeId?: string): Promise<boolean> {
    try {
      const query: any = { email };
      if (excludeId) {
        query._id = { $ne: excludeId };
      }
      const user = await User.findOne(query);
      return !!user;
    } catch (error) {
      logger.error('检查邮箱是否存在失败', error);
      throw error;
    }
  }

  /**
   * 创建超级管理员
   */
  static async createSuperAdmin(): Promise<IUser | null> {
    try {
      // 检查是否已存在超级管理员
      const existingSuperAdmin = await User.findOne({ role: 'SUPER_ADMIN' });
      if (existingSuperAdmin) {
        logger.info('超级管理员已存在');
        return existingSuperAdmin;
      }

      // 创建超级管理员
      const superAdminData: CreateUserRequest = {
        username: 'admin',
        email: 'admin@admin.com',
        password: 'admin123456',
        role: 'SUPER_ADMIN',
      };

      const superAdmin = await this.createUser(superAdminData);
      logger.info('超级管理员创建成功');
      return superAdmin;
    } catch (error) {
      logger.error('创建超级管理员失败', error);
      throw error;
    }
  }
}
