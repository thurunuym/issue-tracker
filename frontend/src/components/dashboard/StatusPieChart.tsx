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

  if (filteredData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-500">
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
            innerRadius={60}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {filteredData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#9CA3AF'} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: '#1F2937',
              border: 'none',
              borderRadius: '8px',
              color: '#F9FAFB',
              fontSize: '12px',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(val: string) => <span className="text-xs text-gray-650 dark:text-gray-300 font-medium">{val}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatusPieChart;
