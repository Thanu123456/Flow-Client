import React from 'react';
import { Card, Typography, Skeleton, Empty } from 'antd';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useDashboardStore } from '../../store/reports/dashboardStore';

const { Title, Text } = Typography;

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
        <p className="font-normal text-gray-800 mb-1">{payload[0].name} Credit</p>
        <p className="text-sm font-normal text-gray-600">
          Amount: <span style={{ color: payload[0].payload.fill }}>{formatCurrency(payload[0].value)}</span>
        </p>
      </div>
    );
  }
  return null;
};

export const CreditBalancePieChart: React.FC = () => {
    const { charts, chartsLoading } = useDashboardStore();

    const creditData = React.useMemo(() => {
        if (!charts) return [];
        console.log('[CreditBalancePieChart] creditCollected:', charts.creditCollected, 'creditOutstanding:', charts.creditOutstanding);
        return [
            { name: 'Collected', value: charts.creditCollected || 0 },
            { name: 'Outstanding', value: charts.creditOutstanding || 0 },
        ].filter(item => item.value > 0);
    }, [charts]);

    const totalCredit = React.useMemo(() => {
        if (!charts) return 0;
        return (charts.creditCollected || 0) + (charts.creditOutstanding || 0);
    }, [charts]);

  return (
    <Card 
      className="shadow-sm rounded-2xl border border-gray-100 h-full"
      styles={{ body: { padding: '24px', height: '100%' } }}
    >
      <div className="mb-6">
        <Title level={5} style={{ margin: 0, fontWeight: 400 }}>Credit Balance Overview</Title>
        <Text type="secondary" className="text-xs uppercase tracking-wider font-normal">
          Collected vs Outstanding
        </Text>
      </div>

      <div style={{ width: '100%', height: 300 }}>
        {chartsLoading ? (
            <Skeleton active avatar paragraph={{ rows: 6 }} />
        ) : creditData.length > 0 ? (
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
                {creditData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.name === 'Collected' ? COLORS[0] : COLORS[1]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ fontSize: '13px', fontWeight: 400 }}
                formatter={(value) => <span style={{ color: '#4b5563' }}>{value}</span>}
              />
              {/* Center Text */}
              <text x="50%" y="40%" textAnchor="middle" dominantBaseline="middle" className="text-sm font-normal fill-gray-500">
                Total Credit
              </text>
              <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" className="text-lg font-normal fill-gray-800">
                {formatCurrency(totalCredit)}
              </text>
            </PieChart>
          </ResponsiveContainer>
        ) : (
            <div className="flex items-center justify-center h-full">
                <Empty description="No credit data available" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </div>
        )}
      </div>
    </Card>
  );
};

export default CreditBalancePieChart;
