import express from 'express';
import { WebSocketServer } from 'ws';
import { spawn } from 'child_process';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

let viteProcess = null;
let isViteRunning = false;
const wss = new WebSocketServer({ noServer: true });

// 广播消息给所有连接的客户端
function broadcast(data) {
  const message = JSON.stringify({
    type: 'log',
    data: data,
    timestamp: new Date().toISOString()
  });

  for (const client of wss.clients) {
    if (client.readyState === 1) {
      client.send(message);
    }
  }
}

// 广播状态更新
function broadcastStatus(status) {
  const message = JSON.stringify({
    type: 'status',
    data: status,
    timestamp: new Date().toISOString()
  });

  for (const client of wss.clients) {
    if (client.readyState === 1) {
      client.send(message);
    }
  }
}

// 启动 Vite 服务
app.post('/start', (req, res) => {
  if (viteProcess && isViteRunning) {
    return res.json({
      success: false,
      message: 'Vite 已在运行中',
      status: 'running'
    });
  }

  try {
    const projectPath = new URL('../client', import.meta.url).pathname;
    viteProcess = spawn('npm', ['run', 'dev'], {
      cwd: projectPath,
      shell: true,
      stdio: 'pipe'
    });

    // 处理标准输出
    viteProcess.stdout.on('data', (data) => {
      const output = data.toString();
      broadcast(output);

      // 检查是否启动成功
      if (output.includes('Local:') || output.includes('ready in')) {
        isViteRunning = true;
        broadcastStatus('running');
      }
    });

    // 处理错误输出
    viteProcess.stderr.on('data', (data) => {
      const error = data.toString();
      broadcast(`[ERROR] ${error}`);
    });

    // 处理进程退出
    viteProcess.on('exit', (code) => {
      broadcast(`[SYSTEM] Vite 进程已退出 (退出码: ${code})`);
      isViteRunning = false;
      viteProcess = null;
      broadcastStatus('stopped');
    });

    // 处理进程错误
    viteProcess.on('error', (error) => {
      broadcast(`[SYSTEM] 启动 Vite 时发生错误: ${error.message}`);
      isViteRunning = false;
      viteProcess = null;
      broadcastStatus('error');
    });

    res.json({
      success: true,
      message: 'Vite 启动中...',
      status: 'starting'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: `启动失败: ${error.message}`,
      status: 'error'
    });
  }
});

// 停止 Vite 服务
app.post('/stop', (req, res) => {
  if (!viteProcess || !isViteRunning) {
    return res.json({
      success: false,
      message: '没有正在运行的服务',
      status: 'stopped'
    });
  }

  try {
    viteProcess.kill('SIGTERM');

    // 如果进程没有在5秒内退出，强制杀死
    setTimeout(() => {
      if (viteProcess && !viteProcess.killed) {
        viteProcess.kill('SIGKILL');
        broadcast('[SYSTEM] 强制停止 Vite 进程');
      }
    }, 5000);

    res.json({
      success: true,
      message: 'Vite 停止中...',
      status: 'stopping'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: `停止失败: ${error.message}`,
      status: 'error'
    });
  }
});

// 获取当前状态
app.get('/status', (req, res) => {
  res.json({
    success: true,
    status: isViteRunning ? 'running' : 'stopped',
    message: isViteRunning ? 'Vite 正在运行' : 'Vite 已停止'
  });
});

const server = app.listen(9000, () => {
  console.log('🚀 Control server running at http://localhost:9000');
  console.log('📡 WebSocket server ready for connections');
});

server.on('upgrade', (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit('connection', ws);

    // 新连接时发送当前状态
    ws.send(JSON.stringify({
      type: 'status',
      data: isViteRunning ? 'running' : 'stopped',
      timestamp: new Date().toISOString()
    }));

    ws.send(JSON.stringify({
      type: 'log',
      data: '[SYSTEM] 已连接到控制台',
      timestamp: new Date().toISOString()
    }));
  });
});
