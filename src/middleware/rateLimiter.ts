import rateLimit from 'express-rate-limit';
import { config } from '@/config/index.js';

/**
 * 通用限流中间件
 */
export const generalLimiter = rateLimit({
  windowMs:  60 * 1000, // 15 分钟
  max: 10000, // 限制每个IP 15分钟内最多100个请求
  message: {
    success: false,
    message: '请求过于频繁，请稍后再试',
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * 登录限流中间件
 */
export const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 15 分钟
  max: 10, // 限制每个IP 15分钟内最多5次登录尝试
  message: {
    success: false,
    message: '登录尝试过于频繁，请1分钟后再试',
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // 成功请求不计入限制
});

/**
 * 注册限流中间件
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 小时
  max: 3, // 限制每个IP 1小时内最多3次注册尝试
  message: {
    success: false,
    message: '注册尝试过于频繁，请1小时后再试',
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
});
