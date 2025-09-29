import { Menu } from '@/models/Menu.js';
import type { IMenu, PaginationParams } from '@/types/index.js';
import { UserRole } from '@/types/index.js';

export class MenuService {
  static async list(params: PaginationParams) {
    const { page, limit, sort = 'order', order = 'asc' } = params;
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Menu.find().populate('permissions').sort({ [sort]: order === 'asc' ? 1 : -1 }).skip(skip).limit(limit),
      Menu.countDocuments(),
    ]);
    const pages = Math.ceil(total / limit);
    return { items, total, pages };
  }

  static async tree() {
    const all = await Menu.find().populate('permissions').sort({ order: 1 }).lean();
    const idToNode: Record<string, any> = {};
    const roots: any[] = [];
    all.forEach((m: any) => (idToNode[m._id.toString()] = { ...m, children: [] }));
    all.forEach((m: any) => {
      if (m.parentId) {
        const parent = idToNode[m.parentId.toString()];
        if (parent) parent.children.push(idToNode[m._id.toString()]);
        else roots.push(idToNode[m._id.toString()]);
      } else {
        roots.push(idToNode[m._id.toString()]);
      }
    });
    return roots;
  }

  static async getById(id: string) {
    return Menu.findById(id).populate('permissions');
  }

  static async treeForUser(role: UserRole) {
    if (role === UserRole.SUPER_ADMIN) {
      return this.tree();
    }
    // 非超级管理员：可按业务需要筛选。此处返回空，由前端fallback最小导航（如仅仪表盘）。
    return [];
  }

  static async create(data: Partial<IMenu>) {
    return Menu.create(data);
  }

  static async update(id: string, data: Partial<IMenu>) {
    return Menu.findByIdAndUpdate(id, data, { new: true });
  }

  static async remove(id: string) {
    // 先查找要删除的菜单
    const menu = await Menu.findById(id);
    if (!menu) return false;
    
    // 递归删除所有子菜单
    const deleteChildren = async (parentId: string) => {
      const children = await Menu.find({ parentId });
      for (const child of children) {
        await deleteChildren(child._id.toString());
        await Menu.findByIdAndDelete(child._id);
      }
    };
    
    // 删除所有子菜单
    await deleteChildren(id);
    
    // 最后删除父菜单
    const res = await Menu.findByIdAndDelete(id);
    return Boolean(res);
  }

  static async syncMenus(items: Array<Partial<IMenu>>) {
    // 简单按 path 去重并 upsert
    const ops = (items || [])
      .filter((m) => m && (m as any).path)
      .map((m) => ({
        updateOne: {
          filter: { path: m.path },
          update: { $set: { name: m.name, path: m.path, icon: m.icon || '', order: (m as any).order || 0, parentId: (m as any).parentId || null, isActive: (m as any).isActive ?? true } },
          upsert: true,
        },
      }));
    if (ops.length) {
      await Menu.bulkWrite(ops as any);
    }
    return this.tree();
  }
}


