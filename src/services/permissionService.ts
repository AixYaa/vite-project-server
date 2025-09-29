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

  /**
   * 返回权限树：按 code 前缀（module.action）分组
   * 例如 user.view / user.create → 归入 module=user
   */
  static async tree() {
    const all = await Permission.find().sort({ code: 1 }).lean();

    // 模块中文名映射
    const moduleDisplayName: Record<string, string> = {
      user: '用户',
      role: '角色',
      menu: '菜单',
      permission: '权限',
      dashboard: '仪表盘',
      operationLog: '操作日志',
    };

    const modules: Record<string, { id: string; label: string; children: any[] }> = {};
    for (const p of all) {
      // 使用冒号分割前缀，如 user:create -> user
      const moduleKey = String(p.code).split(':')[0] || 'other';
      const moduleLabel = moduleDisplayName[moduleKey] || moduleKey;
      if (!modules[moduleKey]) {
        modules[moduleKey] = {
          id: `module:${moduleKey}`,
          label: moduleLabel,
          children: [],
        };
      }
      modules[moduleKey].children.push({
        id: String(p._id),
        label: `${p.name} (${p.code})`,
        code: p.code,
        _id: p._id,
      });
    }

    // 保持模块及其子项有序
    const tree = Object.entries(modules)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([_, node]) => ({
        ...node,
        children: node.children.sort((x: any, y: any) => String(x.code).localeCompare(String(y.code)))
      }));

    return tree;
  }
}


