import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Spin, message, Typography, Badge, Space } from 'antd';
import {
  UserOutlined,
  ShopOutlined,
  SafetyCertificateOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { superAdminService } from '../../services/superadmin/superAdminService';
import type { DashboardStats } from '../../types/auth/superadmin.types';

const { Title, Text } = Typography;

const SuperAdminDashboardComponent: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await superAdminService.getDashboardStats();
        setStats(data);
      } catch (error: any) {
        console.error(error);
        message.error('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Super Admin Dashboard</Title>
      <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
        System-wide overview and real-time statistics
      </Text>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="Pending Registrations"
              value={stats?.pending_registrations || 0}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="Total Tenants"
              value={stats?.total_tenants || 0}
              prefix={<ShopOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="Active Users"
              value={stats?.active_users || 0}
              prefix={<UserOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
             <div className="ant-statistic">
                <div className="ant-statistic-title">System Health</div>
                <div className="ant-statistic-content">
                    <Space>
                        <Badge status={stats?.system_status.database_healthy ? "success" : "error"} />
                        <Text strong>{stats?.system_status.database_healthy ? "Healthy" : "Degraded"}</Text>
                    </Space>
                </div>
             </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card title="System Information">
             <Row gutter={24}>
                <Col span={8}>
                    <Statistic title="API Uptime" value={stats?.system_status.api_uptime || 0} suffix="%" />
                </Col>
                <Col span={8}>
                    <Statistic title="Last Backup" value={stats?.system_status.last_backup || 'Never'} />
                </Col>
                <Col span={8}>
                     <Statistic 
                        title="License Status" 
                        value="Active" 
                        prefix={<SafetyCertificateOutlined style={{ color: '#52c41a' }} />}
                    />
                </Col>
             </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SuperAdminDashboardComponent;
