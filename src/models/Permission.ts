import mongoose, { Schema } from 'mongoose';
import type { IPermission } from '@/types/index.js';

const permissionSchema = new Schema<IPermission>(
  {
    name: {
      type: String,
      required: [true, '权限名称不能为空'],
      trim: true,
      maxlength: [50, '权限名称最多50个字符'],
      unique: true,
    },
    code: {
      type: String,
      required: [true, '权限编码不能为空'],
      trim: true,
      maxlength: [100, '权限编码最多100个字符'],
      unique: true,
    },
    description: {
      type: String,
      default: '',
      maxlength: [200, '描述最多200个字符'],
    },
    type: {
      type: String,
      enum: ['menu', 'action', 'data', 'system'],
      required: [true, '权限类型不能为空'],
      default: 'action',
    },
    action: [{
      type: String,
      enum: ['view', 'create', 'edit', 'delete', 'export', 'import', 'audit', 'manage'],
    }],
    module: {
      type: String,
      enum: ['user', 'role', 'permission', 'menu', 'system'],
      default: 'system',
    },
  },
  {
    timestamps: true,
  }
);

permissionSchema.index({ code: 1 }, { unique: true });
permissionSchema.index({ name: 1 }, { unique: true });

export const Permission = mongoose.model<IPermission>('Permission', permissionSchema);


