import React from 'react';
import { Card, Col, Row, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  DollarOutlined, ShoppingCartOutlined, DatabaseOutlined, FundOutlined,
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
    description: 'Coming soon.',
    icon: <ShoppingCartOutlined style={{ fontSize: 28, color: '#bbb' }} />,
  },
  {
    key: 'inventory',
    title: 'Inventory Report',
    description: 'Coming soon.',
    icon: <DatabaseOutlined style={{ fontSize: 28, color: '#bbb' }} />,
  },
  {
    key: 'financial',
    title: 'Financial Report',
    description: 'Coming soon.',
    icon: <FundOutlined style={{ fontSize: 28, color: '#bbb' }} />,
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
