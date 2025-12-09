import React, { useState, useEffect } from 'react';
import { Target, CheckCircle2, Circle, Pencil, Check, X } from 'lucide-react';
import { Priority } from '../types';

interface Props {
  items: Priority[];
  onUpdate: (items: Priority[]) => void;
}

const TopPriorities: React.FC<Props> = ({ items, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedItems, setEditedItems] = useState<Priority[]>(items);

  // Sync edited state when items change externally (e.g. date change)
  useEffect(() => {
    setEditedItems(items);
  }, [items]);

  const togglePriority = (id: number) => {
    if (isEditing) return;
    const newItems = items.map(p => 
      p.id === id ? { ...p, done: !p.done } : p
    );
    onUpdate(newItems);
  };

  const handleEditChange = (id: number, text: string) => {
    setEditedItems(prev => prev.map(p => 
      p.id === id ? { ...p, text } : p
    ));
  };

  const saveEdits = () => {
    onUpdate(editedItems);
    setIsEditing(false);
  };

  const startEditing = () => {
    setEditedItems(items);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setEditedItems(items);
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
        {(isEditing ? editedItems : items).map((item) => (
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