import React from 'react';
import { Card, Typography } from 'antd';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const { Title, Text } = Typography;

const creditData = [
  { name: 'Collected', value: 3500000 },
  { name: 'Outstanding', value: 1200000 },
];

const COLORS = ['#52c41a', '#ff4d4f'];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-xl">
        <p className="font-bold text-gray-800 mb-1">{payload[0].name} Credit</p>
        <p className="text-sm font-semibold text-gray-600">
          Amount: <span style={{ color: payload[0].payload.fill }}>{formatCurrency(payload[0].value)}</span>
        </p>
      </div>
    );
  }
  return null;
};

export const CreditBalancePieChart: React.FC = () => {
  return (
    <Card 
      className="shadow-sm rounded-2xl border border-gray-100 h-full"
      styles={{ body: { padding: '24px', height: '100%' } }}
    >
      <div className="mb-6">
        <Title level={5} style={{ margin: 0, fontWeight: 800 }}>Credit Balance Overview</Title>
        <Text type="secondary" className="text-xs uppercase tracking-wider font-semibold">
          Collected vs Outstanding
        </Text>
      </div>

      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={creditData}
              cx="50%"
              cy="45%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
              cornerRadius={5}
            >
              {creditData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              wrapperStyle={{ fontSize: '13px', fontWeight: 600 }}
              formatter={(value) => <span style={{ color: '#4b5563' }}>{value}</span>}
            />
            {/* Center Text */}
            <text x="50%" y="40%" textAnchor="middle" dominantBaseline="middle" className="text-sm font-bold fill-gray-500">
              Total Credit
            </text>
            <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" className="text-lg font-extrabold fill-gray-800">
              {formatCurrency(4700000)}
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default CreditBalancePieChart;
