import jwt from 'jsonwebtoken';
import { config } from '@/config/index.js';
import type { JwtPayload } from '@/types/index.js';
import { UserRole } from '@/types/index.js';

/**
 * 生成访问令牌
 */
export const generateAccessToken = (payload: {
  userId: string;
  username: string;
  role: UserRole;
}): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);
};

/**
 * 生成刷新令牌
 */
export const generateRefreshToken = (payload: {
  userId: string;
  username: string;
  role: UserRole;
}): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.refreshExpiresIn,
  } as jwt.SignOptions);
};

/**
 * 验证令牌
 */
export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, config.jwt.secret) as JwtPayload;
  } catch (error) {
    throw new Error('无效的令牌');
  }
};

/**
 * 从请求头中提取令牌
 */
export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1] || null;
};
