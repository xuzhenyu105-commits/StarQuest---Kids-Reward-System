import React, { useState, useEffect } from 'react';
import { X, Copy, Download, Upload, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

interface DataSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 定义我们需要备份的数据结构
interface BackupData {
  points: string | null;
  lifetime: string | null;
  tasks: string | null;
  version: string;
  timestamp: number;
}

export default function DataSyncModal({ isOpen, onClose }: DataSyncModalProps) {
  const [mode, setMode] = useState<'export' | 'import'>('export');
  const [exportCode, setExportCode] = useState('');
  const [importCode, setImportCode] = useState('');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // 当模态框打开或切换到导出模式时，生成代码
  useEffect(() => {
    if (isOpen && mode === 'export') {
      generateExportCode();
    }
  }, [isOpen, mode]);

  // 生成导出代码
  const generateExportCode = () => {
    try {
      // 1. 获取所有相关数据，注意 keys 要和 App.tsx 保持一致
      const data: BackupData = {
        points: localStorage.getItem('sq_points_v4'),
        lifetime: localStorage.getItem('sq_lifetime_v4'),
        tasks: localStorage.getItem('sq_tasks_v4'),
        version: 'v4',
        timestamp: Date.now(),
      };

      // 2. 转换为 JSON 字符串
      const jsonString = JSON.stringify(data);

      // 3. 编码：先 encodeURIComponent 处理中文，再 btoa 转 Base64
      const encoded = btoa(encodeURIComponent(jsonString));
      
      setExportCode(encoded);
    } catch (e) {
      console.error("生成存档失败", e);
      setExportCode("生成失败，请重试");
    }
  };

  // 复制到剪贴板
  const handleCopy = () => {
    navigator.clipboard.writeText(exportCode).then(() => {
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    });
  };

  // 执行导入
  const handleImport = () => {
    if (!importCode.trim()) return;

    try {
      // 1. 解码：先 atob 解 Base64，再 decodeURIComponent 解中文
      const jsonString = decodeURIComponent(atob(importCode.trim()));
      const data: BackupData = JSON.parse(jsonString);

      // 2. 简单验证数据有效性
      if (!data.version || !data.tasks) {
        throw new Error("无效的存档格式");
      }

      // 3. 二次确认
      if (confirm(`检测到存档时间：${new Date(data.timestamp).toLocaleString()}\n确定要覆盖当前的星星和任务进度吗？\n此操作无法撤销！`)) {
        // 4. 写入 LocalStorage
        if (data.points) localStorage.setItem('sq_points_v4', data.points);
        if (data.lifetime) localStorage.setItem('sq_lifetime_v4', data.lifetime);
        if (data.tasks) localStorage.setItem('sq_tasks_v4', data.tasks);

        setImportStatus('success');
        
        // 5. 延迟刷新页面以应用更改
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (e) {
      console.error(e);
      setImportStatus('error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-indigo-600 p-5 flex justify-between items-center text-white">
          <h3 className="font-black text-lg flex items-center gap-2">
            <RefreshCw size={20} /> 数据同步助手
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex p-2 bg-slate-50 border-b border-slate-100">
          <button
            onClick={() => setMode('export')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              mode === 'export' 
                ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Upload size={16} /> 导出 (旧设备)
          </button>
          <button
            onClick={() => setMode('import')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              mode === 'import' 
                ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Download size={16} /> 导入 (新设备)
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {mode === 'export' ? (
            <div className="space-y-4">
              <div className="bg-amber-50 text-amber-600 text-xs p-3 rounded-xl border border-amber-100 flex gap-2">
                <AlertTriangle size={16} className="shrink-0" />
                <p>这是你的所有星星和任务记录。请复制下方代码，发送给新设备。</p>
              </div>
              
              <div className="relative">
                <textarea
                  readOnly
                  value={exportCode}
                  className="w-full h-40 bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-[10px] text-slate-500 font-mono resize-none focus:outline-none focus:border-indigo-300"
                />
              </div>

              <button
                onClick={handleCopy}
                className={`w-full py-3.5 rounded-xl font-black flex items-center justify-center gap-2 transition-all active:scale-95 ${
                  copyStatus === 'copied'
                    ? 'bg-green-500 text-white shadow-green-200'
                    : 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700'
                } shadow-lg`}
              >
                {copyStatus === 'copied' ? (
                  <> <CheckCircle2 size={18} /> 已复制！去发送吧 </>
                ) : (
                  <> <Copy size={18} /> 一键复制存档代码 </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
               <div className="bg-blue-50 text-blue-600 text-xs p-3 rounded-xl border border-blue-100 flex gap-2">
                <AlertTriangle size={16} className="shrink-0" />
                <p>请粘贴从旧设备复制的代码。<b>警告：这将覆盖当前的星星数量！</b></p>
              </div>

              <textarea
                value={importCode}
                onChange={(e) => {
                  setImportCode(e.target.value);
                  setImportStatus('idle');
                }}
                placeholder="在此长按粘贴存档代码..."
                className={`w-full h-40 bg-slate-50 border-2 rounded-2xl p-4 text-[10px] font-mono resize-none focus:outline-none transition-colors ${
                  importStatus === 'error' ? 'border-red-300 bg-red-50 text-red-600' : 'border-slate-200 focus:border-indigo-300 text-slate-800'
                }`}
              />

              {importStatus === 'error' && (
                <p className="text-xs text-red-500 font-bold text-center">❌ 代码格式错误，请检查是否复制完整</p>
              )}
              
              {importStatus === 'success' && (
                <p className="text-xs text-green-500 font-bold text-center">✅ 导入成功！正在刷新...</p>
              )}

              <button
                onClick={handleImport}
                disabled={!importCode || importStatus === 'success'}
                className="w-full bg-slate-800 text-white py-3.5 rounded-xl font-black flex items-center justify-center gap-2 shadow-lg shadow-slate-200 hover:bg-slate-900 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
              >
                <Download size={18} /> 确认覆盖并导入
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
