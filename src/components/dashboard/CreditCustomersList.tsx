import React from 'react';
import { Card, Typography, List, Avatar, Tag, Skeleton, Empty } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useDashboardStore } from '../../store/reports/dashboardStore';

const { Title, Text } = Typography;

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export const CreditCustomersList: React.FC = () => {
    const { charts, chartsLoading } = useDashboardStore();

    const data = React.useMemo(() => {
        if (!charts?.creditCustomers) return [];
        return charts.creditCustomers;
    }, [charts]);

    const totalOutstanding = React.useMemo(() => {
        return data.reduce((sum, item) => sum + item.balance, 0);
    }, [data]);

  return (
    <Card 
      className="shadow-sm rounded-2xl border border-gray-100 h-full"
      styles={{ body: { padding: '24px', height: '100%' } }}
    >
      <div className="mb-6 flex justify-between items-center">
        <div>
          <Title level={5} style={{ margin: 0, fontWeight: 800 }}>Top Credit Customers</Title>
          <Text type="secondary" className="text-xs uppercase tracking-wider font-semibold">
            By Outstanding Balance
          </Text>
        </div>
        {!chartsLoading && data.length > 0 && (
            <Tag color="red" className="font-bold border-red-200">Total: {formatCurrency(totalOutstanding)}</Tag>
        )}
      </div>

      {chartsLoading ? (
          <Skeleton active avatar paragraph={{ rows: 6 }} />
      ) : data.length > 0 ? (
        <List
            itemLayout="horizontal"
            dataSource={data}
            renderItem={(item) => (
            <List.Item
                className="border-b border-gray-50 py-3 cursor-pointer hover:bg-gray-50 transition-colors rounded-lg px-2"
            >
                <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} className="bg-blue-100 text-blue-600" />}
                title={<span className="font-bold text-gray-800 text-sm">{item.name}</span>}
                description={<span className="text-xs text-gray-400">{item.phone}</span>}
                />
                <div className="text-right">
                <div 
                    className={`text-sm font-extrabold ${
                    item.status === 'high' ? 'text-red-500' : 
                    item.status === 'medium' ? 'text-orange-500' : 'text-gray-700'
                    }`}
                >
                    {formatCurrency(item.balance)}
                </div>
                <div className="text-xs text-gray-400 font-medium">Pending</div>
                </div>
            </List.Item>
            )}
        />
      ) : (
          <div className="flex items-center justify-center h-full min-h-[300px]">
              <Empty description="No outstanding credit customers" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
      )}
    </Card>
  );
};

export default CreditCustomersList;
