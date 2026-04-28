import React, { useMemo } from 'react';
import { Card, Typography, Segmented, Empty, Skeleton } from 'antd';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart
} from 'recharts';
import { useDashboardStore } from '../../store/reports/dashboardStore';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `Rs ${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `Rs ${(value / 1000).toFixed(1)}k`;
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

export const SalesPurchasesChart: React.FC = () => {
  const { charts, chartsLoading } = useDashboardStore();

  const chartData = useMemo(() => {
    const raw = charts?.salesPurchases ?? [];
    console.log('[SalesPurchasesChart] raw salesPurchases:', raw.length, 'points', raw);
    if (!raw.length) return [];
    return raw.map(point => ({
      name: dayjs(point.label).isValid() ? dayjs(point.label).format('MMM DD') : point.label,
      sales: point.values.sales || 0,
      grn: point.values.purchases || 0,
    }));
  }, [charts]);

  return (
    <Card
      className="shadow-sm rounded-2xl border border-gray-100"
      styles={{ body: { padding: '24px' } }}
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={4} style={{ margin: 0, color: '#1a1a2e', fontWeight: 800 }}>Sales vs Purchases (GRN)</Title>
          <Text type="secondary" className="text-xs font-medium uppercase tracking-wider">
            Revenue and Expense trends
          </Text>
        </div>
        <Segmented
          options={['Daily', 'Weekly', 'Monthly']}
          disabled
          className="bg-gray-100 p-1 rounded-xl font-medium shadow-inner opacity-50"
        />
      </div>

      <div style={{ width: '100%', height: 380 }}>
        {chartsLoading ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : chartData.length > 0 ? (
          <ResponsiveContainer>
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2ea2f8" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2ea2f8" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorGrn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#8c8c8c', fontSize: 12, fontWeight: 500 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#8c8c8c', fontSize: 12, fontWeight: 500 }}
                tickFormatter={formatCurrency}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc', opacity: 0.6 }} />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: '13px', fontWeight: 600, color: '#4b5563' }}
              />

              <Area
                type="monotone"
                dataKey="sales"
                name="Total Sales"
                stroke="#2ea2f8"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorSales)"
                activeDot={{ r: 6, strokeWidth: 0, fill: '#2ea2f8' }}
              />
              <Area
                type="monotone"
                dataKey="grn"
                name="Purchases (GRN)"
                stroke="#f43f5e"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorGrn)"
                activeDot={{ r: 6, strokeWidth: 0, fill: '#f43f5e' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full translate-y-12">
            <Empty description="No transactions found for this period" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        )}
      </div>
    </Card>
  );
};

export default SalesPurchasesChart;
