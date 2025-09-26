import { Router } from 'express';
import { UserController } from '@/controllers/userController.js';
import { validate, validateQuery, validateParams } from '@/middleware/validation.js';
import { authenticate, requireAdmin } from '@/middleware/auth.js';
import { createUserSchema, updateUserSchema, paginationSchema, userIdSchema } from '@/schemas/authSchemas.js';

const router = Router();

/**
 * @route   GET /api/users
 * @desc    获取用户列表
 * @access  Private (Admin)
 */
router.get('/', authenticate, requireAdmin, validateQuery(paginationSchema), UserController.getUsers);

/**
 * @route   GET /api/users/:id
 * @desc    根据ID获取用户信息
 * @access  Private (Admin)
 */
router.get('/:id', authenticate, requireAdmin, validateParams(userIdSchema), UserController.getUserById);

/**
 * @route   POST /api/users
 * @desc    创建用户
 * @access  Private (Admin)
 */
router.post('/', authenticate, requireAdmin, validate(createUserSchema), UserController.createUser);

/**
 * @route   PUT /api/users/:id
 * @desc    更新用户信息
 * @access  Private (Admin)
 */
router.put('/:id', authenticate, requireAdmin, validateParams(userIdSchema), validate(updateUserSchema), UserController.updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    删除用户
 * @access  Private (Admin)
 */
router.delete('/:id', authenticate, requireAdmin, validateParams(userIdSchema), UserController.deleteUser);

export default router;
