import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

export interface BarData {
  name: string;
  value: number;
}

interface SeverityBarChartProps {
  data: BarData[];
}

const COLORS: Record<string, string> = {
  'Minor': '#38BDF8',
  'Major': '#F97316',
  'Critical': '#EF4444',
};

export const SeverityBarChart: React.FC<SeverityBarChartProps> = ({ data }) => {
  const hasData = data.some((item) => item.value > 0);
  const isDark = document.documentElement.classList.contains('dark');

  if (!hasData) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-400 dark:text-gray-500">
        No severity data to display
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke={isDark ? '#2D3340' : '#E5E7EB'}
          />
          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            tick={{ fill: isDark ? '#78818E' : '#9CA3AF', fontSize: 12 }}
            allowDecimals={false}
          />
          <YAxis
            dataKey="name"
            type="category"
            tickLine={false}
            axisLine={false}
            tick={{ fill: isDark ? '#78818E' : '#6B7280', fontSize: 12, fontWeight: 500 }}
            width={65}
          />
          <Tooltip
            cursor={{ fill: isDark ? 'rgba(45, 51, 64, 0.5)' : 'rgba(229, 231, 235, 0.3)' }}
            contentStyle={{
              background: isDark ? '#1E2432' : '#ffffff',
              border: `1px solid ${isDark ? '#2D3340' : '#E5E7EB'}`,
              borderRadius: '10px',
              color: isDark ? '#F9FAFB' : '#111827',
              fontSize: '13px',
              fontWeight: 500,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#3B82F6'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SeverityBarChart;
