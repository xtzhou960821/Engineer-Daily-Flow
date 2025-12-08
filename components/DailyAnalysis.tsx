import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ChartData } from '../types';

const data: ChartData[] = [
  { name: '工作 (现场)', value: 4, color: '#2563EB' }, // Blue
  { name: '深度开发', value: 3, color: '#9333EA' },   // Purple
  { name: '学习提升', value: 3, color: '#4F46E5' },   // Indigo
  { name: '健康 & 休息', value: 3.5, color: '#10B981' }, // Emerald
  { name: '通勤 & 杂项', value: 2.5, color: '#94A3B8' }, // Slate
];

const DailyAnalysis: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mt-8">
      <h3 className="text-lg font-bold text-slate-800 mb-4">今日时间分配模型</h3>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${value} 小时`, '时长']}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-xs text-slate-500 text-center">
        *基于标准日程模板计算
      </div>
    </div>
  );
};

export default DailyAnalysis;