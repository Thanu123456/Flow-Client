import React from 'react';
import { Card, Typography, Skeleton, Empty } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useDashboardStore } from '../../store/reports/dashboardStore';

const { Title, Text } = Typography;

const getSpeedColor = (days: number) => {
  if (days <= 7) return '#52c41a';
  if (days <= 20) return '#1890ff';
  return '#faad14';
};

const InventoryTurnoverChart: React.FC = () => {
    const { charts, chartsLoading } = useDashboardStore();

    const data = React.useMemo(() => {
        const raw = charts?.inventoryTurnover ?? [];
        console.log('[InventoryTurnoverChart] raw inventoryTurnover:', raw.length, 'items', raw);
        return raw.map(p => ({ item: p.item, days: p.days }));
    }, [charts]);

  return (
    <Card 
      className="shadow-sm rounded-2xl border border-gray-100 h-full"
      styles={{ body: { padding: '24px' } }}
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={5} style={{ margin: 0, fontWeight: 400 }}>Inventory Turnover</Title>
          <Text type="secondary" className="text-xs uppercase tracking-wider font-normal">
            Average Days On Hand
          </Text>
        </div>
      </div>

      <div style={{ width: '100%', height: 300 }}>
        {chartsLoading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
        ) : data.length > 0 ? (
          <ResponsiveContainer>
            <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
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
        ) : (
            <div className="flex items-center justify-center h-full">
                <Empty description="No inventory turnover data" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        )}
      </div>
    </Card>
  );
};

export default InventoryTurnoverChart;
