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
    
    // 根据角色获取用户菜单
    const { Role } = await import('@/models/Role.js');
    const userRole = await Role.findOne({ code: role }).populate('menus');
    
    if (!userRole || !userRole.menus || userRole.menus.length === 0) {
      return [];
    }
    
    // 获取用户有权限的菜单ID列表
    const allowedMenuIds = new Set<string>(
      userRole.menus.map((menu: any) => menu._id.toString())
    );

    // 获取所有菜单
    const allMenus = await Menu.find().populate('permissions').sort({ order: 1 }).lean();

    // 为了让前端看到完整层级，需要把所有允许菜单的祖先也包含进来
    const idToMenu: Record<string, any> = {};
    allMenus.forEach((m: any) => (idToMenu[m._id.toString()] = m));

    const includedIds = new Set<string>();

    // 递归向上收集父级
    const collectAncestors = (menuId: string) => {
      if (!menuId || includedIds.has(menuId)) return;
      includedIds.add(menuId);
      const menu = idToMenu[menuId];
      const parentId = menu?.parentId?.toString?.();
      if (parentId) collectAncestors(parentId);
    };

    // 把所有允许的菜单以及它们的祖先加入 includedIds
    for (const id of allowedMenuIds) {
      collectAncestors(id);
    }

    // 构建树（仅包含 includedIds）
    const idToNode: Record<string, any> = {};
    const roots: any[] = [];

    // 先为 includedIds 创建节点
    for (const id of includedIds) {
      const menu = idToMenu[id];
      if (menu) {
        idToNode[id] = { ...menu, children: [] };
      }
    }

    // 再链接父子关系
    for (const id of includedIds) {
      const node = idToNode[id];
      if (!node) continue;
      const parentId = node.parentId?.toString?.();
      if (parentId && idToNode[parentId]) {
        idToNode[parentId].children.push(node);
      } else {
        roots.push(node);
      }
    }

    // 仅返回处于激活状态的节点（可选）
    const filterInactive = (items: any[]): any[] =>
      items
        .filter((m) => m.isActive !== false)
        .map((m) => ({ ...m, children: filterInactive(m.children || []) }));

    return filterInactive(roots);
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


