import React, { useState, useEffect } from 'react';
import { Table, Card, Typography, Tag, message, Input } from 'antd';
import { superAdminService } from '../../services/superadmin/superAdminService';
import type { AuditLog } from '../../types/auth/superadmin.types';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Search } = Input;

const SystemLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });

  const fetchLogs = async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const data = await superAdminService.listAuditLogs(page, pageSize);
      setLogs(data.logs);
      setTotal(data.total);
    } catch (error) {
      message.error('Failed to load system logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(pagination.current, pagination.pageSize);
  }, [pagination.current, pagination.pageSize]);

  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
      width: 180,
    },
    {
      title: 'Action',
      dataIndex: 'action_type',
      key: 'action_type',
      render: (action: string) => (
        <Tag color="geekblue">{action?.toUpperCase() || 'UNKNOWN'}</Tag>
      ),
    },
    {
        title: 'Actor',
        dataIndex: 'user_email',
        key: 'user_email',
    },
    {
      title: 'Module',
      dataIndex: 'entity_type',
      key: 'entity_type',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'IP Address',
      dataIndex: 'ip_address',
      key: 'ip_address',
      width: 120,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'success' ? 'green' : 'red'}>
          {status?.toUpperCase() || 'N/A'}
        </Tag>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>System Audit Logs</Title>
      </div>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
             <Search 
                placeholder="Search logs..." 
                onSearch={value => console.log(value)} 
                style={{ width: 300 }} 
            />
        </div>
        <Table
          columns={columns}
          dataSource={logs}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            total,
            showSizeChanger: true,
            onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
          }}
        />
      </Card>
    </div>
  );
};

export default SystemLogs;
