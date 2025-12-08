import React, { useState, useEffect } from 'react';
import { Clock, CheckSquare, Square, Car, Brain, Hammer, Coffee, Dumbbell, Moon, Pencil, Check, X, Plus, Trash2 } from 'lucide-react';
import { ScheduleBlock, ActivityType, SubTask } from '../types';

interface Props {
  block: ScheduleBlock;
  isLast: boolean;
  onToggleSubTask: (blockId: string, subTaskId: string) => void;
  onUpdateBlock: (block: ScheduleBlock) => void;
}

const getIcon = (type: ActivityType) => {
  switch (type) {
    case ActivityType.MORNING_ROUTINE: return <Coffee className="w-5 h-5 text-orange-500" />;
    case ActivityType.TRANSIT: return <Car className="w-5 h-5 text-slate-500" />;
    case ActivityType.FIELD_WORK: return <Hammer className="w-5 h-5 text-blue-600" />;
    case ActivityType.DEEP_WORK: return <Brain className="w-5 h-5 text-purple-600" />;
    case ActivityType.HEALTH: return <Dumbbell className="w-5 h-5 text-emerald-600" />;
    case ActivityType.LEARNING: return <div className="font-bold text-indigo-600 text-xs border border-indigo-600 rounded px-1">API</div>;
    default: return <Moon className="w-5 h-5 text-indigo-400" />;
  }
};

const getBorderColor = (type: ActivityType) => {
  switch (type) {
    case ActivityType.MORNING_ROUTINE: return 'border-orange-200 bg-orange-50';
    case ActivityType.FIELD_WORK: return 'border-blue-200 bg-blue-50';
    case ActivityType.DEEP_WORK: return 'border-purple-200 bg-purple-50';
    case ActivityType.HEALTH: return 'border-emerald-200 bg-emerald-50';
    case ActivityType.LEARNING: return 'border-indigo-200 bg-indigo-50';
    default: return 'border-slate-200 bg-white';
  }
};

const ScheduleCard: React.FC<Props> = ({ block, isLast, onToggleSubTask, onUpdateBlock }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBlock, setEditedBlock] = useState<ScheduleBlock>(block);
  
  // Sync state when props change (unless editing)
  useEffect(() => {
    if (!isEditing) {
      setEditedBlock(block);
    }
  }, [block, isEditing]);

  const allDone = block.subTasks.length > 0 && block.subTasks.every(t => t.completed);

  const handleSave = () => {
    onUpdateBlock(editedBlock);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedBlock(block);
    setIsEditing(false);
  };

  const handleSubTaskChange = (id: string, text: string) => {
    setEditedBlock(prev => ({
      ...prev,
      subTasks: prev.subTasks.map(t => t.id === id ? { ...t, text } : t)
    }));
  };

  const handleDeleteSubTask = (id: string) => {
    setEditedBlock(prev => ({
      ...prev,
      subTasks: prev.subTasks.filter(t => t.id !== id)
    }));
  };

  const handleAddSubTask = () => {
    const newId = `${editedBlock.id}-${Date.now()}`;
    setEditedBlock(prev => ({
      ...prev,
      subTasks: [...prev.subTasks, { id: newId, text: '', completed: false }]
    }));
  };

  return (
    <div className="flex gap-4 relative group/card">
      {/* Timeline Line */}
      {!isLast && (
        <div className="absolute left-[19px] top-10 bottom-[-20px] w-0.5 bg-slate-200 z-0"></div>
      )}

      {/* Icon Bubble */}
      <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center bg-white border-2 shadow-sm flex-shrink-0 ${allDone ? 'border-green-500' : 'border-slate-200'}`}>
        {allDone ? <CheckSquare className="w-5 h-5 text-green-500" /> : getIcon(block.type)}
      </div>

      {/* Card Content */}
      <div className={`flex-1 mb-8 rounded-xl border p-4 transition-all duration-300 relative ${allDone && !isEditing ? 'opacity-60 grayscale-[0.5]' : 'shadow-sm hover:shadow-md'} ${getBorderColor(block.type)}`}>
        
        {/* Edit Controls */}
        <div className="absolute top-2 right-2 flex gap-2">
          {isEditing ? (
            <>
              <button onClick={handleSave} className="p-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 shadow-sm transition-colors">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={handleCancel} className="p-1.5 bg-slate-400 text-white rounded-md hover:bg-slate-500 shadow-sm transition-colors">
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)} 
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-black/5 rounded-md transition-all opacity-0 group-hover/card:opacity-100"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-3">
             <div>
                <label className="text-xs text-slate-400 font-bold uppercase block mb-1">时间段</label>
                <input 
                  type="text" 
                  value={editedBlock.timeRange}
                  onChange={(e) => setEditedBlock({...editedBlock, timeRange: e.target.value})}
                  className="w-full text-sm font-mono border border-slate-300 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
             </div>
             <div>
                <label className="text-xs text-slate-400 font-bold uppercase block mb-1">任务标题</label>
                <input 
                  type="text" 
                  value={editedBlock.title}
                  onChange={(e) => setEditedBlock({...editedBlock, title: e.target.value})}
                  className="w-full font-bold text-slate-800 text-lg border border-slate-300 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
             </div>
             <div>
                <label className="text-xs text-slate-400 font-bold uppercase block mb-1">描述备注</label>
                <textarea 
                  value={editedBlock.description || ''}
                  onChange={(e) => setEditedBlock({...editedBlock, description: e.target.value})}
                  className="w-full text-slate-600 text-sm border border-slate-300 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-indigo-500 outline-none min-h-[60px]"
                />
             </div>
             <div>
                <label className="text-xs text-slate-400 font-bold uppercase block mb-1">子任务清单</label>
                <div className="space-y-2">
                  {editedBlock.subTasks.map((task) => (
                    <div key={task.id} className="flex gap-2">
                      <input 
                        type="text"
                        value={task.text}
                        onChange={(e) => handleSubTaskChange(task.id, e.target.value)}
                        className="flex-1 text-sm border border-slate-300 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="输入子任务..."
                      />
                      <button 
                        onClick={() => handleDeleteSubTask(task.id)}
                        className="p-1 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={handleAddSubTask}
                    className="flex items-center gap-1 text-xs text-indigo-600 font-medium hover:underline mt-1"
                  >
                    <Plus className="w-3 h-3" /> 添加子任务
                  </button>
                </div>
             </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 pr-6">
              <h3 className="font-bold text-slate-800 text-lg">{block.title}</h3>
              <div className="flex items-center text-slate-500 text-sm font-mono mt-1 sm:mt-0">
                <Clock className="w-3 h-3 mr-1" />
                {block.timeRange}
              </div>
            </div>

            {block.description && (
              <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                {block.description}
              </p>
            )}

            <div className="space-y-2">
              {block.subTasks.map((task: SubTask) => (
                <button
                  key={task.id}
                  onClick={() => onToggleSubTask(block.id, task.id)}
                  className="w-full flex items-start gap-3 text-left group"
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {task.completed ? (
                      <CheckSquare className="w-5 h-5 text-green-600" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    )}
                  </div>
                  <span className={`text-sm ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                    {task.text}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ScheduleCard;
