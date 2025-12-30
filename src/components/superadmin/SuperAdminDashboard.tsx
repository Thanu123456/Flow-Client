import React, { useEffect, useState } from 'react';
import {
  Card,
  Col,
  Row,
  Statistic,
  Spin,
  message,
  Typography,
  Badge,
  Space,
  Table,
  Tag,
  Tabs,
  Progress,
  Tooltip
} from 'antd';
import {
  UserOutlined,
  ShopOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DatabaseOutlined,
  CloudServerOutlined,
  LoginOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { superAdminService } from '../../services/superadmin/superAdminService';
import type {
  DashboardFullResponse,
  RecentRegistration,
  RecentLogin,
  RecentApproval
} from '../../types/auth/superadmin.types';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

const SuperAdminDashboardComponent: React.FC = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<DashboardFullResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await superAdminService.getFullDashboard();
        setDashboard(data);
      } catch (error: any) {
        console.error(error);
        message.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const getHealthBadgeStatus = (health: string): 'success' | 'warning' | 'error' => {
    switch (health) {
      case 'healthy':
        return 'success';
      case 'degraded':
        return 'warning';
      case 'down':
        return 'error';
      default:
        return 'warning';
    }
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleString();
  };

  const formatRelativeTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Table columns for Recent Registrations
  const registrationColumns: ColumnsType<RecentRegistration> = [
    {
      title: 'Shop Name',
      dataIndex: 'shop_name',
      key: 'shop_name',
      render: (text, record) => (
        <a onClick={() => navigate(`/superadmin/registrations/${record.tenant_id}`)}>
          {text}
        </a>
      )
    },
    {
      title: 'Owner',
      key: 'owner',
      render: (_, record) => (
        <div>
          <div>{record.owner_name}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.owner_email}</Text>
        </div>
      )
    },
    {
      title: 'Days Pending',
      dataIndex: 'days_pending',
      key: 'days_pending',
      render: (days, record) => (
        <Space>
          <span>{days} days</span>
          {record.is_urgent && (
            <Tag color="red" icon={<ExclamationCircleOutlined />}>Urgent</Tag>
          )}
        </Space>
      )
    },
    {
      title: 'Submitted',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => formatRelativeTime(date)
    }
  ];

  // Table columns for Recent Logins
  const loginColumns: ColumnsType<RecentLogin> = [
    {
      title: 'User',
      key: 'user',
      render: (_, record) => (
        <div>
          <div>{record.full_name}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
        </div>
      )
    },
    {
      title: 'Type',
      dataIndex: 'user_type',
      key: 'user_type',
      render: (type) => (
        <Tag color={type === 'superadmin' ? 'purple' : type === 'owner' ? 'blue' : 'default'}>
          {type}
        </Tag>
      )
    },
    {
      title: 'Tenant',
      dataIndex: 'tenant_name',
      key: 'tenant_name',
      render: (name) => name || '-'
    },
    {
      title: 'IP Address',
      dataIndex: 'ip_address',
      key: 'ip_address'
    },
    {
      title: 'Time',
      dataIndex: 'login_at',
      key: 'login_at',
      render: (date) => formatRelativeTime(date)
    }
  ];

  // Table columns for Recent Approvals
  const approvalColumns: ColumnsType<RecentApproval> = [
    {
      title: 'Shop Name',
      dataIndex: 'shop_name',
      key: 'shop_name'
    },
    {
      title: 'Approved By',
      dataIndex: 'approved_by',
      key: 'approved_by'
    },
    {
      title: 'Approved At',
      dataIndex: 'approved_at',
      key: 'approved_at',
      render: (date) => formatDate(date)
    }
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  const { summary, recent_activity } = dashboard || {};
  const { pending_registrations, total_tenants, active_users, system_status } = summary || {};

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Super Admin Dashboard</Title>
      <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
        System-wide overview and real-time statistics
      </Text>

      {/* Summary Cards */}
      <Row gutter={[16, 16]}>
        {/* Pending Registrations Card */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            onClick={() => navigate('/superadmin/registrations')}
            style={{ cursor: 'pointer' }}
          >
            <Statistic
              title="Pending Registrations"
              value={pending_registrations?.count || 0}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
            {(pending_registrations?.urgent_count || 0) > 0 && (
              <div style={{ marginTop: 8 }}>
                <Tag color="red" icon={<ExclamationCircleOutlined />}>
                  {pending_registrations?.urgent_count} Urgent
                </Tag>
              </div>
            )}
          </Card>
        </Col>

        {/* Total Tenants Card */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            onClick={() => navigate('/superadmin/tenants')}
            style={{ cursor: 'pointer' }}
          >
            <Statistic
              title="Total Tenants"
              value={total_tenants?.count || 0}
              prefix={<ShopOutlined style={{ color: '#1890ff' }} />}
            />
            <div style={{ marginTop: 8 }}>
              <Space size="small" wrap>
                <Tag color="green">{total_tenants?.active_count || 0} Active</Tag>
                {(total_tenants?.suspended_count || 0) > 0 && (
                  <Tag color="red">{total_tenants?.suspended_count} Suspended</Tag>
                )}
              </Space>
            </div>
            {total_tenants?.growth_percent !== undefined && (
              <div style={{ marginTop: 4 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {total_tenants.growth_percent >= 0 ? (
                    <span style={{ color: '#52c41a' }}>
                      <ArrowUpOutlined /> {total_tenants.growth_percent}%
                    </span>
                  ) : (
                    <span style={{ color: '#ff4d4f' }}>
                      <ArrowDownOutlined /> {Math.abs(total_tenants.growth_percent)}%
                    </span>
                  )}{' '}
                  vs last month
                </Text>
              </div>
            )}
          </Card>
        </Col>

        {/* Active Users Card */}
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Active Users"
              value={active_users?.active_users || 0}
              prefix={<UserOutlined style={{ color: '#52c41a' }} />}
              suffix={`/ ${active_users?.total_users || 0}`}
            />
            <div style={{ marginTop: 8 }}>
              <Space>
                <TeamOutlined style={{ color: '#1890ff' }} />
                <Text type="secondary">
                  {active_users?.currently_logged_in || 0} online now
                </Text>
              </Space>
            </div>
          </Card>
        </Col>

        {/* System Status Card */}
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <div className="ant-statistic">
              <div className="ant-statistic-title">System Health</div>
              <div className="ant-statistic-content">
                <Space>
                  <Badge status={getHealthBadgeStatus(system_status?.database_health || 'down')} />
                  <Text strong style={{ textTransform: 'capitalize' }}>
                    {system_status?.database_health || 'Unknown'}
                  </Text>
                </Space>
              </div>
            </div>
            <div style={{ marginTop: 8 }}>
              <Row gutter={[8, 8]}>
                <Col span={12}>
                  <Tooltip title="Database Latency">
                    <Space size={4}>
                      <DatabaseOutlined />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {system_status?.database_latency_ms || 0}ms
                      </Text>
                    </Space>
                  </Tooltip>
                </Col>
                <Col span={12}>
                  <Tooltip title="API Uptime">
                    <Space size={4}>
                      <CloudServerOutlined />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {system_status?.api_uptime_percent?.toFixed(2) || 0}%
                      </Text>
                    </Space>
                  </Tooltip>
                </Col>
              </Row>
            </div>
          </Card>
        </Col>
      </Row>

      {/* System Resources (if available) */}
      {(system_status?.disk_usage_percent !== undefined || system_status?.memory_usage_mb !== undefined) && (
        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          <Col span={24}>
            <Card title="System Resources">
              <Row gutter={24}>
                {system_status?.disk_usage_percent !== undefined && (
                  <Col xs={24} sm={12} md={8}>
                    <div>
                      <Text type="secondary">Disk Usage</Text>
                      <Progress
                        percent={system_status.disk_usage_percent}
                        status={system_status.disk_usage_percent > 90 ? 'exception' : 'normal'}
                      />
                    </div>
                  </Col>
                )}
                {system_status?.memory_usage_mb !== undefined && (
                  <Col xs={24} sm={12} md={8}>
                    <Statistic
                      title="Memory Usage"
                      value={system_status.memory_usage_mb}
                      suffix="MB"
                    />
                  </Col>
                )}
                {system_status?.last_backup_time && (
                  <Col xs={24} sm={12} md={8}>
                    <Statistic
                      title="Last Backup"
                      value={formatRelativeTime(system_status.last_backup_time)}
                    />
                  </Col>
                )}
              </Row>
            </Card>
          </Col>
        </Row>
      )}

      {/* Recent Activity Section */}
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card title="Recent Activity">
            <Tabs
              defaultActiveKey="registrations"
              items={[
                {
                  key: 'registrations',
                  label: (
                    <span>
                      <ClockCircleOutlined />
                      Recent Registrations
                      {(recent_activity?.recent_registrations?.length || 0) > 0 && (
                        <Badge
                          count={recent_activity?.recent_registrations?.length}
                          style={{ marginLeft: 8 }}
                          size="small"
                        />
                      )}
                    </span>
                  ),
                  children: (
                    <Table
                      columns={registrationColumns}
                      dataSource={recent_activity?.recent_registrations || []}
                      rowKey="tenant_id"
                      pagination={false}
                      size="small"
                      locale={{ emptyText: 'No pending registrations' }}
                    />
                  )
                },
                {
                  key: 'logins',
                  label: (
                    <span>
                      <LoginOutlined />
                      Recent Logins
                    </span>
                  ),
                  children: (
                    <Table
                      columns={loginColumns}
                      dataSource={recent_activity?.recent_logins || []}
                      rowKey="user_id"
                      pagination={false}
                      size="small"
                      locale={{ emptyText: 'No recent logins' }}
                    />
                  )
                },
                {
                  key: 'approvals',
                  label: (
                    <span>
                      <CheckCircleOutlined />
                      Recent Approvals
                    </span>
                  ),
                  children: (
                    <Table
                      columns={approvalColumns}
                      dataSource={recent_activity?.recent_approvals || []}
                      rowKey="tenant_id"
                      pagination={false}
                      size="small"
                      locale={{ emptyText: 'No recent approvals' }}
                    />
                  )
                }
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SuperAdminDashboardComponent;
