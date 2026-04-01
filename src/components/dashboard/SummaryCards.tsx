import React from 'react';
import { Card, Row, Col, Typography, Avatar } from 'antd';
import { 
  DollarOutlined, 
  ShoppingCartOutlined, 
  UndoOutlined, 
  BankOutlined, 
  FallOutlined,
  RiseOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

// Formatter for currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export const SummaryCards: React.FC = () => {
  // Static mock data for demonstration
  const stats = [
    {
      title: 'Total Sales',
      amount: 4520000,
      icon: <ShoppingCartOutlined />,
      color: '#1890ff',
      bgColor: '#e6f7ff',
      trend: '+12.5%',
      isPositive: true
    },
    {
      title: 'Sales Return',
      amount: 125000,
      icon: <UndoOutlined />,
      color: '#ff4d4f',
      bgColor: '#fff1f0',
      trend: '-2.4%',
      isPositive: true // less returns is good
    },
    {
      title: 'Purchases (GRN)',
      amount: 2850000,
      icon: <BankOutlined />,
      color: '#faad14',
      bgColor: '#fffbe6',
      trend: '+5.2%',
      isPositive: false
    },
    {
      title: 'Net Sales',
      amount: 4395000,
      icon: <RiseOutlined />,
      color: '#52c41a',
      bgColor: '#f6ffed',
      trend: '+15.3%',
      isPositive: true
    },
    {
      title: 'Expenses',
      amount: 420000,
      icon: <FallOutlined />,
      color: '#cf1322',
      bgColor: '#fff1f0',
      trend: '+1.2%',
      isPositive: false
    },
    {
      title: 'Net Profit',
      amount: 1125000,
      icon: <DollarOutlined />,
      color: '#722ed1',
      bgColor: '#f9f0ff',
      trend: '+18.7%',
      isPositive: true
    }
  ];

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      {stats.map((stat, index) => (
        <Col xs={24} sm={12} md={8} lg={4} key={index}>
          <Card 
            bordered={false} 
            className="shadow-sm rounded-2xl border border-gray-100 h-full"
            styles={{ body: { padding: '20px' } }}
          >
            <div className="flex justify-between items-start mb-4">
              <Avatar 
                size={40} 
                icon={stat.icon} 
                style={{ backgroundColor: stat.bgColor, color: stat.color, fontSize: '18px' }} 
              />
              <div 
                className={`text-xs font-bold px-2 py-1 rounded-full ${
                  stat.isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                }`}
              >
                {stat.trend}
              </div>
            </div>
            <div>
              <Text type="secondary" className="text-xs uppercase tracking-wider font-semibold mb-1 block">
                {stat.title}
              </Text>
              <Title level={4} style={{ margin: 0, fontWeight: 800 }}>
                {formatCurrency(stat.amount)}
              </Title>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default SummaryCards;
