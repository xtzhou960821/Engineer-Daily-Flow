
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { INITIAL_SCHEDULE, INITIAL_PRIORITIES } from './constants';
import { ScheduleBlock, Priority, HistoryData, DailyData, ActivityType } from './types';
import ScheduleCard from './components/ScheduleCard';
import TopPriorities from './components/TopPriorities';
import DailyAnalysis from './components/DailyAnalysis';
import ChatBot from './components/ChatBot';
import { CalendarDays, Sun, RotateCcw, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Briefcase } from 'lucide-react';

const HISTORY_STORAGE_KEY = 'engineer-daily-history-v1';

// Helper to get YYYY-MM-DD string
// Local timezone safe approach
const getFormattedDate = (date: Date): string => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
};

const App: React.FC = () => {
  // --- Date State ---
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const dateInputRef = useRef<HTMLInputElement>(null);
  
  // --- Data State ---
  // We load the entire history object.
  // Structure: { "2023-12-09": { schedule: [], priorities: [] }, ... }
  const [history, setHistory] = useState<HistoryData>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
      return {};
    } catch (e) {
      console.error("Failed to load history", e);
      return {};
    }
  });

  // Derived state for the CURRENT view based on selectedDate
  const dateKey = getFormattedDate(selectedDate);
  
  const currentData: DailyData = useMemo(() => {
    if (history[dateKey]) {
      return history[dateKey];
    }
    // If no data for this date, return default templates
    return {
      schedule: INITIAL_SCHEDULE,
      priorities: INITIAL_PRIORITIES,
      lastUpdated: Date.now()
    };
  }, [history, dateKey]);

  // Persist history whenever it changes
  useEffect(() => {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  // --- Helpers to update state ---
  
  const updateHistory = (newSchedule: ScheduleBlock[], newPriorities: Priority[]) => {
    setHistory(prev => ({
      ...prev,
      [dateKey]: {
        schedule: newSchedule,
        priorities: newPriorities,
        lastUpdated: Date.now()
      }
    }));
  };

  const updateSchedule = (newSchedule: ScheduleBlock[]) => {
    updateHistory(newSchedule, currentData.priorities);
  };

  const updatePriorities = (newPriorities: Priority[]) => {
    updateHistory(currentData.schedule, newPriorities);
  };


  // --- Event Handlers ---

  const handleToggleSubTask = (blockId: string, subTaskId: string) => {
    const newSchedule = currentData.schedule.map(block => {
      if (block.id !== blockId) return block;
      return {
        ...block,
        subTasks: block.subTasks.map(task => 
          task.id === subTaskId ? { ...task, completed: !task.completed } : task
        )
      };
    });
    updateSchedule(newSchedule);
  };

  const handleUpdateBlock = (updatedBlock: ScheduleBlock) => {
    const newSchedule = currentData.schedule.map(block => 
      block.id === updatedBlock.id ? updatedBlock : block
    );
    updateSchedule(newSchedule);
  };

  const handleDeleteBlock = (blockId: string) => {
    const newSchedule = currentData.schedule.filter(block => block.id !== blockId);
    updateSchedule(newSchedule);
  };

  const handleAddBlock = () => {
    const newBlock: ScheduleBlock = {
      id: `new-${Date.now()}`,
      timeRange: '00:00 - 01:00',
      title: '新任务',
      type: ActivityType.DEEP_WORK,
      description: '请输入任务描述...',
      subTasks: []
    };
    // Add to the end
    updateSchedule([...currentData.schedule, newBlock]);
  };

  const handleReset = () => {
    if (confirm(`确定要重置 [${dateKey}] 的所有日程为默认模板吗？`)) {
      updateHistory(INITIAL_SCHEDULE, INITIAL_PRIORITIES);
    }
  };

  const navigateDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setSelectedDate(new Date(e.target.value));
    }
  };
  
  const handleCalendarClick = () => {
    // Explicitly open picker for browsers like Chrome/Edge that support showPicker()
    try {
      if (dateInputRef.current && 'showPicker' in dateInputRef.current) {
        // @ts-ignore - TS might not know showPicker yet
        dateInputRef.current.showPicker();
      }
    } catch (e) {
      // Fallback: the overlay input usually handles it for Safari/Mobile
    }
  };

  // --- Progress Calculation ---
  const progress = useMemo(() => {
    let totalSubTasks = 0;
    let completedSubTasks = 0;

    currentData.schedule.forEach(block => {
      block.subTasks.forEach(task => {
        totalSubTasks++;
        if (task.completed) completedSubTasks++;
      });
    });

    return totalSubTasks === 0 ? 0 : Math.round((completedSubTasks / totalSubTasks) * 100);
  }, [currentData.schedule]);


  // Display strings
  const isToday = dateKey === getFormattedDate(new Date());
  const displayDate = selectedDate.toLocaleDateString('zh-CN', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          
          {/* Left: App Title & Date Navigation */}
          <div className="flex items-center gap-3">
            <div 
              onClick={goToToday}
              className={`p-2.5 rounded-xl transition-colors cursor-pointer flex-shrink-0 ${isToday ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'}`}
              title="回到今天"
            >
              <Sun className="w-5 h-5" />
            </div>
            
            <div className="flex flex-col justify-center">
              <h1 className="font-extrabold text-slate-900 text-base sm:text-lg leading-tight tracking-tight mb-0.5">
                桥梁工程师的一天
              </h1>
              
              <div className="flex items-center gap-1">
                 <button onClick={() => navigateDate(-1)} className="p-0.5 -ml-1 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-600 transition-colors">
                   <ChevronLeft className="w-4 h-4" />
                 </button>
                 
                 <div 
                    className="relative group cursor-pointer"
                    onClick={handleCalendarClick}
                 >
                   <div className="text-xs sm:text-sm font-medium text-slate-500 flex items-center gap-1 group-hover:text-indigo-600 transition-colors">
                      <CalendarIcon className="w-3 h-3" />
                      <span>{displayDate}</span> 
                      {/* Show 'History' indicator if not today */}
                      {!isToday && <span className="bg-orange-100 text-orange-600 text-[10px] px-1.5 rounded-full">历史</span>}
                   </div>
                   {/* Hidden Date Input for Native Picker - Overlay Method */}
                   <input 
                      ref={dateInputRef}
                      type="date" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                      value={dateKey}
                      onChange={handleDateChange}
                      title="点击选择日期"
                   />
                 </div>

                 <button onClick={() => navigateDate(1)} className="p-0.5 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-600 transition-colors">
                   <ChevronRight className="w-4 h-4" />
                 </button>
              </div>
            </div>
          </div>

          {/* Right: Progress */}
          <div className="flex items-center gap-3 pl-2">
             <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">完成度</span>
                <span className="font-bold text-indigo-600">{progress}%</span>
             </div>
             <div className="w-10 h-10 sm:w-12 sm:h-12 relative flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="50%" cy="50%" r="42%" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-100" />
                  <circle cx="50%" cy="50%" r="42%" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={126} strokeDashoffset={126 - (126 * progress) / 100} className="text-indigo-600 transition-all duration-500 ease-out" />
                </svg>
             </div>
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-6">
        
        {/* Top Section: Priorities */}
        <TopPriorities 
          items={currentData.priorities} 
          onUpdate={updatePriorities}
        />

        {/* Introduction Quote */}
        <div className={`border-l-4 p-4 mb-8 rounded-r-lg transition-colors ${isToday ? 'bg-orange-50 border-orange-400' : 'bg-slate-100 border-slate-300'}`}>
          <p className={`${isToday ? 'text-orange-800' : 'text-slate-600'} text-sm italic`}>
            {isToday 
              ? '"5:30 起床不只是为了早起，而是为了掌控生活。今天也要高效完成现场验收和用户模块开发！"'
              : `正在回顾 ${dateKey} (${displayDate}) 的日程记录。`
            }
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
           <div className="flex items-center justify-between mb-6">
             <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
               <CalendarDays className="w-5 h-5 text-slate-400" />
               {isToday ? '今日日程' : '历史日程'}
             </h2>
             <button 
               onClick={handleReset}
               className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors px-2 py-1 hover:bg-slate-100 rounded"
             >
               <RotateCcw className="w-3 h-3" /> 重置
             </button>
           </div>
           
           <div className="space-y-0">
             {currentData.schedule.map((block, index) => (
               <ScheduleCard 
                 key={block.id} 
                 block={block} 
                 isLast={index === currentData.schedule.length - 1}
                 onToggleSubTask={handleToggleSubTask}
                 onUpdateBlock={handleUpdateBlock}
                 onDeleteBlock={handleDeleteBlock}
               />
             ))}
           </div>
           
           {/* Add New Block Button */}
           <div className="mt-8 flex justify-center">
             <button 
               onClick={handleAddBlock}
               className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full border border-indigo-200 hover:bg-indigo-100 transition-colors font-medium text-sm"
             >
               <Plus className="w-4 h-4" /> 添加新的时间段
             </button>
           </div>
        </div>

        {/* Analytics - Shows analysis for the SELECTED day */}
        <DailyAnalysis schedule={currentData.schedule} />
        
        {/* Footer */}
        <footer className="mt-12 text-center text-slate-400 text-xs pb-6">
          <p>持续行动，每日精进</p>
          <p className="mt-1 font-mono">Build v1.5.0 (Full Features)</p>
        </footer>

      </main>

      {/* AI Chat Bot */}
      <ChatBot />
    </div>
  );
};

export default App;
