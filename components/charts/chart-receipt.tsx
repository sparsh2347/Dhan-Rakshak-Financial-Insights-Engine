'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { useState } from 'react';

interface ExpenseData {
  name: string; // category name
  amount: number;
  items: any[]; // full items in that category
}

interface ExpenseChartProps {
  data: ExpenseData[];
  type: 'pie' | 'bar';
}

const COLORS = ['#81dbe0', '#4e7e93', '#2f8c8c', '#c2dedb', '#2b2731'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-2 rounded shadow-md text-sm text-gray-800 border border-gray-300">
        <div className="font-semibold mb-1">{data.name}</div>
        {data.items && data.items.length > 0 ? (
          <ul className="space-y-1 max-h-40 overflow-auto">
            {data.items.map((item: any, idx: number) => (
              <li key={idx} className="flex justify-between text-xs">
                <span>{item.name}</span>
                <span>₹{item.price} × {item.quantity || 1}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div>No items</div>
        )}
      </div>
    );
  }

  return null;
};

export default function ChartReceipt({ data, type }: ExpenseChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (type === 'pie') {
    return (
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            dataKey="amount"
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke={activeIndex === index ? '#000' : '#fff'}
                strokeWidth={activeIndex === index ? 2 : 1}
              />
            ))} 
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  return null; // Only pie for now
}
