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
  'Minor': '#0EA5E9',
  'Major': '#EA580C',
  'Critical': '#DC2626',
};

export const SeverityBarChart: React.FC<SeverityBarChartProps> = ({ data }) => {
  const hasData = data.some((item) => item.value > 0);

  if (!hasData) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-500">
        No severity data to display
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#9CA3AF', fontSize: 11 }}
            allowDecimals={false}
          />
          <YAxis
            dataKey="name"
            type="category"
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#9CA3AF', fontSize: 11 }}
            width={60}
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
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
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
