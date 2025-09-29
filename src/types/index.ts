import type { Request } from 'express';
import type { Document } from 'mongoose';

// 用户相关类型
export interface IUser extends Document {
  _id: string;
  username: string;
  email: string;
  password: string;
  role: string; // 角色编码，关联到Role模型
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  USER = 'user',
}

// JWT 载荷类型
export interface JwtPayload {
  userId: string;
  username: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// 扩展 Request 类型
export interface AuthenticatedRequest extends Request {
  user?: IUser;
  userId?: string;
}

// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

// 分页参数类型
export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// 分页响应类型
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// 登录请求类型
export interface LoginRequest {
  username: string;
  password: string;
}

// 登录响应类型
export interface LoginResponse {
  user: {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    avatar?: string;
  };
  accessToken: string;
  refreshToken: string;
}

// 创建用户请求类型
export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role: string; // 角色编码
  avatar?: string;
}

// 更新用户请求类型
export interface UpdateUserRequest {
  username?: string;
  email?: string;
  password?: string;
  role?: string; // 角色编码
  avatar?: string;
  isActive?: boolean;
}

// 权限相关类型
export interface IPermission extends Document {
  _id: string;
  name: string;
  code: string;
  description?: string;
  type: 'menu' | 'action' | 'data' | 'system';
  action: string[];
  module?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 菜单相关类型
export interface IMenu extends Document {
  _id: string;
  name: string;
  path: string;
  icon?: string;
  order: number;
  parentId?: string | null;
  permissions?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 角色相关类型
export interface IRole extends Document {
  _id: string;
  name: string;
  code: string;
  description?: string;
  permissions: string[];
  menus: string[];
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}