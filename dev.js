const { spawn } = require('child_process');
const { join } = require('path');

// 设置环境变量
process.env.NODE_ENV = 'development';

console.log('启动开发环境...');

// 先编译 Electron 代码
console.log('编译 Electron 代码...');
const buildElectron = spawn('npm', ['run', 'build:electron'], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname
});

buildElectron.on('close', (code) => {
  if (code === 0) {
    console.log('Electron 编译完成，启动开发服务器...');
    
    // 启动 Vite 开发服务器
    const vite = spawn('npm', ['run', 'dev:react'], {
      stdio: 'inherit',
      shell: true,
      cwd: __dirname
    });

    // 等待 Vite 服务器启动后启动 Electron
    setTimeout(() => {
      console.log('启动 Electron...');
      const electron = spawn('npm', ['run', 'dev:electron'], {
        stdio: 'inherit',
        shell: true,
        cwd: __dirname
      });

      // 处理进程退出
      electron.on('close', () => {
        console.log('Electron 已关闭');
        vite.kill();
        process.exit(0);
      });
    }, 3000);

    // 处理进程退出
    vite.on('close', () => {
      console.log('Vite 服务器已关闭');
      process.exit(0);
    });
  } else {
    console.error('Electron 编译失败');
    process.exit(1);
  }
});



process.on('SIGINT', () => {
  console.log('收到中断信号，正在关闭...');
  vite.kill();
  process.exit(0);
}); 