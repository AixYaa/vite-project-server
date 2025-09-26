import mongoose, { Schema } from 'mongoose';
import type { IRole } from '@/types/index.js';

const roleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: [true, '角色名称不能为空'],
      trim: true,
      maxlength: [50, '角色名称最多50个字符'],
      unique: true,
    },
    code: {
      type: String,
      required: [true, '角色编码不能为空'],
      trim: true,
      uppercase: true,
      maxlength: [100, '角色编码最多100个字符'],
      unique: true,
    },
    description: {
      type: String,
      default: '',
      maxlength: [200, '描述最多200个字符'],
    },
    permissions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Permission',
      },
    ],
    menus: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Menu',
      },
    ],
    isSystem: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

roleSchema.index({ code: 1 }, { unique: true });
roleSchema.index({ name: 1 }, { unique: true });

export const Role = mongoose.model<IRole>('Role', roleSchema);


