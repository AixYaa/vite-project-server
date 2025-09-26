import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { config } from '@/config/index.js';
import { connectMongoDB, connectRedis } from '@/config/database.js';
import { generalLimiter } from '@/middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from '@/middleware/errorHandler.js';
import { setRedisService } from '@/middleware/auth.js';
import { logger } from '@/utils/logger.js';
import routes from '@/routes/index.js';
import { UserService } from '@/services/userService.js';
import { AuthService } from '@/services/authService.js';
import { RedisService } from '@/services/redisService.js';

class App {
  public app: express.Application;
  private redisClient: any;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // 安全中间件
    this.app.use(helmet());
    
    // CORS 配置
    this.app.use(cors({
      origin: config.cors.origin,
      credentials: true,
    }));

    // 压缩响应
    this.app.use(compression());

    // 请求日志
    this.app.use(morgan('combined', {
      stream: {
        write: (message: string) => logger.info(message.trim()),
      },
    }));

    // 解析请求体
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // 限流
    this.app.use(generalLimiter);
  }

  private initializeRoutes(): void {
    // API 路由
    this.app.use('/api', routes);

    // 根路径
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: '管理系统后端API服务',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      });
    });
  }

  private initializeErrorHandling(): void {
    // 404 处理
    this.app.use(notFoundHandler);
    
    // 全局错误处理
    this.app.use(errorHandler);
  }

  public async initializeDatabase(): Promise<void> {
    try {
      // 连接 MongoDB
      await connectMongoDB();
      
      // 连接 Redis
      this.redisClient = await connectRedis();
      
      // 初始化 Redis 服务
      const redisService = new RedisService(this.redisClient);
      AuthService.setRedisService(redisService);
      setRedisService(redisService);
      
      // 初始化超级管理员
      await this.initializeSuperAdmin();
      
      logger.info('数据库初始化完成');
    } catch (error) {
      logger.error('数据库初始化失败', error);
      process.exit(1);
    }
  }

  private async initializeSuperAdmin(): Promise<void> {
    try {
      await UserService.createSuperAdmin();
      logger.info('超级管理员初始化完成');
    } catch (error) {
      logger.error('超级管理员初始化失败', error);
    }
  }

  public start(): void {
    const port = config.port;
    const host = config.host;

    this.app.listen(port, host, () => {
      logger.info(`🚀 服务器启动成功`);
      logger.info(`📍 服务地址: http://${host}:${port}`);
      logger.info(`🌍 环境: ${config.nodeEnv}`);
      logger.info(`📊 健康检查: http://${host}:${port}/api/health`);
    });
  }

  public getRedisClient() {
    return this.redisClient;
  }
}

export default App;
