import React, { useEffect, useState, useRef } from 'react';

export default function App() {
  const [logs, setLogs] = useState('');
  const [isRunning, setRunning] = useState(false);
  const logsRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:9000');
    ws.onmessage = (e) => {
      setLogs((prev) => prev + e.data + '\n');
      logsRef.current?.scrollTo(0, logsRef.current.scrollHeight);
    };
    return () => ws.close();
  }, []);

  const startServer = async () => {
    await fetch('http://localhost:9000/start', { method: 'POST' });
    setRunning(true);
  };

  const stopServer = async () => {
    await fetch('http://localhost:9000/stop', { method: 'POST' });
    setRunning(false);
  };

  const clearLogs = () => setLogs('');

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-6">
      <h1 className="text-3xl font-bold mb-6">⚡ XAGI Remote Dev Console</h1>
      <div className="space-x-3 mb-4">
        <button
          onClick={startServer}
          disabled={isRunning}
          className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded disabled:bg-gray-600"
        >
          启动服务
        </button>
        <button
          onClick={stopServer}
          disabled={!isRunning}
          className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded disabled:bg-gray-600"
        >
          停止服务
        </button>
        <button onClick={clearLogs} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded">
          清空日志
        </button>
      </div>

      <pre
        ref={logsRef}
        className="bg-black text-green-400 w-11/12 md:w-3/4 h-[70vh] overflow-y-auto p-3 rounded-lg font-mono text-sm"
      >
        {logs || '等待日志输出...'}
      </pre>
    </div>
  );
}