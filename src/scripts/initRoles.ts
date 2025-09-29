import { Role } from '../models/Role.js';
import { logger } from '../utils/logger.js';

export async function initDefaultRoles() {
  try {
    // 检查是否已有角色数据
    const existingRoles = await Role.countDocuments();
    if (existingRoles > 0) {
      logger.info('角色数据已存在，跳过初始化');
      return;
    }

    // 创建默认角色
    const defaultRoles = [
      {
        name: '超级管理员',
        code: 'SUPER_ADMIN',
        description: '系统最高权限，拥有所有功能权限',
        permissions: [],
        menus: [],
        isSystem: true
      },
      {
        name: '管理员',
        code: 'ADMIN',
        description: '系统管理员，拥有大部分管理权限',
        permissions: [],
        menus: [],
        isSystem: true
      },
      {
        name: '普通用户',
        code: 'USER',
        description: '普通用户，拥有基础查看权限',
        permissions: [],
        menus: [],
        isSystem: true
      }
    ];

    // 批量创建角色
    const createdRoles = await Role.insertMany(defaultRoles);
    logger.info(`成功创建 ${createdRoles.length} 个默认角色`);
    
    return createdRoles;
  } catch (error) {
    logger.error('初始化默认角色失败', error);
    throw error;
  }
}
