import App from './app.js';
import { logger } from '@/utils/logger.js';

// 创建应用实例
const app = new App();

// 优雅关闭处理
const gracefulShutdown = async (signal: string) => {
  logger.info(`收到 ${signal} 信号，开始优雅关闭...`);
  
  try {
    // 这里可以添加清理逻辑，比如关闭数据库连接等
    logger.info('服务已优雅关闭');
    process.exit(0);
  } catch (error) {
    logger.error('优雅关闭失败', error);
    process.exit(1);
  }
};

// 监听关闭信号
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  logger.error('未捕获的异常', error);
  process.exit(1);
});

// 处理未处理的 Promise 拒绝
process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的 Promise 拒绝', { reason, promise });
  process.exit(1);
});

// 启动应用
const startServer = async () => {
  try {
    // 初始化数据库
    await app.initializeDatabase();
    
    // 启动服务器
    app.start();
  } catch (error) {
    logger.error('服务器启动失败', error);
    process.exit(1);
  }
};

// 启动服务器
startServer();
