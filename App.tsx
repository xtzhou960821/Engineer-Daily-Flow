import React, { useState, useEffect } from 'react';
import { INITIAL_SCHEDULE } from './constants';
import { ScheduleBlock } from './types';
import ScheduleCard from './components/ScheduleCard';
import TopPriorities from './components/TopPriorities';
import DailyAnalysis from './components/DailyAnalysis';
import ChatBot from './components/ChatBot';
import { CalendarDays, Sun, RotateCcw } from 'lucide-react';

const SCHEDULE_STORAGE_KEY = 'engineer-daily-schedule-v1';

const App: React.FC = () => {
  const [schedule, setSchedule] = useState<ScheduleBlock[]>(() => {
    try {
      const saved = localStorage.getItem(SCHEDULE_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_SCHEDULE;
    } catch (e) {
      console.error("Failed to load schedule", e);
      return INITIAL_SCHEDULE;
    }
  });

  const [progress, setProgress] = useState(0);

  // Save to localStorage whenever schedule changes
  useEffect(() => {
    localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(schedule));
  }, [schedule]);

  // Calculate progress
  useEffect(() => {
    let totalSubTasks = 0;
    let completedSubTasks = 0;

    schedule.forEach(block => {
      block.subTasks.forEach(task => {
        totalSubTasks++;
        if (task.completed) completedSubTasks++;
      });
    });

    const newProgress = totalSubTasks === 0 ? 0 : Math.round((completedSubTasks / totalSubTasks) * 100);
    setProgress(newProgress);
  }, [schedule]);

  const handleToggleSubTask = (blockId: string, subTaskId: string) => {
    setSchedule(prev => prev.map(block => {
      if (block.id !== blockId) return block;
      
      return {
        ...block,
        subTasks: block.subTasks.map(task => 
          task.id === subTaskId ? { ...task, completed: !task.completed } : task
        )
      };
    }));
  };

  const handleUpdateBlock = (updatedBlock: ScheduleBlock) => {
    setSchedule(prev => prev.map(block => 
      block.id === updatedBlock.id ? updatedBlock : block
    ));
  };

  const handleReset = () => {
    if (confirm('确定要重置所有日程为默认模板吗？这将丢失你的自定义修改。')) {
      setSchedule(INITIAL_SCHEDULE);
    }
  };

  const currentDate = new Date().toLocaleDateString('zh-CN', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Sun className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">工程师的一天</h1>
              <p className="text-xs text-slate-500 font-mono">{currentDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex flex-col items-end">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">完成度</span>
                <span className="font-bold text-indigo-600">{progress}%</span>
             </div>
             <div className="w-12 h-12 relative flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-100" />
                  <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={126} strokeDashoffset={126 - (126 * progress) / 100} className="text-indigo-600 transition-all duration-500 ease-out" />
                </svg>
             </div>
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-6">
        
        {/* Top Section: Priorities */}
        <TopPriorities />

        {/* Introduction Quote */}
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-8 rounded-r-lg">
          <p className="text-orange-800 text-sm italic">
            "5:30 起床不只是为了早起，而是为了掌控生活。今天也要高效完成现场验收和用户模块开发！"
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
           <div className="flex items-center justify-between mb-6">
             <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
               <CalendarDays className="w-5 h-5 text-slate-400" />
               日程清单
             </h2>
             <button 
               onClick={handleReset}
               className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
             >
               <RotateCcw className="w-3 h-3" /> 重置默认
             </button>
           </div>
           
           <div className="space-y-0">
             {schedule.map((block, index) => (
               <ScheduleCard 
                 key={block.id} 
                 block={block} 
                 isLast={index === schedule.length - 1}
                 onToggleSubTask={handleToggleSubTask}
                 onUpdateBlock={handleUpdateBlock}
               />
             ))}
           </div>
        </div>

        {/* Analytics */}
        <DailyAnalysis />
        
        {/* Footer */}
        <footer className="mt-12 text-center text-slate-400 text-xs pb-6">
          <p>持续行动，每日精进</p>
          <p className="mt-1 font-mono">Build v1.1.0</p>
        </footer>

      </main>

      {/* AI Chat Bot */}
      <ChatBot />
    </div>
  );
};

export default App;