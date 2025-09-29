import mongoose, { Schema } from 'mongoose';

export interface IOperationLog {
  _id: string;
  userId: string;
  username: string;
  action: string;
  resource: string;
  resourceId?: string;
  method: string;
  url: string;
  ip: string;
  userAgent: string;
  status: 'success' | 'failed';
  errorMessage?: string;
  duration: number; // 请求处理时间(ms)
  createdAt: Date;
  updatedAt: Date;
}

const operationLogSchema = new Schema<IOperationLog>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    resource: {
      type: String,
      required: true,
      index: true,
    },
    resourceId: {
      type: String,
      index: true,
    },
    method: {
      type: String,
      required: true,
      enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    },
    url: {
      type: String,
      required: true,
    },
    ip: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['success', 'failed'],
      index: true,
    },
    errorMessage: {
      type: String,
    },
    duration: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// 创建索引以提高查询性能
operationLogSchema.index({ createdAt: -1 });
operationLogSchema.index({ userId: 1, createdAt: -1 });
operationLogSchema.index({ action: 1, createdAt: -1 });
operationLogSchema.index({ status: 1, createdAt: -1 });

// 设置TTL索引，自动删除30天前的日志
operationLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export const OperationLog = mongoose.model<IOperationLog>('OperationLog', operationLogSchema);
