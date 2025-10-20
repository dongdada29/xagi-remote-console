import React, { useEffect, useState, useRef } from 'react';

interface LogMessage {
  type: 'log' | 'status';
  data: string;
  timestamp: string;
}

export default function App() {
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<'stopped' | 'starting' | 'running' | 'stopping' | 'error'>('stopped');
  const [isConnected, setIsConnected] = useState(false);
  const logsRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // 建立 WebSocket 连接
    const ws = new WebSocket('ws://localhost:9000');
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket 连接已建立');
    };

    ws.onmessage = (event) => {
      try {
        const message: LogMessage = JSON.parse(event.data);

        if (message.type === 'log') {
          setLogs(prev => [...prev, `[${new Date(message.timestamp).toLocaleTimeString()}] ${message.data}`]);
        } else if (message.type === 'status') {
          setStatus(message.data as any);
        }
      } catch (error) {
        // 兼容旧格式
        setLogs(prev => [...prev, event.data]);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket 连接已断开');
    };

    ws.onerror = (error) => {
      console.error('WebSocket 错误:', error);
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  // 自动滚动到最新日志
  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [logs]);

  const startServer = async () => {
    try {
      const response = await fetch('http://localhost:9000/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();

      if (!result.success) {
        setLogs(prev => [...prev, `[ERROR] ${result.message}`]);
      }
    } catch (error) {
      setLogs(prev => [...prev, `[ERROR] 启动请求失败: ${error}`]);
    }
  };

  const stopServer = async () => {
    try {
      const response = await fetch('http://localhost:9000/stop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();

      if (!result.success) {
        setLogs(prev => [...prev, `[ERROR] ${result.message}`]);
      }
    } catch (error) {
      setLogs(prev => [...prev, `[ERROR] 停止请求失败: ${error}`]);
    }
  };

  const clearLogs = () => setLogs([]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-400';
      case 'starting': return 'text-yellow-400';
      case 'stopping': return 'text-orange-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running': return '运行中';
      case 'starting': return '启动中';
      case 'stopping': return '停止中';
      case 'error': return '错误';
      default: return '已停止';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-6">
      <h1 className="text-3xl font-bold mb-6">⚡ XAGI Remote Dev Console</h1>

      {/* 状态栏 */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm">
            WebSocket: {isConnected ? '已连接' : '未连接'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            status === 'running' ? 'bg-green-500' :
            status === 'starting' ? 'bg-yellow-500' :
            status === 'stopping' ? 'bg-orange-500' :
            status === 'error' ? 'bg-red-500' : 'bg-gray-500'
          }`}></div>
          <span className={`text-sm ${getStatusColor(status)}`}>
            Vite: {getStatusText(status)}
          </span>
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="space-x-3 mb-4">
        <button
          onClick={startServer}
          disabled={status === 'running' || status === 'starting'}
          className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          启动服务
        </button>
        <button
          onClick={stopServer}
          disabled={status === 'stopped' || status === 'stopping'}
          className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          停止服务
        </button>
        <button
          onClick={clearLogs}
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded transition-colors"
        >
          清空日志
        </button>
      </div>

      {/* 日志显示区域 */}
      <div
        ref={logsRef}
        className="bg-black text-green-400 w-11/12 md:w-3/4 h-[60vh] overflow-y-auto p-3 rounded-lg font-mono text-sm border border-gray-700"
      >
        {logs.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            等待日志输出...
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="mb-1">
              {log}
            </div>
          ))
        )}
      </div>

      {/* 底部信息 */}
      <div className="mt-4 text-sm text-gray-400">
        <p>服务端: http://localhost:9000 | 客户端: http://localhost:5173</p>
        <p>日志总数: {logs.length}</p>
      </div>
    </div>
  );
}
