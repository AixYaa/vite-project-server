import * as si from 'systeminformation';

export class SystemMonitorService {
  /**
   * 获取系统状态信息
   */
  static async getSystemStatus() {
    try {
      const [cpu, memory, disk, network] = await Promise.all([
        this.getCpuUsage(),
        this.getMemoryUsage(),
        this.getDiskUsage(),
        this.getNetworkUsage()
      ]);

      return [
        {
          name: 'CPU使用率',
          value: `${cpu.usage}%`,
          percentage: cpu.usage,
          color: this.getStatusColor(cpu.usage),
          details: {
            cores: cpu.cores,
            model: cpu.model,
            speed: cpu.speed
          }
        },
        {
          name: '内存使用率',
          value: `${memory.usage}%`,
          percentage: memory.usage,
          color: this.getStatusColor(memory.usage),
          details: {
            total: this.formatBytes(memory.total),
            used: this.formatBytes(memory.used),
            free: this.formatBytes(memory.free)
          }
        },
        {
          name: '磁盘使用率',
          value: `${disk.usage}%`,
          percentage: disk.usage,
          color: this.getStatusColor(disk.usage),
          details: {
            total: this.formatBytes(disk.total),
            used: this.formatBytes(disk.used),
            free: this.formatBytes(disk.free)
          }
        },
        {
          name: '网络使用率',
          value: `${network.usage}%`,
          percentage: network.usage,
          color: this.getStatusColor(network.usage),
          details: {
            upload: this.formatBytes(network.upload),
            download: this.formatBytes(network.download)
          }
        }
      ];
    } catch (error) {
      console.error('获取系统状态失败:', error);
      // 返回默认值
      return this.getDefaultSystemStatus();
    }
  }

  /**
   * 获取CPU使用率
   */
  private static async getCpuUsage() {
    try {
      const cpu = await si.currentLoad();
      return {
        usage: Math.round(cpu.currentLoad),
        cores: cpu.cpus.length,
        model: cpu.cpus[0]?.model || 'Unknown',
        speed: cpu.cpus[0]?.speed || 0
      };
    } catch (error) {
      console.error('获取CPU信息失败:', error);
      return {
        usage: 0,
        cores: 0,
        model: 'Unknown',
        speed: 0
      };
    }
  }

  /**
   * 获取内存使用率
   */
  private static async getMemoryUsage() {
    try {
      const memory = await si.mem();
      const usage = Math.round((memory.used / memory.total) * 100);
      return {
        usage,
        total: memory.total,
        used: memory.used,
        free: memory.free
      };
    } catch (error) {
      console.error('获取内存信息失败:', error);
      return {
        usage: 0,
        total: 0,
        used: 0,
        free: 0
      };
    }
  }

  /**
   * 获取磁盘使用率
   */
  private static async getDiskUsage() {
    try {
      const disk = await si.fsSize();
      const rootDisk = disk.find(d => d.mount === '/') || disk[0];
      if (!rootDisk) {
        return {
          usage: 0,
          total: 0,
          used: 0,
          free: 0
        };
      }
      const usage = Math.round((rootDisk.used / rootDisk.size) * 100);
      return {
        usage,
        total: rootDisk.size,
        used: rootDisk.used,
        free: rootDisk.available
      };
    } catch (error) {
      console.error('获取磁盘信息失败:', error);
      return {
        usage: 0,
        total: 0,
        used: 0,
        free: 0
      };
    }
  }

  /**
   * 获取网络使用率
   */
  private static async getNetworkUsage() {
    try {
      const network = await si.networkStats();
      const primaryInterface = network.find(n => n.iface !== 'lo') || network[0];
      if (!primaryInterface) {
        return {
          usage: 0,
          upload: 0,
          download: 0
        };
      }
      
      // 计算网络使用率（基于传输速度）
      const totalSpeed = primaryInterface.tx_sec + primaryInterface.rx_sec;
      const usage = Math.min(Math.round((totalSpeed / 1000000) * 100), 100); // 假设1MB/s为100%
      
      return {
        usage,
        upload: primaryInterface.tx_sec,
        download: primaryInterface.rx_sec
      };
    } catch (error) {
      console.error('获取网络信息失败:', error);
      return {
        usage: 0,
        upload: 0,
        download: 0
      };
    }
  }

  /**
   * 获取状态颜色
   */
  private static getStatusColor(usage: number): string {
    if (usage > 80) return '#F56C6C'; // 红色 - 高使用率
    if (usage > 60) return '#E6A23C'; // 橙色 - 中等使用率
    return '#67C23A'; // 绿色 - 低使用率
  }

  /**
   * 格式化字节数
   */
  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 获取默认系统状态（当监控失败时）
   */
  private static getDefaultSystemStatus() {
    return [
      {
        name: 'CPU使用率',
        value: '0%',
        percentage: 0,
        color: '#67C23A',
        details: {
          cores: 0,
          model: 'Unknown',
          speed: 0
        }
      },
      {
        name: '内存使用率',
        value: '0%',
        percentage: 0,
        color: '#67C23A',
        details: {
          total: '0 B',
          used: '0 B',
          free: '0 B'
        }
      },
      {
        name: '磁盘使用率',
        value: '0%',
        percentage: 0,
        color: '#67C23A',
        details: {
          total: '0 B',
          used: '0 B',
          free: '0 B'
        }
      },
      {
        name: '网络使用率',
        value: '0%',
        percentage: 0,
        color: '#67C23A',
        details: {
          upload: '0 B',
          download: '0 B'
        }
      }
    ];
  }
}
