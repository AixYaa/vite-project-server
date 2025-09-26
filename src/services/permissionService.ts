import { Permission } from '@/models/Permission.js';
import type { IPermission, PaginationParams } from '@/types/index.js';

export class PermissionService {
  static async list(params: PaginationParams) {
    const { page, limit, sort = 'createdAt', order = 'desc' } = params;
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Permission.find().sort({ [sort]: order === 'asc' ? 1 : -1 }).skip(skip).limit(limit),
      Permission.countDocuments(),
    ]);
    const pages = Math.ceil(total / limit);
    return { items, total, pages };
  }

  static async getById(id: string) {
    return Permission.findById(id);
  }

  static async isNameExists(name: string, excludeId?: string) {
    const query: any = { name };
    if (excludeId) query._id = { $ne: excludeId };
    return Permission.exists(query);
  }

  static async isCodeExists(code: string, excludeId?: string) {
    const query: any = { code };
    if (excludeId) query._id = { $ne: excludeId };
    return Permission.exists(query);
  }

  static async create(data: Pick<IPermission, 'name' | 'code' | 'description'>) {
    return Permission.create(data);
  }

  static async update(id: string, data: Partial<IPermission>) {
    return Permission.findByIdAndUpdate(id, data, { new: true });
  }

  static async remove(id: string) {
    const res = await Permission.findByIdAndDelete(id);
    return Boolean(res);
  }
}


