import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ChartData, ScheduleBlock, ActivityType } from '../types';

interface Props {
  schedule: ScheduleBlock[];
}

const COLORS: Record<ActivityType, string> = {
  [ActivityType.MORNING_ROUTINE]: '#F97316', // Orange
  [ActivityType.FIELD_WORK]: '#2563EB',      // Blue
  [ActivityType.DEEP_WORK]: '#9333EA',       // Purple
  [ActivityType.LEARNING]: '#4F46E5',        // Indigo
  [ActivityType.HEALTH]: '#10B981',          // Emerald
  [ActivityType.TRANSIT]: '#94A3B8',         // Slate
};

const LABEL_MAP: Record<ActivityType, string> = {
  [ActivityType.MORNING_ROUTINE]: '晨间习惯',
  [ActivityType.FIELD_WORK]: '工作 (现场)',
  [ActivityType.DEEP_WORK]: '深度开发',
  [ActivityType.LEARNING]: '学习提升',
  [ActivityType.HEALTH]: '健康 & 休息',
  [ActivityType.TRANSIT]: '通勤 & 杂项',
};

// Helper to parse "HH:MM - HH:MM" and get duration in hours
const calculateDuration = (timeRange: string): number => {
  try {
    const [start, end] = timeRange.split('-').map(t => t.trim());
    
    // Parse Start
    const [startH, startM] = start.split(':').map(Number);
    
    // Parse End (Handle "End" or invalid times)
    let endH, endM;
    if (end.toLowerCase() === 'end') {
      endH = 24; // Assume end of day
      endM = 0;
    } else {
      [endH, endM] = end.split(':').map(Number);
    }

    if (isNaN(startH) || isNaN(endH)) return 0;

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    
    let durationMinutes = endMinutes - startMinutes;
    if (durationMinutes < 0) durationMinutes += 24 * 60; // Handle over midnight (though rare in this schedule)

    return Number((durationMinutes / 60).toFixed(1));
  } catch (e) {
    return 0;
  }
};

const DailyAnalysis: React.FC<Props> = ({ schedule }) => {
  
  const chartData = useMemo(() => {
    // 1. Initialize map
    const durationMap: Record<string, number> = {};
    Object.values(ActivityType).forEach(type => {
      durationMap[type] = 0;
    });

    // 2. Sum up durations
    schedule.forEach(block => {
      const duration = calculateDuration(block.timeRange);
      if (block.type) {
        durationMap[block.type] = (durationMap[block.type] || 0) + duration;
      }
    });

    // 3. Convert to ChartData format and filter out zero values
    return Object.entries(durationMap)
      .map(([type, value]) => ({
        name: LABEL_MAP[type as ActivityType] || type,
        value: value,
        color: COLORS[type as ActivityType] || '#CBD5E1'
      }))
      .filter(item => item.value > 0);
  }, [schedule]);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mt-8">
      <h3 className="text-lg font-bold text-slate-800 mb-4">今日时间分配模型</h3>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${value} 小时`, '时长']}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={80} 
              iconType="circle" 
              content={(props) => {
                const { payload } = props;
                return (
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
                    {payload?.map((entry, index) => (
                      <div key={`item-${index}`} className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span>{entry.value}</span>
                        <span className="font-bold text-slate-800 ml-1">{entry.payload?.value}h</span>
                      </div>
                    ))}
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 text-xs text-slate-400 text-center">
        *自动计算基于日程表中的时间段
      </div>
    </div>
  );
};

export default DailyAnalysis;