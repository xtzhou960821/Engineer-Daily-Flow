import React, { useState, useEffect } from 'react';
import { Target, CheckCircle2, Circle, Pencil, Check, X } from 'lucide-react';
import { Priority } from '../types';

const STORAGE_KEY = 'engineer-daily-priorities-v1';

const INITIAL_PRIORITIES: Priority[] = [
  { id: 1, text: '桥梁智慧检测现场验收', done: false },
  { id: 2, text: '无人机平台用户模块开发', done: false },
  { id: 3, text: 'API 基础学习', done: false },
];

const TopPriorities: React.FC = () => {
  const [priorities, setPriorities] = useState<Priority[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_PRIORITIES;
    } catch {
      return INITIAL_PRIORITIES;
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedPriorities, setEditedPriorities] = useState<Priority[]>(priorities);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(priorities));
  }, [priorities]);

  const togglePriority = (id: number) => {
    if (isEditing) return;
    setPriorities(prev => prev.map(p => 
      p.id === id ? { ...p, done: !p.done } : p
    ));
  };

  const handleEditChange = (id: number, text: string) => {
    setEditedPriorities(prev => prev.map(p => 
      p.id === id ? { ...p, text } : p
    ));
  };

  const saveEdits = () => {
    setPriorities(editedPriorities);
    setIsEditing(false);
  };

  const startEditing = () => {
    setEditedPriorities(priorities);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl mb-8 relative group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-6 h-6 text-indigo-200" />
          <h2 className="text-xl font-bold tracking-tight">今日最重要的 3 件事</h2>
        </div>
        
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          {isEditing ? (
            <div className="flex gap-2">
               <button onClick={saveEdits} className="bg-white/20 hover:bg-white/30 p-1.5 rounded-lg text-white transition-colors">
                 <Check className="w-5 h-5" />
               </button>
               <button onClick={cancelEditing} className="bg-white/10 hover:bg-white/20 p-1.5 rounded-lg text-white transition-colors">
                 <X className="w-5 h-5" />
               </button>
            </div>
          ) : (
            <button 
              onClick={startEditing} 
              className="bg-white/10 hover:bg-white/20 p-1.5 rounded-lg text-indigo-100 hover:text-white transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      <div className="space-y-3">
        {(isEditing ? editedPriorities : priorities).map((item) => (
          <div 
            key={item.id}
            onClick={() => togglePriority(item.id)}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${isEditing ? 'bg-white/20' : 'bg-white/10 hover:bg-white/20 cursor-pointer'}`}
          >
            {!isEditing && (
              item.done ? (
                <CheckCircle2 className="w-5 h-5 text-green-300 flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-indigo-300 flex-shrink-0" />
              )
            )}
            
            {isEditing ? (
              <input 
                type="text" 
                value={item.text}
                onChange={(e) => handleEditChange(item.id, e.target.value)}
                className="bg-transparent border-b border-indigo-300 text-white w-full outline-none focus:border-white pb-1"
                placeholder="输入重要任务..."
                autoFocus={item.id === 1}
              />
            ) : (
              <span className={`text-sm md:text-base font-medium ${item.done ? 'line-through text-indigo-200' : 'text-white'}`}>
                {item.text}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopPriorities;
