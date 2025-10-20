# ⚡ XAGI Remote Dev Console

一个现代化的远程开发控制台，用于远程启动和管理 Vite 开发服务器。通过 WebSocket 实现实时日志传输和状态同步。

## 🚀 功能特性

### ✨ 核心功能
- **远程控制**: 通过 Web 界面远程启动/停止 Vite 开发服务器
- **实时日志**: WebSocket 实时传输开发服务器日志
- **状态同步**: 多客户端状态实时同步
- **优雅停止**: 支持优雅的进程停止机制
- **错误处理**: 完善的错误捕获和用户反馈

### 🎨 用户界面
- **状态指示器**: 实时显示 WebSocket 连接状态和服务运行状态
- **现代化 UI**: 基于 Tailwind CSS 的响应式设计
- **实时反馈**: 按钮状态根据服务状态动态变化
- **日志管理**: 支持清空日志和自动滚动

### 🔧 技术特性
- **结构化消息**: JSON 格式的日志和状态消息
- **时间戳**: 所有日志都带有精确的时间戳
- **类型安全**: TypeScript 提供完整的类型支持
- **进程管理**: 智能的进程生命周期管理

## 🏗️ 技术栈

### 后端
- **Node.js** + **Express.js**: RESTful API 服务器
- **WebSocket (ws)**: 实时双向通信
- **CORS**: 跨域资源共享支持
- **Child Process**: 进程管理

### 前端
- **React 18**: 现代化 UI 框架
- **TypeScript**: 类型安全的 JavaScript
- **Vite**: 快速的构建工具和开发服务器
- **Tailwind CSS**: 实用优先的 CSS 框架

### 开发工具
- **pnpm**: 高效的包管理器
- **concurrently**: 同时运行多个开发服务器
- **ESLint**: 代码质量检查

## 📦 安装和运行

### 环境要求
- Node.js >= 16.0.0
- pnpm >= 8.0.0

### 安装依赖
```bash
# 安装根目录依赖
pnpm install

# 安装服务端依赖
pnpm install --prefix server

# 安装客户端依赖
pnpm install --prefix client
```

### 启动开发服务器
```bash
# 同时启动服务端和客户端
pnpm run dev
```

### 访问应用
- **控制台界面**: http://localhost:5173
- **API 服务**: http://localhost:9000
- **网络访问**: http://192.168.1.17:5173 (局域网)

## 🎯 使用方式

### 1. 启动服务
1. 打开浏览器访问 http://localhost:5173
2. 点击 **"启动服务"** 按钮
3. 观察状态指示器变为 **"启动中"** → **"运行中"**
4. 在日志区域查看 Vite 服务器的启动日志

### 2. 监控日志
- 日志会实时显示在控制台中
- 每条日志都带有时间戳
- 支持自动滚动到最新日志
- 可以点击 **"清空日志"** 清除历史日志

### 3. 停止服务
1. 点击 **"停止服务"** 按钮
2. 状态指示器变为 **"停止中"** → **"已停止"**
3. 查看停止确认日志

### 4. 状态监控
- **WebSocket 状态**: 显示与服务器的连接状态
- **Vite 状态**: 显示开发服务器的运行状态
- **日志计数**: 显示当前日志总数

## 🔌 API 接口

### REST API

#### 启动服务
```http
POST /start
Content-Type: application/json

Response:
{
  "success": true,
  "message": "Vite 启动中...",
  "status": "starting"
}
```

#### 停止服务
```http
POST /stop
Content-Type: application/json

Response:
{
  "success": true,
  "message": "Vite 停止中...",
  "status": "stopping"
}
```

#### 获取状态
```http
GET /status

Response:
{
  "success": true,
  "status": "running",
  "message": "Vite 正在运行"
}
```

### WebSocket 消息格式

#### 日志消息
```json
{
  "type": "log",
  "data": "Vite 开发服务器启动成功",
  "timestamp": "2024-01-15T14:30:45.123Z"
}
```

#### 状态消息
```json
{
  "type": "status",
  "data": "running",
  "timestamp": "2024-01-15T14:30:45.123Z"
}
```

## 📁 项目结构

```
xagi-remote-console/
├── client/                 # 前端 React 应用
│   ├── src/
│   │   ├── App.tsx        # 主应用组件
│   │   ├── main.tsx       # 应用入口
│   │   └── index.css      # 全局样式
│   ├── index.html         # HTML 模板
│   ├── package.json       # 前端依赖配置
│   ├── vite.config.ts    # Vite 配置
│   └── tailwind.config.js # Tailwind 配置
├── server/                # 后端 Express 应用
│   ├── index.js           # 服务器主文件
│   └── package.json       # 后端依赖配置
├── package.json           # 根项目配置
├── pnpm-lock.yaml        # 依赖锁定文件
└── README.md             # 项目文档
```

## 🔧 配置说明

### 端口配置
- **服务端**: 9000 (可在 server/index.js 中修改)
- **客户端**: 5173 (可在 client/vite.config.ts 中修改)

### 环境变量
项目支持以下环境变量：
- `NODE_ENV`: 运行环境 (development/production)
- `PORT`: 服务端端口 (默认 9000)

## 🐛 故障排除

### 常见问题

#### 1. 端口被占用
```bash
# 检查端口占用
lsof -i :9000
lsof -i :5173

# 杀死占用进程
kill -9 <PID>
```

#### 2. WebSocket 连接失败
- 检查服务端是否正常运行
- 确认防火墙设置
- 检查网络连接

#### 3. Vite 启动失败
- 检查客户端依赖是否正确安装
- 确认 Node.js 版本兼容性
- 查看服务端日志获取详细错误信息

### 调试模式
```bash
# 启用详细日志
DEBUG=* pnpm run dev

# 检查进程状态
ps aux | grep xagi-remote-console
```

## 🤝 贡献指南

### 开发流程
1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 代码规范
- 使用 TypeScript 进行类型检查
- 遵循 ESLint 规则
- 添加适当的注释
- 编写测试用例

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Vite](https://vitejs.dev/) - 快速的构建工具
- [React](https://reactjs.org/) - 用户界面库
- [Express.js](https://expressjs.com/) - Web 应用框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架

## 📞 支持

如果你遇到任何问题或有功能建议，请：

1. 查看 [Issues](https://github.com/dongdada29/xagi-remote-console/issues)
2. 创建新的 Issue
3. 联系维护者

---

**享受远程开发的便利！** 🚀