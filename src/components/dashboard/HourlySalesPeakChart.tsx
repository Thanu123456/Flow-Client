import React from 'react';
import { Card, Typography, Skeleton, Empty } from 'antd';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useDashboardStore } from '../../store/reports/dashboardStore';

const { Title, Text } = Typography;

const HourlySalesPeakChart: React.FC = () => {
  const { charts, chartsLoading } = useDashboardStore();

  const data = React.useMemo(() => {
    const raw = charts?.hourlySales ?? [];
    if (!raw.length) return [];
    return raw.map(p => ({
        hour: p.label,
        sales: p.value
    }));
  }, [charts]);

  const peak = React.useMemo(() => {
    if (!data.length) return null;
    const top = data.reduce((a, b) => (b.sales > a.sales ? b : a));
    return top.sales > 0 ? top : null;
  }, [data]);

  return (
    <Card 
      className="shadow-sm rounded-2xl border border-gray-100 h-full"
      styles={{ body: { padding: '24px' } }}
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={5} style={{ margin: 0, fontWeight: 400 }}>Hourly Sales Peak</Title>
          <Text type="secondary" className="text-xs uppercase tracking-wider font-normal">
            All-Time Transaction Volume by Hour
          </Text>
        </div>
        {peak && (
          <div className="text-right">
            <Text type="secondary" className="text-xs uppercase tracking-wider font-normal block">
              Peak Hour
            </Text>
            <Text strong style={{ color: '#1890ff' }}>
              {peak.hour} · LKR {peak.sales.toLocaleString()}
            </Text>
          </div>
        )}
      </div>

      <div style={{ width: '100%', height: 300, minWidth: 0 }}>
        {chartsLoading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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
                interval={2}
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
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <Empty description="No transaction volume recorded yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        )}
      </div>
    </Card>
  );
};

export default HourlySalesPeakChart;
