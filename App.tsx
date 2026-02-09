import React, { useState, useEffect } from 'react';
import { Star, Gift, Trophy, Settings, Upload, Download, Copy, Check, RotateCcw } from 'lucide-react';

// 预设的鼓励语录
const PRAISES = [
  "太棒了！你真是个小天才！🌟",
  "哇！今天的表现简直完美！🔥",
  "继续保持！星星在向你招手！✨",
  "超级给力！为你感到骄傲！🚀",
  "努力总会有回报的！加油！💪"
];

interface HistoryItem {
  id: number;
  type: 'add' | 'redeem';
  amount: number;
  reason: string;
  timestamp: string;
}

interface RewardItem {
  id: number;
  name: string;
  cost: number;
  icon: string;
}

const REWARDS: RewardItem[] = [
  { id: 1, name: '小礼品 (文具/贴纸)', cost: 5, icon: '🎁' },
  { id: 2, name: '看电视 30 分钟', cost: 15, icon: '📺' },
  { id: 3, name: '周末吃大餐', cost: 50, icon: '🍕' },
  { id: 4, name: '心仪玩具一个', cost: 100, icon: '🧸' },
];

function App() {
  // 🛡️ 安全核心：在网页启动的一瞬间，先读取数据，再决定初始值
  // 这样绝对不会把原来的数据覆盖成 0
  const [stars, setStars] = useState(() => {
    try {
      const saved = localStorage.getItem('stars');
      return saved ? parseInt(saved) : 0;
    } catch (e) {
      return 0;
    }
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [showSettings, setShowSettings] = useState(false);
  const [importCode, setImportCode] = useState('');

  // 保存数据到本地 (只有当星星发生变化时才保存)
  useEffect(() => {
    localStorage.setItem('stars', stars.toString());
    localStorage.setItem('history', JSON.stringify(history));
  }, [stars, history]);

  // 添加星星
  const addStar = () => {
    const newStars = stars + 1;
    setStars(newStars);
    const randomPraise = PRAISES[Math.floor(Math.random() * PRAISES.length)];
    const newItem: HistoryItem = {
      id: Date.now(),
      type: 'add',
      amount: 1,
      reason: '完成任务',
      timestamp: new Date().toLocaleTimeString(),
    };
    setHistory([newItem, ...history]);
    // 去掉alert，体验更好
    // alert(randomPraise); 
  };

  // 兑换奖励
  const redeemReward = (reward: RewardItem) => {
    if (stars >= reward.cost) {
      if (confirm(`确定要消耗 ${reward.cost} 颗星星兑换 "${reward.name}" 吗？`)) {
        setStars(stars - reward.cost);
        const newItem: HistoryItem = {
          id: Date.now(),
          type: 'redeem',
          amount: reward.cost,
          reason: `兑换: ${reward.name}`,
          timestamp: new Date().toLocaleTimeString(),
        };
        setHistory([newItem, ...history]);
      }
    } else {
      alert("星星不够哦！继续加油！");
    }
  };

  // 导出数据
  const handleExport = () => {
    const data = JSON.stringify({ stars, history });
    const encoded = btoa(encodeURIComponent(data));
    navigator.clipboard.writeText(encoded).then(() => {
      alert("✅ 存档代码已复制！\n请通过微信/QQ发送给手机。");
    });
  };

  // 导入数据
  const handleImport = () => {
    try {
      if (!importCode) return;
      const decoded = decodeURIComponent(atob(importCode));
      const data = JSON.parse(decoded);
      
      if (typeof data.stars === 'number' && Array.isArray(data.history)) {
        if(confirm(`检测到存档：\n⭐ 星星：${data.stars} 颗\n\n确定要覆盖当前数据吗？`)){
             localStorage.setItem('stars', data.stars.toString());
             localStorage.setItem('history', JSON.stringify(data.history));
             alert("导入成功！");
             window.location.reload();
        }
      } else {
        alert("无效的存档代码！");
      }
    } catch (e) {
      alert("导入失败，请检查代码是否完整！");
    }
  };

  const handleReset = () => {
    if (confirm("⚠️ 警告：确定要清空所有数据吗？")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-10">
      <div className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" /> StarQuest
        </h1>
        <button 
          onClick={() => setShowSettings(true)}
          className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition"
        >
          <Settings className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white text-center shadow-lg transform transition hover:scale-105 duration-300">
          <div className="text-indigo-100 text-sm font-medium mb-2 uppercase tracking-wider">当前拥有星星</div>
          <div className="text-6xl font-extrabold flex justify-center items-center gap-2 mb-4 drop-shadow-md">
            {stars} <Star className="w-12 h-12 text-yellow-300 fill-yellow-300 animate-pulse" />
          </div>
          <button 
            onClick={addStar}
            className="bg-white text-indigo-600 font-bold py-3 px-8 rounded-full shadow-md hover:bg-indigo-50 active:scale-95 transition flex items-center gap-2 mx-auto"
          >
            <Check className="w-5 h-5" /> 完成任务 +1
          </button>
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-pink-500" /> 兑换奖励
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {REWARDS.map(reward => (
              <div key={reward.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center transition hover:shadow-md">
                <div className="text-4xl mb-2">{reward.icon}</div>
                <div className="font-bold text-slate-800 mb-1">{reward.name}</div>
                <div className="text-sm text-slate-500 mb-3">{reward.cost} ⭐️</div>
                <button
                  onClick={() => redeemReward(reward)}
                  disabled={stars < reward.cost}
                  className={`w-full py-2 rounded-lg text-sm font-bold transition ${
                    stars >= reward.cost 
                      ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  兑换
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg">设置与同步</h3>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <Upload className="w-4 h-4" /> 导出存档 (旧设备)
                </label>
                <p className="text-xs text-slate-500 mb-2">复制下方代码，发送给新设备：</p>
                <button onClick={handleExport} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition">
                  <Copy className="w-4 h-4" /> 复制存档代码
                </button>
              </div>
              <hr className="border-slate-100" />
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <Download className="w-4 h-4" /> 导入存档 (新设备)
                </label>
                <textarea 
                  value={importCode}
                  onChange={(e) => setImportCode(e.target.value)}
                  placeholder="在此粘贴存档代码..."
                  className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-24 mb-2"
                />
                <button onClick={handleImport} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition">
                  确认导入
                </button>
              </div>
               <hr className="border-slate-100" />
               <button onClick={handleReset} className="w-full text-red-500 text-sm flex items-center justify-center gap-1 hover:bg-red-50 py-2 rounded">
                 <RotateCcw className="w-3 h-3" /> 清空数据
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
