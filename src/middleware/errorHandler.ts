import type { Request, Response, NextFunction } from 'express';
import { serverErrorResponse } from '@/utils/response.js';
import { logger } from '@/utils/logger.js';

/**
 * 全局错误处理中间件
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('服务器错误', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // Mongoose 验证错误
  if (error.name === 'ValidationError') {
    const mongooseError = error as any;
    const errors = Object.values(mongooseError.errors).map((err: any) => err.message);
    serverErrorResponse(res, '数据验证失败', errors.join('; '));
    return;
  }

  // Mongoose 重复键错误
  if (error.name === 'MongoError' && (error as any).code === 11000) {
    serverErrorResponse(res, '数据已存在');
    return;
  }

  // JWT 错误
  if (error.name === 'JsonWebTokenError') {
    serverErrorResponse(res, '无效的令牌');
    return;
  }

  if (error.name === 'TokenExpiredError') {
    serverErrorResponse(res, '令牌已过期');
    return;
  }

  // 默认服务器错误
  serverErrorResponse(res, '服务器内部错误');
};

/**
 * 404 处理中间件
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  serverErrorResponse(res, `路由 ${req.originalUrl} 不存在`, undefined);
};
