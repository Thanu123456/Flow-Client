import React from 'react';
import { Card, Typography, Empty, Skeleton } from 'antd';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useDashboardStore } from '../../store/reports/dashboardStore';

const { Title, Text } = Typography;

const COLORS: Record<string, string> = {
  'Cash': '#52c41a',
  'Card': '#1890ff',
  'COD': '#faad14',
  'Credit': '#f5222d',
};

const DEFAULT_COLORS = ['#1890ff', '#13c2c2', '#52c41a', '#faad14', '#eb2f96'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-xl">
        <p className="font-bold text-gray-800 mb-1">{payload[0].name}</p>
        <p className="text-sm font-semibold text-gray-600">
          Transactions: <span style={{ color: payload[0].payload.fill }}>{payload[0].value.toLocaleString()}</span>
        </p>
      </div>
    );
  }
  return null;
};

const PaymentMethodPieChart: React.FC = () => {
    const { charts, chartsLoading } = useDashboardStore();
    
    const data = React.useMemo(() => {
        const raw = charts?.paymentMethod ?? [];
        console.log('[PaymentMethodPieChart] raw paymentMethod:', raw.length, 'items', raw);
        return raw.map(p => ({
            name: p.label,
            value: p.value,
            color: COLORS[p.label] || DEFAULT_COLORS[0]
        }));
    }, [charts]);

  return (
    <Card 
      className="shadow-sm rounded-2xl border border-gray-100 h-full"
      styles={{ body: { padding: '24px' } }}
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={5} style={{ margin: 0, fontWeight: 800 }}>Payment Distribution</Title>
          <Text type="secondary" className="text-xs uppercase tracking-wider font-semibold">
            Transaction Split By Method
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
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ fontSize: '12px', fontWeight: 500 }}
                formatter={(value) => <span className="text-gray-600 font-medium">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <Empty description="No payment data found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        )}
      </div>
    </Card>
  );
};

export default PaymentMethodPieChart;
