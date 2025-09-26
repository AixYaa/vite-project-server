import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import type { IUser } from '@/types/index.js';
import { UserRole } from '@/types/index.js';
import { config } from '@/config/index.js';

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, '用户名不能为空'],
      unique: true,
      trim: true,
      minlength: [3, '用户名至少3个字符'],
      maxlength: [20, '用户名最多20个字符'],
    },
    email: {
      type: String,
      required: [true, '邮箱不能为空'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '请输入有效的邮箱地址'],
    },
    password: {
      type: String,
      required: [true, '密码不能为空'],
      minlength: [6, '密码至少6个字符'],
      select: false, // 默认查询时不返回密码字段
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    avatar: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete (ret as any).password;
        return ret;
      },
    },
  }
);

// 密码加密中间件
userSchema.pre('save', async function (next) {
  // 只有密码被修改时才加密
  if (!this.isModified('password')) return next();

  try {
    // 加密密码
    const salt = await bcrypt.genSalt(config.bcrypt.rounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// 比较密码方法
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// 索引（字段已使用 unique: true，无需重复建立 username/email 索引）
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
