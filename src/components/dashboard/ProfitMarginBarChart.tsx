import React from 'react';
import { Card, Typography } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const { Title, Text } = Typography;

const data = [
  { month: 'Jan', revenue: 4500, profit: 1200 },
  { month: 'Feb', revenue: 5200, profit: 1560 },
  { month: 'Mar', revenue: 6800, profit: 2100 },
  { month: 'Apr', revenue: 4900, profit: 1470 },
  { month: 'May', revenue: 6100, profit: 1950 },
  { month: 'Jun', revenue: 7500, profit: 2600 },
];

const ProfitMarginBarChart: React.FC = () => {
  return (
    <Card 
      className="shadow-sm rounded-2xl border border-gray-100 h-full"
      styles={{ body: { padding: '24px' } }}
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={5} style={{ margin: 0, fontWeight: 800 }}>Profit Analytics</Title>
          <Text type="secondary" className="text-xs uppercase tracking-wider font-semibold">
            Revenue vs Net Profit
          </Text>
        </div>
      </div>

      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#8c8c8c' }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#8c8c8c' }}
              tickFormatter={(value) => `LKR ${value}`}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
              }}
              formatter={(value: any) => [`LKR ${value.toLocaleString()}`]}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', fontWeight: 500 }}
            />
            <Bar dataKey="revenue" name="Total Revenue" fill="#1890ff" radius={[4, 4, 0, 0]} />
            <Bar dataKey="profit" name="Net Profit" fill="#52c41a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default ProfitMarginBarChart;
