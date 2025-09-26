import { UserService } from './userService.js';
import { RedisService } from './redisService.js';
import { generateAccessToken, generateRefreshToken, verifyToken } from '@/utils/jwt.js';
import type { LoginRequest, LoginResponse, IUser } from '@/types/index.js';
import { UserRole } from '@/types/index.js';
import { logger } from '@/utils/logger.js';
import { config } from '@/config/index.js';

export class AuthService {
  private static redisService: RedisService | null = null;

  static setRedisService(redisService: RedisService): void {
    this.redisService = redisService;
  }

  /**
   * 用户登录
   */
  static async login(loginData: LoginRequest): Promise<LoginResponse> {
    try {
      const { username, password } = loginData;

      // 查找用户（支持用户名或邮箱登录）
      let user = await UserService.findUserByUsername(username);
      if (!user) {
        user = await UserService.findUserByEmail(username);
      }

      if (!user) {
        throw new Error('用户名或密码错误');
      }

      if (!user.isActive) {
        throw new Error('账户已被禁用');
      }

      // 验证密码
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new Error('用户名或密码错误');
      }

      // 更新最后登录时间
      await UserService.updateLastLogin(user._id);

      // 生成令牌
      const tokenPayload = {
        userId: user._id,
        username: user.username,
        role: user.role,
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      // 存储会话信息到 Redis
      if (this.redisService) {
        const sessionData = {
          userId: user._id,
          username: user.username,
          role: user.role,
          loginTime: new Date().toISOString(),
        };
        
        // 存储会话信息（7天过期）
        await this.redisService.setUserSession(user._id, sessionData, 7 * 24 * 60 * 60);
        
        // 存储刷新令牌（30天过期）
        await this.redisService.setRefreshToken(user._id, refreshToken, 30 * 24 * 60 * 60);
      }

      logger.info(`用户登录成功: ${user.username}`);

      return {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          ...(user.avatar && { avatar: user.avatar }),
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error('用户登录失败', error);
      throw error;
    }
  }

  /**
   * 刷新令牌
   */
  static async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      // 验证刷新令牌
      const payload = verifyToken(refreshToken);

      // 查找用户
      const user = await UserService.findUserById(payload.userId);
      if (!user || !user.isActive) {
        throw new Error('用户不存在或已被禁用');
      }

      // 检查 Redis 中的刷新令牌
      if (this.redisService) {
        const storedRefreshToken = await this.redisService.getRefreshToken(user._id);
        if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
          throw new Error('无效的刷新令牌');
        }
      }

      // 生成新的访问令牌
      const tokenPayload = {
        userId: user._id,
        username: user.username,
        role: user.role,
      };

      const accessToken = generateAccessToken(tokenPayload);

      logger.info(`令牌刷新成功: ${user.username}`);

      return { accessToken };
    } catch (error) {
      logger.error('令牌刷新失败', error);
      throw error;
    }
  }

  /**
   * 验证令牌
   */
  static async validateToken(token: string): Promise<IUser> {
    try {
      const payload = verifyToken(token);

      const user = await UserService.findUserById(payload.userId);
      if (!user || !user.isActive) {
        throw new Error('用户不存在或已被禁用');
      }

      return user;
    } catch (error) {
      logger.error('令牌验证失败', error);
      throw error;
    }
  }

  /**
   * 登出
   */
  static async logout(userId: string, accessToken?: string): Promise<void> {
    try {
      if (this.redisService) {
        // 删除用户会话
        await this.redisService.deleteUserSession(userId);
        
        // 删除刷新令牌
        await this.redisService.deleteRefreshToken(userId);
        
        // 将访问令牌加入黑名单（如果提供）
        if (accessToken) {
          const payload = verifyToken(accessToken);
          const expireInSeconds = payload.exp ? payload.exp - Math.floor(Date.now() / 1000) : 3600;
          await this.redisService.addToBlacklist(accessToken, expireInSeconds);
          // 清理遗留 token 键
          await this.redisService.cleanupTokenArtifacts(accessToken);
        }
      }
      
      logger.info(`用户登出: ${userId}`);
    } catch (error) {
      logger.error('用户登出失败', error);
      throw error;
    }
  }
}
