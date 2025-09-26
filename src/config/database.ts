import mongoose from 'mongoose';
import { createClient } from 'redis';
import { config } from './index';

// MongoDB 连接
export const connectMongoDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log('✅ MongoDB 连接成功');
  } catch (error) {
    console.error('❌ MongoDB 连接失败:', error);
    process.exit(1);
  }
};

// Redis 连接
export const connectRedis = async () => {
  try {
    const client = createClient({
      socket: {
        host: config.redis.host,
        port: config.redis.port,
      },
      ...(config.redis.password && { password: config.redis.password }),
      database: config.redis.db,
    });

    client.on('error', (err) => {
      console.error('❌ Redis 连接错误:', err);
    });

    client.on('connect', () => {
      console.log('✅ Redis 连接成功');
    });

    await client.connect();
    return client;
  } catch (error) {
    console.error('❌ Redis 连接失败:', error);
    process.exit(1);
  }
};

// 优雅关闭数据库连接
export const closeConnections = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB 连接已关闭');
  } catch (error) {
    console.error('❌ 关闭 MongoDB 连接时出错:', error);
  }
};
