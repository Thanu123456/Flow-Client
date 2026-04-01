import React from 'react';
import { Card, Typography, List, Avatar, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const creditCustomersData = [
  { id: 1, name: 'Saman Kumara', phone: '071 234 5678', balance: 450000, status: 'high' },
  { id: 2, name: 'Nimal Perera', phone: '077 876 5432', balance: 280000, status: 'medium' },
  { id: 3, name: 'City Hardware', phone: '011 234 5678', balance: 195000, status: 'medium' },
  { id: 4, name: 'Sunil Silva', phone: '072 345 6789', balance: 120000, status: 'low' },
  { id: 5, name: 'Ravi Traders', phone: '078 987 6543', balance: 85000, status: 'low' },
  { id: 6, name: 'Mendis & Sons', phone: '075 456 7890', balance: 70000, status: 'low' },
];

export const CreditCustomersList: React.FC = () => {
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
        <Tag color="red" className="font-bold border-red-200">Total: {formatCurrency(1200000)}</Tag>
      </div>

      <List
        itemLayout="horizontal"
        dataSource={creditCustomersData}
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
    </Card>
  );
};

export default CreditCustomersList;
