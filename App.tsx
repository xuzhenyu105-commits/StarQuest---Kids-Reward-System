import React, { useState, useEffect, useCallback } from 'react';
import { Task, Reward, Tab } from './types';
import TaskList from './components/TaskList';
import RewardShop from './components/RewardShop';
// ❌ 删除：不再引入 Coach 组件
// import Coach from './components/Coach'; 
import DataSyncModal from './components/DataSyncModal';
import { Trophy, CheckSquare, ShoppingBag, Star, Sparkles, RefreshCcw, Cloud } from 'lucide-react';

const INITIAL_TASKS: Task[] = [
  { id: '1', title: '背诵古诗一首', points: 5, icon: '🏮', isCompleted: false, category: 'daily', module: 'chinese' },
  { id: '2', title: '口算练习 20 道', points: 5, icon: '📐', isCompleted: false, category: 'daily', module: 'math' },
  { id: '3', title: '英语绘本阅读', points: 5, icon: '🔤', isCompleted: false, category: 'daily', module: 'english' },
  { id: '4', title: '跳绳 500 下', points: 5, icon: '🏃', isCompleted: false, category: 'daily', module: 'sports' },
];

const INITIAL_REWARDS: Reward[] = [
  { id: '1', title: '小礼品 (文具/贴纸)', cost: 5, icon: '🎁' },
  { id: '2', title: '看电视 30 分钟', cost: 15, icon: '📺' },
  { id: '3', title: '周末吃大餐', cost: 50, icon: '🍕' },
  { id: '4', title: '心仪玩具一个', cost: 100, icon: '🧸' },
];

