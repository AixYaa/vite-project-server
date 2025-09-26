import type { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { validationErrorResponse } from '@/utils/response.js';

/**
 * 验证中间件工厂函数
 */
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join('; ');
      validationErrorResponse(res, '参数验证失败', errorMessage);
      return;
    }

    req.body = value;
    next();
  };
};

/**
 * 查询参数验证中间件
 */
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join('; ');
      validationErrorResponse(res, '查询参数验证失败', errorMessage);
      return;
    }

    req.query = value;
    next();
  };
};

/**
 * 路径参数验证中间件
 */
export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join('; ');
      validationErrorResponse(res, '路径参数验证失败', errorMessage);
      return;
    }

    req.params = value;
    next();
  };
};
