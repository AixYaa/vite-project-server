import type { Response } from 'express';
import type { ApiResponse, PaginatedResponse } from '@/types/index.js';

/**
 * 成功响应
 */
export const successResponse = <T>(
  res: Response,
  data: T,
  message: string = '操作成功',
  statusCode: number = 200
): void => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
  res.status(statusCode).json(response);
};

/**
 * 分页成功响应
 */
export const successPaginatedResponse = <T>(
  res: Response,
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  },
  message: string = '获取成功',
  statusCode: number = 200
): void => {
  const response: PaginatedResponse<T> = {
    success: true,
    message,
    data,
    pagination,
    timestamp: new Date().toISOString(),
  };
  res.status(statusCode).json(response);
};

/**
 * 错误响应
 */
export const errorResponse = (
  res: Response,
  message: string = '操作失败',
  statusCode: number = 400,
  error?: string
): void => {
  const base: Omit<ApiResponse, 'error'> = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };
  const response: ApiResponse = error !== undefined ? { ...base, error } : base;
  res.status(statusCode).json(response);
};

/**
 * 服务器错误响应
 */
export const serverErrorResponse = (
  res: Response,
  message: string = '服务器内部错误',
  error?: string
): void => {
  errorResponse(res, message, 500, error);
};

/**
 * 未授权响应
 */
export const unauthorizedResponse = (
  res: Response,
  message: string = '未授权访问'
): void => {
  errorResponse(res, message, 401);
};

/**
 * 禁止访问响应
 */
export const forbiddenResponse = (
  res: Response,
  message: string = '禁止访问'
): void => {
  errorResponse(res, message, 403);
};

/**
 * 未找到响应
 */
export const notFoundResponse = (
  res: Response,
  message: string = '资源未找到'
): void => {
  errorResponse(res, message, 404);
};

/**
 * 验证错误响应
 */
export const validationErrorResponse = (
  res: Response,
  message: string = '参数验证失败',
  error?: string
): void => {
  errorResponse(res, message, 422, error);
};
