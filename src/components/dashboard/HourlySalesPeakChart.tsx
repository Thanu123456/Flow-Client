import React from 'react';
import { Card, Typography } from 'antd';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const { Title, Text } = Typography;

const data = [
  { hour: '08:00', sales: 1200 },
  { hour: '09:00', sales: 1800 },
  { hour: '10:00', sales: 3500 },
  { hour: '11:00', sales: 4200 },
  { hour: '12:00', sales: 3800 },
  { hour: '13:00', sales: 2500 },
  { hour: '14:00', sales: 2100 },
  { hour: '15:00', sales: 2800 },
  { hour: '16:00', sales: 4500 },
  { hour: '17:00', sales: 5200 },
  { hour: '18:00', sales: 4800 },
  { hour: '19:00', sales: 3200 },
  { hour: '20:00', sales: 1500 },
];

const HourlySalesPeakChart: React.FC = () => {
  return (
    <Card 
      className="shadow-sm rounded-2xl border border-gray-100 h-full"
      styles={{ body: { padding: '24px' } }}
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={5} style={{ margin: 0, fontWeight: 800 }}>Hourly Sales Peak</Title>
          <Text type="secondary" className="text-xs uppercase tracking-wider font-semibold">
            Today's Transaction Volume
          </Text>
        </div>
      </div>

      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1890ff" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#1890ff" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="hour" 
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
              formatter={(value: any) => [`LKR ${value.toLocaleString()}`, 'Sales']}
            />
            <Area 
              type="monotone" 
              dataKey="sales" 
              stroke="#1890ff" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorSales)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default HourlySalesPeakChart;
