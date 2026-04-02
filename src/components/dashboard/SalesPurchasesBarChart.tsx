import React, { useMemo } from 'react';
import { Card, Typography, Segmented, Skeleton, Empty } from 'antd';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import dayjs from 'dayjs';
import { useDashboardStore } from '../../store/reports/dashboardStore';

const { Title, Text } = Typography;

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `Rs ${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `Rs ${(value / 1000).toFixed(0)}k`;
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

export const SalesPurchasesBarChart: React.FC = () => {
  const { charts, chartsLoading } = useDashboardStore();

  const chartData = useMemo(() => {
    if (!charts?.salesPurchases) return [];
    return charts.salesPurchases.map(p => ({
      name: dayjs(p.label).format('MMM DD'),
      sales: p.values.sales || 0,
      grn: p.values.purchases || 0,
    }));
  }, [charts]);

  return (
    <Card
      className="shadow-sm rounded-2xl border border-gray-100 h-full"
      styles={{ body: { padding: '24px', height: '100%' } }}
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={5} style={{ margin: 0, fontWeight: 800 }}>Sales vs Purchases</Title>
          <Text type="secondary" className="text-xs uppercase tracking-wider font-semibold">
            Comparative Volume
          </Text>
        </div>
        <Segmented
          options={['Daily', 'Weekly', 'Monthly']}
          disabled
          className="bg-gray-100 p-1 rounded-xl shadow-inner font-medium text-xs opacity-50"
        />
      </div>

      <div style={{ width: '100%', height: 'calc(100% - 50px)', minHeight: 200 }}>
        {chartsLoading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
        ) : chartData.length > 0 ? (
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#8c8c8c', fontSize: 11, fontWeight: 600 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#8c8c8c', fontSize: 11, fontWeight: 600 }}
                tickFormatter={formatCurrency}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: '12px', fontWeight: 600 }}
              />

              <Bar
                dataKey="sales"
                name="Sales Amount"
                fill="#1890ff"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
              <Bar
                dataKey="grn"
                name="Purchases (GRN)"
                fill="#faad14"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <Empty description="No data available" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        )}
      </div>
    </Card>
  );
};

export default SalesPurchasesBarChart;
