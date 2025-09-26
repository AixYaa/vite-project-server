import { Router } from 'express';
import { AuthController } from '@/controllers/authController.js';
import { validate } from '@/middleware/validation.js';
import { loginLimiter } from '@/middleware/rateLimiter.js';
import { authenticate } from '@/middleware/auth.js';
import { loginSchema, refreshTokenSchema } from '@/schemas/authSchemas.js';

const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    用户登录
 * @access  Public
 */
router.post('/login', loginLimiter, validate(loginSchema), AuthController.login);

/**
 * @route   POST /api/auth/refresh
 * @desc    刷新访问令牌
 * @access  Public
 */
router.post('/refresh', validate(refreshTokenSchema), AuthController.refreshToken);

/**
 * @route   GET /api/auth/profile
 * @desc    获取当前用户信息
 * @access  Private
 */
router.get('/profile', authenticate, AuthController.getProfile);

/**
 * @route   POST /api/auth/logout
 * @desc    用户登出
 * @access  Private
 */
router.post('/logout', authenticate, AuthController.logout);

export default router;
