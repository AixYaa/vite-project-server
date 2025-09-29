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
    // API 访问密钥（一个角色可拥有多个）
    // 说明：仅在创建时返回明文 apisecret，一经生成仅存储散列
    apiKeys: [
      {
        key: { type: String, required: true }, // apikey（公钥）
        secretHash: { type: String, required: true }, // apisecret 的哈希
        remark: { type: String, default: '' }, // 备注
        isActive: { type: Boolean, default: true },
        createdAt: { type: Date, default: Date.now },
        lastUsedAt: { type: Date },
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
// 保证 apikey 唯一（稀疏索引，数组子文档）
roleSchema.index({ 'apiKeys.key': 1 }, { unique: true, sparse: true });

export const Role = mongoose.model<IRole>('Role', roleSchema);


