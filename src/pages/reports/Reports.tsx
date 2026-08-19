import React from 'react';
import { Card, Col, Row, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  DollarOutlined, ShoppingCartOutlined, DatabaseOutlined, FundOutlined,
  HistoryOutlined, TrophyOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface ReportEntry {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path?: string;
}

const REPORTS: ReportEntry[] = [
  {
    key: 'sales',
    title: 'Sales Report',
    description: 'Financial summary, payment reconciliation, and product/category performance for a date range.',
    icon: <DollarOutlined style={{ fontSize: 28, color: '#1677ff' }} />,
    path: '/reports/sales',
  },
  {
    key: 'purchases',
    title: 'Purchase Report',
    description: 'GRN list and analytics — totals, discounts, outstanding balance, top suppliers and items.',
    icon: <ShoppingCartOutlined style={{ fontSize: 28, color: '#1677ff' }} />,
    path: '/reports/purchases',
  },
  {
    key: 'inventory',
    title: 'Stock Report',
    description: 'Current stock levels, valuation, low/out-of-stock alerts, and batch/expiry export.',
    icon: <DatabaseOutlined style={{ fontSize: 28, color: '#1677ff' }} />,
    path: '/reports/inventory',
  },
  {
    key: 'financial',
    title: 'Profit & Loss Report',
    description: 'Revenue, gross/net profit, expenses, and estimated profit from remaining stock.',
    icon: <FundOutlined style={{ fontSize: 28, color: '#1677ff' }} />,
    path: '/reports/financial',
  },
  {
    key: 'log-history',
    title: 'Log History Report',
    description: 'Cashier session log — cash/card totals per shift, live sessions, and leaderboard.',
    icon: <HistoryOutlined style={{ fontSize: 28, color: '#1677ff' }} />,
    path: '/reports/log-history',
  },
  {
    key: 'top-selling',
    title: 'Top Selling Product Report',
    description: 'Ranks products by revenue and quantity sold, with peak hour/day per product.',
    icon: <TrophyOutlined style={{ fontSize: 28, color: '#1677ff' }} />,
    path: '/reports/top-selling',
  },
];

const Reports: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '12px 24px' }}>
      <Title level={4} style={{ margin: '0 0 16px' }}>Reports</Title>
      <Row gutter={[16, 16]}>
        {REPORTS.map((r) => (
          <Col xs={24} sm={12} lg={6} key={r.key}>
            <Card
              hoverable={!!r.path}
              onClick={() => r.path && navigate(r.path)}
              style={{ opacity: r.path ? 1 : 0.6, cursor: r.path ? 'pointer' : 'default', height: '100%' }}
            >
              <div style={{ marginBottom: 12 }}>{r.icon}</div>
              <Title level={5} style={{ margin: '0 0 4px' }}>{r.title}</Title>
              <Text type="secondary" style={{ fontSize: 12 }}>{r.description}</Text>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Reports;
