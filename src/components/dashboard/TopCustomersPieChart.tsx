import React from 'react';
import { Card, Typography } from 'antd';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const { Title, Text } = Typography;

const data = [
  { name: 'My', value: 8500 },
  { name: 'Walk-In Customer', value: 1500 },
];

const COLORS = ['#1890ff', '#eb2f96'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-xl">
        <p className="font-bold text-gray-800 mb-1">{payload[0].name}</p>
        <p className="text-sm font-semibold text-gray-600">
          Revenue: <span style={{ color: payload[0].payload.fill }}>LKR {payload[0].value.toLocaleString()}</span>
        </p>
      </div>
    );
  }
  return null;
};

const TopCustomersPieChart: React.FC = () => {
  return (
    <Card 
        className="shadow-sm rounded-2xl border border-gray-100 h-full"
        styles={{ body: { padding: '24px', height: '100%' } }}
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={5} style={{ margin: 0, fontWeight: 800 }}>Top 05 Customers</Title>
          <Text type="secondary" className="text-xs uppercase tracking-wider font-semibold">
            By Purchase Value
          </Text>
        </div>
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

export default TopCustomersPieChart;
