import express from 'express';
import { WebSocketServer } from 'ws';
import { spawn } from 'child_process';
import cors from 'cors';

const app = express();
app.use(cors());

let viteProcess = null;
const wss = new WebSocketServer({ noServer: true });

function broadcast(data) {
  for (const client of wss.clients) {
    if (client.readyState === 1) {
      client.send(data);
    }
  }
}

app.post('/start', (req, res) => {
  if (viteProcess) return res.json({ message: 'Vite 已在运行中' });
  const projectPath = new URL('../client', import.meta.url).pathname;
  viteProcess = spawn('npm', ['run', 'dev'], {
    cwd: projectPath,
    shell: true
  });
  viteProcess.stdout.on('data', (data) => broadcast(data.toString()));
  viteProcess.stderr.on('data', (data) => broadcast(`[ERR] ${data.toString()}`));
  viteProcess.on('exit', (code) => {
    broadcast(`[vite] 已退出 (code=${code})`);
    viteProcess = null;
  });
  res.json({ message: 'Vite 启动中...' });
});

app.post('/stop', (req, res) => {
  if (!viteProcess) return res.json({ message: '没有正在运行的服务' });
  viteProcess.kill();
  viteProcess = null;
  res.json({ message: 'Vite 已停止' });
});

const server = app.listen(9000, () => {
  console.log('🚀 Control server running at http://localhost:9000');
});

server.on('upgrade', (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws));
});