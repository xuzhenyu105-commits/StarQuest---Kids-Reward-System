import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Download, Upload, Cloud, AlertCircle } from 'lucide-react';

interface DataSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DataSyncModal: React.FC<DataSyncModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [saveCode, setSaveCode] = useState('');
  const [importCode, setImportCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && activeTab === 'export') {
      generateSaveCode();
    }
  }, [isOpen, activeTab]);

  const generateSaveCode = () => {
    const data = {
      points: localStorage.getItem('sq_points_v4'),
      lifetime: localStorage.getItem('sq_lifetime_v4'),
      tasks: localStorage.getItem('sq_tasks_v4'),
      timestamp: Date.now()
    };
    const jsonStr = JSON.stringify(data);
    const encoded = btoa(unescape(encodeURIComponent(jsonStr)));
    setSaveCode(encoded);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(saveCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = () => {
    setError('');
    try {
      if (!importCode.trim()) {
        setError('请输入存档代码');
        return;
      }
      const decoded = decodeURIComponent(escape(atob(importCode)));
      const data = JSON.parse(decoded);

      if (data.points === undefined || data.tasks === undefined) {
        throw new Error('存档格式错误');
      }

      if (window.confirm('确认导入存档吗？这将覆盖当前所有进度并刷新页面。')) {
        localStorage.setItem('sq_points_v4', data.points);
        localStorage.setItem('sq_lifetime_v4', data.lifetime || '0');
        localStorage.setItem('sq_tasks_v4', data.tasks);
        window.location.reload();
      }
    } catch (e) {
      setError('无效的存档代码，请检查是否完整复制。');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Cloud size={24} />
            <h2 className="text-xl font-black">数据同步</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-1 flex bg-slate-100 mx-6 mt-6 rounded-2xl">
          <button 
            onClick={() => setActiveTab('export')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'export' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
          >
            <Download size={16} /> 导出存档
          </button>
          <button 
            onClick={() => setActiveTab('import')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'import' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
          >
            <Upload size={16} /> 导入存档
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'export' ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-500 font-medium">
                复制下方的代码，可以粘贴到其他设备上恢复你的进度。
              </p>
              <div className="relative group">
                <textarea 
                  readOnly 
                  value={saveCode}
                  className="w-full h-32 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[10px] font-mono break-all focus:outline-none focus:border-indigo-200 transition-all resize-none"
                />
                <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <span className="bg-white px-4 py-2 rounded-full shadow-lg text-indigo-600 font-bold text-xs">
                    存档码已生成
                  </span>
                </div>
              </div>
              <button 
                onClick={handleCopy}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 active:scale-95 transition-all"
              >
                {copied ? <><Check size={18} /> 已复制到剪贴板</> : <><Copy size={18} /> 一键复制存档码</>}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-500 font-medium">
                粘贴你在其他设备上导出的存档代码。
              </p>
              <textarea 
                value={importCode}
                onChange={(e) => {
                  setImportCode(e.target.value);
                  setError('');
                }}
                placeholder="在此粘贴存档码..."
                className={`w-full h-32 p-4 bg-slate-50 border-2 rounded-2xl text-[10px] font-mono break-all focus:outline-none transition-all resize-none ${error ? 'border-rose-200 bg-rose-50' : 'border-slate-100 focus:border-indigo-200'}`}
              />
              {error && (
                <div className="flex items-center gap-2 text-rose-500 text-xs font-bold animate-in fade-in slide-in-from-left-2">
                  <AlertCircle size={14} /> {error}
                </div>
              )}
              <button 
                onClick={handleImport}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 active:scale-95 transition-all"
              >
                <Check size={18} /> 确认导入并刷新
              </button>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 text-center">
          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
            StarQuest Cloud Sync v1.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataSyncModal;
