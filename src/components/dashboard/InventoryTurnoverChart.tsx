import React from 'react';
import { Card, Typography } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const { Title, Text } = Typography;

const data = [
  { item: 'Paracetamol', days: 4, speed: 'Fast' },
  { item: 'Face Masks', days: 7, speed: 'Fast' },
  { item: 'Sanitizer', days: 12, speed: 'Normal' },
  { item: 'Multivitamins', days: 18, speed: 'Normal' },
  { item: 'Baby Diapers', days: 28, speed: 'Slow' },
  { item: 'Heating Pads', days: 45, speed: 'Slow' },
];

const getSpeedColor = (days: number) => {
  if (days <= 7) return '#52c41a';
  if (days <= 20) return '#1890ff';
  return '#faad14';
};

const InventoryTurnoverChart: React.FC = () => {
  return (
    <Card 
      className="shadow-sm rounded-2xl border border-gray-100 h-full"
      styles={{ body: { padding: '24px' } }}
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={5} style={{ margin: 0, fontWeight: 800 }}>Inventory Turnover</Title>
          <Text type="secondary" className="text-xs uppercase tracking-wider font-semibold">
            Average Days On Hand
          </Text>
        </div>
      </div>

      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
            <XAxis 
              type="number" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#8c8c8c' }}
              label={{ value: 'Days', position: 'bottom', offset: 0, fontSize: 11, fill: '#8c8c8c' }}
            />
            <YAxis 
              dataKey="item" 
              type="category" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#8c8c8c', width: 100 }}
              width={100}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
              }}
              formatter={(value: any) => [`${value} Days`, 'Turnover Time']}
            />
            <Bar dataKey="days" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getSpeedColor(entry.days)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default InventoryTurnoverChart;
