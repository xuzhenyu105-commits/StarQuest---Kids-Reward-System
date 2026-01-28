import React, { useState, useMemo } from 'react';
import { Task, TaskModule } from '../types';
import { CheckCircle2, Sparkles, Plus, Trash2, BookOpen, Calculator, Globe, Trophy, ListChecks, Calendar, Zap, X, ArrowUpDown, Clock, LayoutGrid, ArrowUpNarrowWide, ArrowDownWideNarrow } from 'lucide-react';
import { breakDownTask } from '../services/geminiService';

interface TaskListProps {
  tasks: Task[];
  onCompleteTask: (task: Task) => void;
  onAddTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

type SortOption = 'date-newest' | 'date-oldest' | 'points-desc' | 'points-asc' | 'module';

const MODULE_CONFIG: Record<TaskModule, { label: string; icon: React.ReactNode; color: string; bgColor: string; borderColor: string; emoji: string }> = {
  chinese: { label: '语文', icon: <BookOpen size={18} />, color: 'text-rose-600', bgColor: 'bg-rose-50', borderColor: 'border-rose-100', emoji: '🏮' },
  math: { label: '数学', icon: <Calculator size={18} />, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-100', emoji: '📐' },
  english: { label: '英语', icon: <Globe size={18} />, color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-100', emoji: '🔤' },
  sports: { label: '体育', icon: <Trophy size={18} />, color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-100', emoji: '🏃' },
  general: { label: '通用', icon: <ListChecks size={18} />, color: 'text-indigo-600', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-100', emoji: '⭐' },
};

const TaskList: React.FC<TaskListProps> = ({ tasks, onCompleteTask, onAddTask, onDeleteTask }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPoints, setNewTaskPoints] = useState(5);
  const [selectedModule, setSelectedModule] = useState<TaskModule>('general');
  const [taskCategory, setTaskCategory] = useState<'daily' | 'one-time'>('daily');
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState<TaskModule | 'all'>('all');
  const [sortOption, setSortOption] = useState<SortOption>('date-newest');

  const handleManualAdd = () => {
    if (!newTaskTitle.trim()) return;
    const task: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      points: newTaskPoints,
      icon: MODULE_CONFIG[selectedModule].emoji,
      isCompleted: false,
      category: taskCategory,
      module: selectedModule
    };
    onAddTask(task);
    setNewTaskTitle('');
    setShowAddForm(false);
  };

  const handleMagicBreakdown = async () => {
    if (!newTaskTitle.trim()) return;
    setIsBreakingDown(true);
    try {
      const result = await breakDownTask(newTaskTitle, selectedModule);
      if (result.suggestedTasks) {
        result.suggestedTasks.forEach((t, index) => {
          onAddTask({
            id: (Date.now() + index).toString(),
            title: t.title,
            points: t.points,
            icon: MODULE_CONFIG[selectedModule].emoji,
            isCompleted: false,
            category: 'one-time',
            module: selectedModule
          });
        });
        setNewTaskTitle('');
        setShowAddForm(false);
        setActiveFilter(selectedModule);
      }
    } catch (e) {
      alert("AI 拆解失败，请稍后再试。");
    } finally {
      setIsBreakingDown(false);
    }
  };

  const sortedAndFilteredTasks = useMemo(() => {
    // 1. First Filter
    let result = tasks.filter(task => {
      if (activeFilter === 'all') return true;
      return task.module === activeFilter;
    });

    // 2. Then Sort
    result = [...result].sort((a, b) => {
      // Completed tasks always go to the bottom
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }

      switch (sortOption) {
        case 'points-desc':
          return b.points - a.points;
        case 'points-asc':
          return a.points - b.points;
        case 'date-newest':
          return Number(b.id) - Number(a.id);
        case 'date-oldest':
          return Number(a.id) - Number(b.id);
        case 'module':
          return a.module.localeCompare(b.module);
        default:
          return 0;
      }
    });

    return result;
  }, [tasks, activeFilter, sortOption]);

  return (
    <div className="space-y-6 pb-20">
      {/* Module Quick Filter & Sort Controls */}
      <div className="space-y-3 px-1">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition-all border-2 text-sm ${
              activeFilter === 'all' ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-gray-100 text-gray-500'
            }`}
          >
            全部
          </button>
          {(Object.keys(MODULE_CONFIG) as TaskModule[]).map((m) => (
            <button
              key={m}
              onClick={() => setActiveFilter(m)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold whitespace-nowrap transition-all border-2 text-sm ${
                activeFilter === m 
                  ? `${MODULE_CONFIG[m].bgColor} ${MODULE_CONFIG[m].borderColor} ${MODULE_CONFIG[m].color} shadow-md` 
                  : 'bg-white border-gray-100 text-gray-400'
              }`}
            >
              {MODULE_CONFIG[m].icon} {MODULE_CONFIG[m].label}
            </button>
          ))}
        </div>

        {/* Sort Controls Area */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center gap-1.5 text-slate-400 mr-1 shrink-0">
             <ArrowUpDown size={14} strokeWidth={3} />
             <span className="text-[10px] font-black uppercase tracking-widest">排序方式:</span>
          </div>
          <div className="flex gap-2 bg-slate-100/50 p-1 rounded-2xl border border-slate-100">
             <button 
                onClick={() => setSortOption('date-newest')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${sortOption === 'date-newest' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
             >
                <Clock size={14} /> 最新
             </button>
             <button 
                onClick={() => setSortOption('points-desc')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${sortOption === 'points-desc' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-400'}`}
             >
                <ArrowDownWideNarrow size={14} /> 星星高
             </button>
             <button 
                onClick={() => setSortOption('points-asc')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${sortOption === 'points-asc' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
             >
                <ArrowUpNarrowWide size={14} /> 星星低
             </button>
             <button 
                onClick={() => setSortOption('module')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${sortOption === 'module' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-400'}`}
             >
                <LayoutGrid size={14} /> 按模块
             </button>
          </div>
        </div>
      </div>

      {/* Add Task Form */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border-2 border-indigo-50 mx-1">
        {!showAddForm ? (
          <button 
            onClick={() => setShowAddForm(true)}
            className="w-full py-4 flex items-center justify-center gap-2 text-indigo-600 font-bold bg-indigo-50 hover:bg-indigo-100 rounded-2xl transition-all active:scale-[0.98]"
          >
            <Plus size={24} /> 添加新任务模块
          </button>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
             <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-gray-800">设置任务内容</h3>
                <button onClick={() => setShowAddForm(false)} className="p-1 text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
             </div>
             
             {/* Module Selector in Form */}
             <div className="grid grid-cols-5 gap-1 bg-gray-50 p-1 rounded-2xl">
                {(Object.keys(MODULE_CONFIG) as TaskModule[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedModule(m)}
                    className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all ${
                      selectedModule === m 
                        ? `${MODULE_CONFIG[m].bgColor} ${MODULE_CONFIG[m].borderColor} ${MODULE_CONFIG[m].color}` 
                        : 'border-transparent text-gray-300'
                    }`}
                  >
                    {MODULE_CONFIG[m].icon}
                    <span className="text-[10px] mt-1 font-bold">{MODULE_CONFIG[m].label}</span>
                  </button>
                ))}
             </div>

            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="例如：背诵《咏鹅》、跳绳10分钟"
              className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-indigo-200 focus:bg-white rounded-2xl outline-none transition-all font-medium"
            />
            
            <div className="flex flex-col gap-3 px-1">
              <div className="flex items-center justify-between">
                 <span className="text-xs font-black text-gray-400 uppercase tracking-widest">任务类型:</span>
                 <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                   <button 
                    onClick={() => setTaskCategory('daily')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${taskCategory === 'daily' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}
                   >
                     <Calendar size={12} /> 日常重复
                   </button>
                   <button 
                    onClick={() => setTaskCategory('one-time')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${taskCategory === 'one-time' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400'}`}
                   >
                     <Zap size={12} /> 一次性
                   </button>
                 </div>
              </div>

              <div className="flex items-center justify-between">
                 <span className="text-xs font-black text-gray-400 uppercase tracking-widest">奖励星星:</span>
                 <div className="flex gap-1">
                   {[1, 2, 5, 10].map(p => (
                     <button
                      key={p}
                      onClick={() => setNewTaskPoints(p)}
                      className={`w-10 h-10 rounded-xl font-black transition-all ${newTaskPoints === p ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                     >
                       {p}
                     </button>
                   ))}
                 </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={handleManualAdd}
                disabled={isBreakingDown || !newTaskTitle.trim()}
                className="flex-[1.5] bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-200 active:scale-95 transition-all disabled:opacity-50"
              >
                直接添加
              </button>
              <button 
                onClick={handleMagicBreakdown}
                disabled={isBreakingDown || !newTaskTitle.trim()}
                className="flex-1 bg-gradient-to-br from-purple-500 to-indigo-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-purple-200 active:scale-95 transition-all disabled:opacity-50"
              >
                {isBreakingDown ? <div className="animate-spin text-lg">✨</div> : <><Sparkles size={18} /> AI拆解</>}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Task List Rendering */}
      <div className="space-y-4 px-1">
        {sortedAndFilteredTasks.length === 0 && (
          <div className="text-center py-16 bg-white/50 rounded-3xl border-2 border-dashed border-gray-200">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
               <ListChecks size={40} />
            </div>
            <p className="text-gray-400 font-bold">暂时没有任务，快去添加吧！</p>
          </div>
        )}
        
        {sortedAndFilteredTasks.map((task) => {
          const config = MODULE_CONFIG[task.module];
          return (
            <div 
              key={task.id}
              className={`group flex items-center justify-between p-5 rounded-[2rem] border-2 transition-all duration-300 ${
                task.isCompleted 
                  ? 'bg-slate-50 border-slate-100 opacity-60 scale-95' 
                  : `bg-white ${config.borderColor} shadow-sm hover:shadow-md hover:-translate-y-0.5`
              }`}
            >
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => onCompleteTask(task)}
                  className={`transition-all active:scale-75 flex-shrink-0 ${task.isCompleted ? 'text-emerald-500' : 'text-gray-200 hover:text-indigo-200'}`}
                >
                  <CheckCircle2 size={42} strokeWidth={task.isCompleted ? 2.5 : 2} />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-2xl flex-shrink-0">{task.icon}</span>
                    <h4 className={`font-bold text-gray-800 truncate text-lg ${task.isCompleted ? 'line-through text-gray-400' : ''}`}>
                      {task.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full ${config.bgColor} ${config.color}`}>
                      {config.label}
                    </span>
                    <span className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full ${task.category === 'daily' ? 'bg-indigo-50 text-indigo-500' : 'bg-orange-50 text-orange-500'}`}>
                      {task.category === 'daily' ? '每日重复' : '一次性'}
                    </span>
                    <span className="text-[10px] font-black text-yellow-600 bg-yellow-100/50 px-2 py-0.5 rounded-full">
                      +{task.points} ⭐
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => onDeleteTask(task.id)} 
                className="opacity-0 group-hover:opacity-100 text-gray-200 hover:text-rose-500 transition-all p-2 rounded-xl hover:bg-rose-50"
              >
                <Trash2 size={20} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskList;