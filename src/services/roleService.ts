import { Role } from '@/models/Role.js';
import type { IRole, PaginationParams } from '@/types/index.js';

export class RoleService {
  static async list(params: PaginationParams) {
    const { page, limit, sort = 'createdAt', order = 'desc' } = params;
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Role.find().populate('permissions').populate('menus').sort({ [sort]: order === 'asc' ? 1 : -1 }).skip(skip).limit(limit),
      Role.countDocuments(),
    ]);
    const pages = Math.ceil(total / limit);
    return { items, total, pages };
  }

  static async getById(id: string) {
    return Role.findById(id).populate('permissions').populate('menus');
  }

  static async isNameExists(name: string, excludeId?: string) {
    const query: any = { name };
    if (excludeId) query._id = { $ne: excludeId };
    return Role.exists(query);
  }

  static async isCodeExists(code: string, excludeId?: string) {
    const query: any = { code };
    if (excludeId) query._id = { $ne: excludeId };
    return Role.exists(query);
  }

  static async create(data: Partial<IRole>) {
    return Role.create(data);
  }

  static async update(id: string, data: Partial<IRole>) {
    return Role.findByIdAndUpdate(id, data, { new: true });
  }

  static async remove(id: string) {
    const res = await Role.findByIdAndDelete(id);
    return Boolean(res);
  }
}


