import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

export interface PieData {
  name: string;
  value: number;
}

interface StatusPieChartProps {
  data: PieData[];
}

const COLORS: Record<string, string> = {
  'Open': '#3B82F6',
  'In Progress': '#F59E0B',
  'Resolved': '#10B981',
  'Closed': '#6B7280',
};

export const StatusPieChart: React.FC<StatusPieChartProps> = ({ data }) => {
  const filteredData = data.filter((item) => item.value > 0);
  const isDark = document.documentElement.classList.contains('dark');

  if (filteredData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-400 dark:text-gray-500">
        No active status data to display
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={filteredData}
            cx="50%"
            cy="45%"
            innerRadius={58}
            outerRadius={82}
            paddingAngle={4}
            dataKey="value"
            strokeWidth={2}
            stroke={isDark ? '#111827' : '#ffffff'}
          >
            {filteredData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#9CA3AF'} />
            ))}
          </Pie>
          <Tooltip
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
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            iconSize={8}
            formatter={(val: string) => (
              <span style={{
                color: isDark ? '#D1D5DB' : '#4B5563',
                fontSize: '12px',
                fontWeight: 500,
              }}>
                {val}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatusPieChart;
