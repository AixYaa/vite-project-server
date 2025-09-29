import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto'
import { config } from '@/config/index.js'

function hmacSign(input: string, expires: number) {
  const h = crypto.createHmac('sha256', config.jwt.secret)
  h.update(`${input}:${expires}`)
  return h.digest('hex')
}

const router = Router();

const uploadsRoot = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsRoot)) {
  fs.mkdirSync(uploadsRoot, { recursive: true });
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    const userId = req.userId || 'anonymous';
    const isImage = /^image\//.test(file.mimetype);
    const baseDir = path.join(uploadsRoot, isImage ? 'images' : 'files', String(userId));
    ensureDir(baseDir);
    cb(null, baseDir);
  },
  filename: (req: any, file: any, cb: any) => {
    const ext = path.extname(file.originalname) || (file.mimetype?.split('/')[1] ? `.${file.mimetype.split('/')[1]}` : '');
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '');
    const userId = req.userId || 'anonymous';
    const filename = `${base || 'file'}-${userId}-${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({ storage });

// 通用上传接口：根据 mimetype 自动分区（images/files）并按用户ID分目录
router.post('/', upload.single('file'), (req, res) => {
  const file = (req as any).file as any;
  if (!file) {
    res.status(400).json({ success: false, message: '未接收到文件' });
    return;
  }
  const userId = (req as any).userId || 'anonymous';
  const isImage = /^image\//.test(file.mimetype);
  const publicUrl = `/uploads/${isImage ? 'images' : 'files'}/${userId}/${file.filename}`;
  res.json({ success: true, data: { url: publicUrl }, message: '上传成功' });
});

export default router;

// 目录浏览：GET /api/uploads/list?path=images/userId
router.get('/list', (req: any, res) => {
  try {
    const queryPath = (req.query.path as string) || '';
    const safePath = queryPath.replace(/\\/g, '/').replace(/\.\./g, '');
    const targetDir = path.join(uploadsRoot, safePath);
    if (!fs.existsSync(targetDir)) {
      res.json({ success: true, data: { path: safePath, items: [] } });
      return;
    }
    const entries = fs.readdirSync(targetDir, { withFileTypes: true });
    const items = entries.map((e) => ({
      name: e.name,
      type: e.isDirectory() ? 'dir' : 'file',
      url: e.isDirectory() ? null : `/uploads/${[safePath, e.name].filter(Boolean).join('/')}`
    }));
    res.json({ success: true, data: { path: safePath, items } });
  } catch (e) {
    res.status(500).json({ success: false, message: '读取目录失败' });
  }
});

// 生成签名URL：GET /api/uploads/sign?path=images/userId/file.png&expires=300
router.get('/sign', (req: any, res) => {
  const pathParam = (req.query.path as string) || ''
  const sanitized = pathParam.replace(/\\/g, '/').replace(/\.\./g, '')
  const ttl = Math.max(60, Math.min(24 * 3600, parseInt(req.query.expires as string || '300', 10)))
  const expires = Math.floor(Date.now() / 1000) + ttl
  const sig = hmacSign(sanitized, expires)
  res.json({ success: true, data: { url: `/api/uploads/secure?path=${encodeURIComponent(sanitized)}&exp=${expires}&sig=${sig}` } })
})

// 受保护读取处理函数（导出以便无需认证挂载）
export const serveSecure = (req: any, res: any) => {
  const p = (req.query.path as string) || ''
  const exp = parseInt(req.query.exp as string || '0', 10)
  const sig = (req.query.sig as string) || ''
  const sanitized = p.replace(/\\/g, '/').replace(/\.\./g, '')
  if (!exp || exp < Math.floor(Date.now() / 1000)) {
    res.status(403).send('URL 已过期')
    return
  }
  const expect = hmacSign(sanitized, exp)
  if (expect !== sig) {
    res.status(403).send('签名无效')
    return
  }
  const abs = path.join(uploadsRoot, sanitized)
  if (!fs.existsSync(abs) || fs.statSync(abs).isDirectory()) {
    res.status(404).send('文件不存在')
    return
  }
  res.sendFile(abs)
}

// 受保护读取：校验签名后以静态方式返回（在本路由下也保留一份）
router.get('/secure', serveSecure)


