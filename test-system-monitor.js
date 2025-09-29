// 测试系统监控功能
const { SystemMonitorService } = require('./src/services/systemMonitorService.js');

async function testSystemMonitor() {
  try {
    console.log('开始测试系统监控功能...');
    
    const status = await SystemMonitorService.getSystemStatus();
    
    console.log('系统状态:');
    status.forEach(item => {
      console.log(`- ${item.name}: ${item.value} (${item.percentage}%)`);
      if (item.details) {
        console.log(`  详情:`, item.details);
      }
    });
    
    console.log('系统监控测试完成！');
  } catch (error) {
    console.error('系统监控测试失败:', error);
  }
}

testSystemMonitor();
