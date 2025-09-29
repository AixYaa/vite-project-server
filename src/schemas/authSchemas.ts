import Joi from 'joi';
import { UserRole } from '@/types/index.js';

/**
 * 登录验证模式
 */
export const loginSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(20)
    .required()
    .messages({
      'string.min': '用户名至少3个字符',
      'string.max': '用户名最多20个字符',
      'any.required': '用户名不能为空',
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': '密码至少6个字符',
      'any.required': '密码不能为空',
    }),
});

/**
 * 刷新令牌验证模式
 */
export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'any.required': '刷新令牌不能为空',
    }),
});

/**
 * 创建用户验证模式
 */
export const createUserSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(20)
    .required()
    .messages({
      'string.min': '用户名至少3个字符',
      'string.max': '用户名最多20个字符',
      'any.required': '用户名不能为空',
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': '请输入有效的邮箱地址',
      'any.required': '邮箱不能为空',
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': '密码至少6个字符',
      'any.required': '密码不能为空',
    }),
  role: Joi.string()
    .min(1)
    .required()
    .messages({
      'string.min': '角色不能为空',
      'any.required': '角色不能为空',
    }),
  avatar: Joi.string()
    .optional()
    .allow('')
    .messages({
      'string.base': '头像必须是字符串',
    }),
  isActive: Joi.boolean()
    .optional()
    .default(true)
    .messages({
      'boolean.base': 'isActive必须是布尔值',
    }),
});

/**
 * 更新用户验证模式
 */
export const updateUserSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(20)
    .optional()
    .messages({
      'string.min': '用户名至少3个字符',
      'string.max': '用户名最多20个字符',
    }),
  email: Joi.string()
    .email()
    .optional()
    .messages({
      'string.email': '请输入有效的邮箱地址',
    }),
  password: Joi.string()
    .min(6)
    .optional()
    .messages({
      'string.min': '密码至少6个字符',
    }),
  role: Joi.string()
    .min(1)
    .optional()
    .messages({
      'string.min': '角色不能为空',
    }),
  avatar: Joi.string()
    .optional()
    .allow('')
    .messages({
      'string.base': '头像必须是字符串',
    }),
  isActive: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'isActive必须是布尔值',
    }),
});

/**
 * 分页查询验证模式
 */
export const paginationSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': '页码必须是数字',
      'number.integer': '页码必须是整数',
      'number.min': '页码不能小于1',
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.base': '每页数量必须是数字',
      'number.integer': '每页数量必须是整数',
      'number.min': '每页数量不能小于1',
      'number.max': '每页数量不能大于100',
    }),
  sort: Joi.string()
    .valid('createdAt', 'updatedAt', 'username', 'email')
    .default('createdAt')
    .messages({
      'any.only': '无效的排序字段',
    }),
  order: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': '排序方向必须是asc或desc',
    }),
});

/**
 * 自助更新个人资料验证模式（不允许修改角色、状态）
 */
export const updateProfileSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(20)
    .optional()
    .messages({
      'string.min': '用户名至少3个字符',
      'string.max': '用户名最多20个字符',
    }),
  email: Joi.string()
    .email()
    .optional()
    .messages({
      'string.email': '请输入有效的邮箱地址',
    }),
  password: Joi.string()
    .min(6)
    .optional()
    .messages({
      'string.min': '密码至少6个字符',
    }),
  avatar: Joi.string()
    .optional()
    .allow('')
    .messages({
      'string.base': '头像必须是字符串',
    }),
});

/**
 * 用户ID验证模式
 */
export const userIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': '无效的用户ID格式',
      'any.required': '用户ID不能为空',
    }),
});
