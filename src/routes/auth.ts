import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AuthController } from '@/controllers/authController.js';
import { validate } from '@/middleware/validation.js';
import { loginLimiter } from '@/middleware/rateLimiter.js';
import { authenticate } from '@/middleware/auth.js';
import { loginSchema, refreshTokenSchema, updateProfileSchema } from '@/schemas/authSchemas.js';

const router = Router();

// 配置 multer，保存到项目根目录的 uploads
const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req: any, _file: any, cb: any) => {
    const userId = req.userId || 'anonymous'
    const userImagesDir = path.join(uploadsDir, 'images', String(userId))
    if (!fs.existsSync(userImagesDir)) {
      fs.mkdirSync(userImagesDir, { recursive: true })
    }
    cb(null, userImagesDir)
  },
  filename: (req: any, file: any, cb: any) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '');
    const userId = req.userId || 'anonymous'
    const filename = `${base || 'avatar'}-${userId}-${Date.now()}${ext || '.png'}`;
    cb(null, filename);
  }
});
const upload = multer({ storage });

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
 * @route   PUT /api/auth/profile
 * @desc    更新当前用户信息
 * @access  Private
 */
router.put('/profile', authenticate, validate(updateProfileSchema), AuthController.updateProfile);

/**
 * @route   POST /api/auth/logout
 * @desc    用户登出
 * @access  Private
 */
router.post('/logout', authenticate, AuthController.logout);

/**
 * @route   POST /api/auth/upload-avatar
 * @desc    上传头像文件，返回可访问URL
 * @access  Private
 */
router.post('/upload-avatar', authenticate, upload.single('file'), (req, res) => {
  const file = (req as any).file as any;
  if (!file) {
    res.status(400).json({ success: false, message: '未接收到文件' });
    return;
  }
  const userId = (req as any).userId || 'anonymous'
  const publicUrl = `/uploads/images/${userId}/${file.filename}`;
  res.json({ success: true, data: { url: publicUrl }, message: '上传成功' });
  return;
});

export default router;
