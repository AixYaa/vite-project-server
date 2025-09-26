import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

interface Config {
  port: number;
  host: string;
  nodeEnv: string;
  mongodb: {
    uri: string;
    dbName: string;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
  bcrypt: {
    rounds: number;
  };
  cors: {
    origin: string;
  };
  log: {
    level: string;
  };
}

const config: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || 'localhost',
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/admin_system',
    dbName: process.env.MONGODB_DB_NAME || 'admin_system',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD }),
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  bcrypt: {
    rounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:8899',
  },
  log: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

export { config };
