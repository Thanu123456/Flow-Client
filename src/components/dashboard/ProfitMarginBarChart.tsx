import React from 'react';
import { Card, Typography, Empty, Skeleton } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useDashboardStore } from '../../store/reports/dashboardStore';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const ProfitMarginBarChart: React.FC = () => {
    const { charts, chartsLoading } = useDashboardStore();
    
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Revenue comes from salesPurchases; profit comes from the backend's profitMargin
  // series (sales - salesReturn - (purchases - purchasesReturn) - expenses) so this
  // chart always agrees with the PROFIT KPI card for the same period.
  const data = React.useMemo(() => {
      const revenuePoints = charts?.salesPurchases ?? [];
      const profitPoints = charts?.profitMargin ?? [];
      if (!revenuePoints.length) return [];
      return revenuePoints.map((p, i) => ({
          month: dayjs(p.label).isValid() ? dayjs(p.label).format('MMM DD') : p.label,
          revenue: p.values.sales || 0,
          profit: profitPoints[i]?.value ?? 0
      }));
  }, [charts]);

return (
  <Card 
    className="shadow-sm rounded-2xl border border-gray-100 h-full"
    styles={{ body: { padding: '24px' } }}
  >
    <div className="flex justify-between items-center mb-6">
      <div>
        <Title level={5} style={{ margin: 0, fontWeight: 400 }}>Profit Analytics</Title>
        <Text type="secondary" className="text-xs uppercase tracking-wider font-normal">
          Revenue vs Net Profit
        </Text>
      </div>
    </div>

    <div style={{ width: '100%', height: 300, minWidth: 0 }}>
      {chartsLoading || !isMounted ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
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
                formatter={(value: any) => [`LKR ${value.toLocaleString()}`]}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', fontWeight: 500 }}
              />
              <Bar dataKey="revenue" name="Total Revenue" fill="#1890ff" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" name="Net Profit" fill="#52c41a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <Empty description="No profit data available" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProfitMarginBarChart;
