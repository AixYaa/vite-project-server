import { Role } from '@/models/Role.js';
import type { IRole, PaginationParams } from '@/types/index.js';
import crypto from 'crypto';

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

  // -------- API Keys management --------
  /** 生成 apikey 和 apisecret（仅本次返回明文 apisecret），保存 secretHash 与备注 */
  static async generateApiKey(
    roleId: string,
    remark: string = ''
  ): Promise<{ key: string; secret: string }> {
    const role = await Role.findById(roleId);
    if (!role) throw new Error('角色不存在');

    // 生成随机 apikey / apisecret
    const key = 'rk_' + crypto.randomBytes(12).toString('hex');
    const secret = 'rs_' + crypto.randomBytes(24).toString('hex');
    const secretHash = crypto.createHash('sha256').update(secret).digest('hex');

    // 确保 key 唯一
    const exists = await Role.exists({ 'apiKeys.key': key });
    if (exists) return this.generateApiKey(roleId, remark);

    (role as any).apiKeys = (role as any).apiKeys || [];
    (role as any).apiKeys.push({ key, secretHash, remark, isActive: true, createdAt: new Date() });
    await role.save();
    return { key, secret };
  }

  static async listApiKeys(roleId: string) {
    const role = await Role.findById(roleId).lean();
    if (!role) throw new Error('角色不存在');
    return (role as any).apiKeys || [];
  }

  static async toggleApiKey(roleId: string, key: string, isActive: boolean) {
    const role = await Role.findById(roleId);
    if (!role) throw new Error('角色不存在');
    const apiKeys = (role as any).apiKeys || [];
    const target = apiKeys.find((k: any) => k.key === key);
    if (!target) throw new Error('密钥不存在');
    target.isActive = isActive;
    await role.save();
    return true;
  }

  static async revokeApiKey(roleId: string, key: string) {
    const role = await Role.findById(roleId);
    if (!role) throw new Error('角色不存在');
    const before = (role as any).apiKeys?.length || 0;
    (role as any).apiKeys = ((role as any).apiKeys || []).filter((k: any) => k.key !== key);
    await role.save();
    return ((role as any).apiKeys || []).length < before;
  }
}


