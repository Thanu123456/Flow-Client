import React, { useState } from 'react';
import { Card, Typography, Segmented } from 'antd';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const { Title, Text } = Typography;

const dataWeek = [
  { name: 'Wireless Earbuds', value: 1400 },
  { name: 'Smartphone Case', value: 900 },
  { name: 'Power Bank', value: 650 },
  { name: 'Charging Cable', value: 450 },
  { name: 'Screen Protector', value: 300 },
];

const dataMonth = [
  { name: 'Smartphone Case', value: 4200 },
  { name: 'Wireless Earbuds', value: 3800 },
  { name: 'Power Bank', value: 2500 },
  { name: 'Bluetooth Speaker', value: 1600 },
  { name: 'Charging Cable', value: 1200 },
];

const COLORS = ['#1890ff', '#13c2c2', '#52c41a', '#faad14', '#eb2f96'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-xl">
        <p className="font-bold text-gray-800 mb-1">{payload[0].name}</p>
        <p className="text-sm font-semibold text-gray-600">
          Units Sold: <span style={{ color: payload[0].payload.fill }}>{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export const TopProductsPieChart: React.FC = () => {
  const [period, setPeriod] = useState<'Week' | 'Month'>('Week');
  
  const data = period === 'Week' ? dataWeek : dataMonth;

  return (
    <Card 
      className="shadow-sm rounded-2xl border border-gray-100 h-full"
      styles={{ body: { padding: '24px', height: '100%' } }}
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={5} style={{ margin: 0, fontWeight: 800 }}>Top Selling Products</Title>
          <Text type="secondary" className="text-xs uppercase tracking-wider font-semibold">
            By Units Sold
          </Text>
        </div>
        <Segmented
          options={['Week', 'Month']}
          value={period}
          onChange={(val) => setPeriod(val as 'Week' | 'Month')}
          className="bg-gray-100 p-1 rounded-xl shadow-inner font-medium text-xs"
        />
      </div>

      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              cornerRadius={8}
            >
              {data.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', fontWeight: 500 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default TopProductsPieChart;
