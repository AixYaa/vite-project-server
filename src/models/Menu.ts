import mongoose, { Schema, Types } from 'mongoose';
import type { IMenu } from '@/types/index.js';

const menuSchema = new Schema<IMenu>(
  {
    name: {
      type: String,
      required: [true, '菜单名称不能为空'],
      trim: true,
      maxlength: [50, '菜单名称最多50个字符'],
    },
    path: {
      type: String,
      trim: true,
      default: '',
      maxlength: [200, '路由路径最多200个字符'],
    },
    icon: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      default: 0,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Menu',
      default: null,
    },
    permissions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Permission',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

menuSchema.index({ parentId: 1, order: 1 });
menuSchema.index({ path: 1 });
menuSchema.index({ name: 1 });

export const Menu = mongoose.model<IMenu>('Menu', menuSchema);


