import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

export interface BarData {
  name: string;
  value: number;
}

interface PriorityBarChartProps {
  data: BarData[];
}

const COLORS: Record<string, string> = {
  'Low': '#64748B',
  'Medium': '#F59E0B',
  'High': '#EA580C',
  'Critical': '#DC2626',
};

export const PriorityBarChart: React.FC<PriorityBarChartProps> = ({ data }) => {
  const hasData = data.some((item) => item.value > 0);

  if (!hasData) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-500">
        No active priority data to display
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#9CA3AF', fontSize: 11 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#9CA3AF', fontSize: 11 }}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(229, 231, 235, 0.2)' }}
            contentStyle={{
              background: '#1F2937',
              border: 'none',
              borderRadius: '8px',
              color: '#F9FAFB',
              fontSize: '12px',
            }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={36}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#3B82F6'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriorityBarChart;