function App() {
  const [points, setPoints] = useState<number>(0);
  const [lifetimePoints, setLifetimePoints] = useState<number>(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [rewards, setRewards] = useState<Reward[]>(INITIAL_REWARDS);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.TASKS);
  const [animatePoints, setAnimatePoints] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [dayKey, setDayKey] = useState(0);

  // 1. 初始化加载
  useEffect(() => {
    const savedPoints = localStorage.getItem('sq_points_v4');
    const savedLifetime = localStorage.getItem('sq_lifetime_v4');
    const savedTasks = localStorage.getItem('sq_tasks_v4');
    
    if (savedPoints) setPoints(Number(savedPoints));
    if (savedLifetime) setLifetimePoints(Number(savedLifetime));
    
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        setTasks(parsedTasks.length > 0 ? parsedTasks : [...INITIAL_TASKS]);
      } catch (e) {
        setTasks([...INITIAL_TASKS]);
      }
    } else {
      setTasks([...INITIAL_TASKS]);
    }
    setIsLoaded(true);
  }, []);

  // 2. 统一持久化逻辑
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('sq_points_v4', points.toString());
    localStorage.setItem('sq_lifetime_v4', lifetimePoints.toString());
    localStorage.setItem('sq_tasks_v4', JSON.stringify(tasks));
  }, [points, lifetimePoints, tasks, isLoaded]);

  const handleCompleteTask = useCallback((task: Task) => {
    if (task.isCompleted) return;
    
    setPoints(prev => prev + task.points);
    setLifetimePoints(prev => prev + task.points);
    
    setAnimatePoints(true);
    setTimeout(() => setAnimatePoints(false), 800);

    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, isCompleted: true } : t));
  }, []);

  const handleAddTask = useCallback((newTask: Task) => {
    setTasks(prev => [newTask, ...prev]);
  }, []);
  
  const handleDeleteTask = useCallback((id: string) => {
    if (window.confirm("确定要删除这个任务吗？")) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  }, []);
  
  const handleRedeemReward = useCallback((reward: Reward) => {
    setPoints(prevPoints => {
      if (prevPoints >= reward.cost) {
        if (window.confirm(`确认兑换 "${reward.title}" 吗？将消耗 ${reward.cost} 星星。`)) {
          return prevPoints - reward.cost;
        }
      } else {
        alert("星星还不够哦，加油做任务吧！");
      }
      return prevPoints;
    });
  }, []);

  const resetDailyTasks = () => {
    if (window.confirm("确认开启新的一天？\n清单中所有已完成的任务将恢复为“待完成”状态。")) {
      setTasks(prevTasks => {
        return prevTasks.map(task => ({
          ...task,
          isCompleted: false 
        }));
      });
      setDayKey(prev => prev + 1);
      setAnimatePoints(true);
      setTimeout(() => setAnimatePoints(false), 600);
      setActiveTab(Tab.TASKS);
    }
  };

  return (
    <div className="min-h-screen bg-sky-50 max-w-md mx-auto shadow-2xl overflow-hidden flex flex-col relative pb-20">
      <header className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white p-6 rounded-b-[3.5rem] shadow-xl relative z-10 border-b-4 border-indigo-400/20">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md border border-white/10">
                <Trophy className="text-yellow-300" size={22} strokeWidth={2.5} />
            </div>
            <div>
                <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest leading-none mb-1">总累计星星</p>
                <p className="text-lg font-black text-white leading-none">{lifetimePoints} <span className="text-xs font-normal opacity-80">颗</span></p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button 
              onClick={resetDailyTasks} 
              className="flex items-center gap-2 text-[11px] bg-white text-indigo-700 px-4 py-2 rounded-xl font-black shadow-lg active:scale-95 transition-all border-b-4 border-slate-200 active:border-b-0 active:translate-y-1"
            >
              <RefreshCcw size={14} strokeWidth={3} className={animatePoints ? 'animate-spin' : ''} /> 新的一天
            </button>
            <button 
              onClick={() => setIsSyncModalOpen(true)}
              className="flex items-center gap-2 text-[11px] bg-indigo-500/30 text-white px-4 py-2 rounded-xl font-black backdrop-blur-sm border border-white/10 hover:bg-indigo-500/50 active:scale-95 transition-all"
            >
              <Cloud size={14} strokeWidth={3} /> 数据同步
            </button>
          </div>
        </div>
        
        <div className="flex flex-col items-center py-4">
          <div className={`relative transition-all duration-500 ${animatePoints ? 'scale-110' : 'scale-100'}`}>
             <div className="text-8xl font-black text-white drop-shadow-[0_8px_0_rgba(0,0,0,0.1)] flex items-center gap-2">
                {points}
                <Star className="text-yellow-300 fill-yellow-300 drop-shadow-[0_4px_10px_rgba(253,224,71,0.5)]" size={54} strokeWidth={2.5} />
             </div>
             {animatePoints && (
               <div className="absolute -top-8 -right-8 animate-bounce">
                 <Sparkles className="text-yellow-200" size={48} />
               </div>
             )}
          </div>
          <div className="mt-4 bg-black/10 backdrop-blur-sm px-5 py-1.5 rounded-full border border-white/5">
            <p className="text-indigo-100 font-black tracking-[0.2em] text-[10px] uppercase">可用星星</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pt-8">
        {activeTab === Tab.TASKS && (
          <div className="space-y-4">
             <div className="flex items-center justify-between px-2">
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                    <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
                      <CheckSquare size={18} strokeWidth={3} />
                    </div>
                    任务大厅
                </h2>
             </div>
             <TaskList 
                key={`reset-key-${dayKey}`}
                tasks={tasks} 
                onCompleteTask={handleCompleteTask} 
                onAddTask={handleAddTask}
                onDeleteTask={handleDeleteTask}
             />
          </div>
        )}

        {activeTab === Tab.REWARDS && (
          <div className="animate-in fade-in zoom-in-95 duration-300">
             <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                    <div className="bg-pink-500 p-1.5 rounded-lg text-white">
                      <ShoppingBag size={18} strokeWidth={3}/>
                    </div>
                    星星小铺
                </h2>
                <div className="bg-pink-100 text-pink-600 px-4 py-1 rounded-full font-black text-xs border-2 border-pink-200">
                    5星起兑
                </div>
             </div>
             <RewardShop 
                rewards={rewards} 
                userPoints={points} 
                onRedeem={handleRedeemReward} 
             />
          </div>
        )}

        {/* ❌ 删除：移除了 COACH 页面的渲染逻辑 */}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-slate-100 px-6 py-4 flex justify-around items-center z-50 rounded-t-[2.5rem] shadow-[0_-15px_30px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => setActiveTab(Tab.TASKS)}
          className={`flex flex-col items-center gap-1.5 transition-all group ${activeTab === Tab.TASKS ? 'text-indigo-600' : 'text-slate-300'}`}
        >
          <div className={`p-3 rounded-2xl transition-all ${activeTab === Tab.TASKS ? 'bg-indigo-50 shadow-inner' : 'group-hover:bg-slate-50'}`}>
            <CheckSquare size={26} strokeWidth={activeTab === Tab.TASKS ? 3 : 2} />
          </div>
          <span className={`text-[11px] font-black uppercase tracking-tight transition-all ${activeTab === Tab.TASKS ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
            做任务
          </span>
        </button>

        <button 
          onClick={() => setActiveTab(Tab.REWARDS)}
          className={`flex flex-col items-center gap-1.5 transition-all group ${activeTab === Tab.REWARDS ? 'text-pink-500' : 'text-slate-300'}`}
        >
          <div className={`p-3 rounded-2xl transition-all ${activeTab === Tab.REWARDS ? 'bg-pink-50 shadow-inner' : 'group-hover:bg-slate-50'}`}>
            <ShoppingBag size={26} strokeWidth={activeTab === Tab.REWARDS ? 3 : 2} />
          </div>
          <span className={`text-[11px] font-black uppercase tracking-tight transition-all ${activeTab === Tab.REWARDS ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
            兑礼品
          </span>
        </button>

        {/* ❌ 删除：移除了底部“问专家”的按钮 */}
      </nav>

      <DataSyncModal isOpen={isSyncModalOpen} onClose={() => setIsSyncModalOpen(false)} />
    </div>
  );
}

export default App;
