import React, { useState, useMemo } from 'react';
import { Card, Typography, Segmented } from 'antd';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart
} from 'recharts';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

// Mock data generator for sales and GRNs
const generateData = (type: 'Daily' | 'Weekly' | 'Monthly') => {
  const data = [];
  const now = dayjs();
  
  if (type === 'Daily') {
    // Last 14 days
    for (let i = 13; i >= 0; i--) {
      const date = now.subtract(i, 'day');
      data.push({
        name: date.format('MMM DD'),
        sales: Math.floor(Math.random() * 50000) + 10000,
        grn: Math.floor(Math.random() * 40000) + 5000,
      });
    }
  } else if (type === 'Weekly') {
    // Last 12 weeks
    for (let i = 11; i >= 0; i--) {
      const date = now.subtract(i, 'week');
      data.push({
        name: date.startOf('week').format('MMM DD'),
        sales: Math.floor(Math.random() * 300000) + 50000,
        grn: Math.floor(Math.random() * 250000) + 30000,
      });
    }
  } else if (type === 'Monthly') {
    // Last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = now.subtract(i, 'month');
      data.push({
        name: date.format('MMM YYYY'),
        sales: Math.floor(Math.random() * 1200000) + 200000,
        grn: Math.floor(Math.random() * 900000) + 150000,
      });
    }
  }
  
  return data;
};

// Formatter for currency
const formatCurrency = (value: number) => {
  if (value >= 1000000) return `Rs ${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `Rs ${(value / 1000).toFixed(1)}k`;
  return `Rs ${value}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-xl min-w-[160px]">
        <p className="font-bold text-gray-800 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex justify-between items-center mb-1 text-sm">
            <span style={{ color: entry.color }} className="font-semibold">{entry.name}:</span>
            <span className="font-bold text-gray-700 ml-4">
              Rs {entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const SalesPurchasesChart: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');
  
  // Memoize data so it doesn't jitter on re-renders, only when timeframe changes
  const chartData = useMemo(() => generateData(timeframe), [timeframe]);

  return (
    <Card 
      className="shadow-sm rounded-2xl border border-gray-100"
      styles={{ body: { padding: '24px' } }}
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={4} style={{ margin: 0, color: '#1a1a2e', fontWeight: 800 }}>Sales vs Purchases (GRN)</Title>
          <Text type="secondary" className="text-xs font-medium uppercase tracking-wider">
            Revenue and Expense trends
          </Text>
        </div>
        <Segmented
          options={['Daily', 'Weekly', 'Monthly']}
          value={timeframe}
          onChange={(val) => setTimeframe(val as 'Daily' | 'Weekly' | 'Monthly')}
          className="bg-gray-100 p-1 rounded-xl font-medium shadow-inner"
        />
      </div>

      <div style={{ width: '100%', height: 380 }}>
        <ResponsiveContainer>
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 20, left: 10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2ea2f8" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#2ea2f8" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorGrn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#8c8c8c', fontSize: 12, fontWeight: 500 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#8c8c8c', fontSize: 12, fontWeight: 500 }}
              tickFormatter={formatCurrency}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc', opacity: 0.6 }} />
            <Legend 
              verticalAlign="top" 
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '13px', fontWeight: 600, color: '#4b5563' }}
            />
            
            <Area 
              type="monotone" 
              dataKey="sales" 
              name="Total Sales" 
              stroke="#2ea2f8" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorSales)" 
              activeDot={{ r: 6, strokeWidth: 0, fill: '#2ea2f8' }}
            />
            <Area 
              type="monotone" 
              dataKey="grn" 
              name="Purchases (GRN)" 
              stroke="#f43f5e" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorGrn)" 
              activeDot={{ r: 6, strokeWidth: 0, fill: '#f43f5e' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default SalesPurchasesChart;
