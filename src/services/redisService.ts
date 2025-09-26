import type { RedisClientType } from 'redis';
import { logger } from '@/utils/logger.js';

export class RedisService {
  private client: RedisClientType;

  constructor(client: RedisClientType) {
    this.client = client;
  }

  /**
   * 设置键值对
   */
  async set(key: string, value: string, expireInSeconds?: number): Promise<void> {
    try {
      if (expireInSeconds) {
        await this.client.setEx(key, expireInSeconds, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      logger.error('Redis SET 操作失败', { key, error });
      throw error;
    }
  }

  /**
   * 获取值
   */
  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error('Redis GET 操作失败', { key, error });
      throw error;
    }
  }

  /**
   * 删除键
   */
  async del(key: string): Promise<number> {
    try {
      return await this.client.del(key);
    } catch (error) {
      logger.error('Redis DEL 操作失败', { key, error });
      throw error;
    }
  }

  /**
   * 检查键是否存在
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis EXISTS 操作失败', { key, error });
      throw error;
    }
  }

  /**
   * 设置过期时间
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const result = await this.client.expire(key, seconds);
      return result;
    } catch (error) {
      logger.error('Redis EXPIRE 操作失败', { key, seconds, error });
      throw error;
    }
  }

  /**
   * 获取剩余过期时间
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      logger.error('Redis TTL 操作失败', { key, error });
      throw error;
    }
  }

  /**
   * 存储用户会话信息
   */
  async setUserSession(userId: string, sessionData: any, expireInSeconds: number = 7 * 24 * 60 * 60): Promise<void> {
    const key = `user:session:${userId}`;
    await this.set(key, JSON.stringify(sessionData), expireInSeconds);
  }

  /**
   * 获取用户会话信息
   */
  async getUserSession(userId: string): Promise<any | null> {
    const key = `user:session:${userId}`;
    const data = await this.get(key);
    return data ? JSON.parse(data) : null;
  }

  /**
   * 删除用户会话
   */
  async deleteUserSession(userId: string): Promise<void> {
    const key = `user:session:${userId}`;
    await this.del(key);
  }

  /**
   * 存储刷新令牌
   */
  async setRefreshToken(userId: string, refreshToken: string, expireInSeconds: number = 30 * 24 * 60 * 60): Promise<void> {
    const key = `user:refresh_token:${userId}`;
    await this.set(key, refreshToken, expireInSeconds);
  }

  /**
   * 获取刷新令牌
   */
  async getRefreshToken(userId: string): Promise<string | null> {
    const key = `user:refresh_token:${userId}`;
    return await this.get(key);
  }

  /**
   * 删除刷新令牌
   */
  async deleteRefreshToken(userId: string): Promise<void> {
    const key = `user:refresh_token:${userId}`;
    await this.del(key);
  }

  /**
   * 存储令牌黑名单
   */
  async addToBlacklist(token: string, expireInSeconds: number): Promise<void> {
    const key = `blacklist:token:${token}`;
    await this.set(key, '1', expireInSeconds);
  }

  /**
   * 检查令牌是否在黑名单中
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    const key = `blacklist:token:${token}`;
    return await this.exists(key);
  }

  /**
   * 清理可能存在的历史/遗留 token 相关键
   * - token:<jwt>
   * - <jwt>
   */
  async cleanupTokenArtifacts(token: string): Promise<void> {
    try {
      const legacyKeys = [`token:${token}`, token];
      for (const k of legacyKeys) {
        try {
          await this.del(k);
        } catch (_) {
          // ignore single key errors
        }
      }
    } catch (error) {
      logger.error('清理历史 token 键失败', { error });
    }
  }

  /**
   * 关闭连接
   */
  async close(): Promise<void> {
    try {
      await this.client.quit();
      logger.info('Redis 连接已关闭');
    } catch (error) {
      logger.error('关闭 Redis 连接失败', error);
    }
  }
}
