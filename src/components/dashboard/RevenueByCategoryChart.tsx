import React from 'react';
import { Card, Typography, Empty, Skeleton } from 'antd';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useDashboardStore } from '../../store/reports/dashboardStore';

const { Title, Text } = Typography;

const COLORS = ['#1890ff', '#13c2c2', '#52c41a', '#faad14', '#eb2f96'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-xl">
        <p className="font-bold text-gray-800 mb-1">{payload[0].name}</p>
        <p className="text-sm font-semibold text-gray-600">
          Sales: <span style={{ color: payload[0].payload.fill }}>LKR {payload[0].value.toLocaleString()}</span>
        </p>
      </div>
    );
  }
  return null;
};

const RevenueByCategoryChart: React.FC = () => {
    const { charts, chartsLoading } = useDashboardStore();
    
    const data = charts?.revenueByCategory?.map(p => ({
        name: p.label,
        value: p.value
    })) || [];

  return (
    <Card 
      className="shadow-sm rounded-2xl border border-gray-100 h-full"
      styles={{ body: { padding: '24px' } }}
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={5} style={{ margin: 0, fontWeight: 800 }}>Revenue By Category</Title>
          <Text type="secondary" className="text-xs uppercase tracking-wider font-semibold">
            Sales Split By Industry
          </Text>
        </div>
      </div>

      <div style={{ width: '100%', height: 300 }}>
        {chartsLoading ? (
          <Skeleton active avatar paragraph={{ rows: 6 }} />
        ) : data.length > 0 ? (
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
                wrapperStyle={{ fontSize: '11px', fontWeight: 500 }}
                formatter={(value) => <span className="text-gray-600 font-medium">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <Empty description="No category sales found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        )}
      </div>
    </Card>
  );
};

export default RevenueByCategoryChart;
