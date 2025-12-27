import React, { useState, useEffect } from 'react';
import { Card, Typography, message, Modal, Input } from 'antd';
import TenantsTable from '../../components/superadmin/TenantManagement/TenantsTable';
import { superAdminService } from '../../services/superadmin/superAdminService';
import type { Tenant } from '../../types/auth/superadmin.types';

const { Title } = Typography;

const TenantManagement: React.FC = () => {
  const [data, setData] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  
  const fetchData = async (page = pagination.current, pageSize = pagination.pageSize) => {
    setLoading(true);
    try {
      const response = await superAdminService.listTenants(page, pageSize);
      setData(response.tenants);
      setTotal(response.total);
    } catch (error: any) {
      message.error('Failed to load tenants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTableChange = (pag: any) => {
    setPagination(pag);
    fetchData(pag.current, pag.pageSize);
  };

  const handleView = (tenant: Tenant) => {
    // Implement detailed view if needed, for now just show a message
    Modal.info({
        title: 'Tenant Details',
        content: (
            <pre>{JSON.stringify(tenant, null, 2)}</pre>
        ),
        width: 600
    });
  };

  const handleActivate = async (id: string) => {
    try {
        await superAdminService.activateTenant(id);
        message.success('Tenant activated successfully');
        fetchData();
    } catch (error: any) {
        message.error('Failed to activate tenant');
    }
  };

  const handleSuspend = (id: string) => {
    let reason = '';
    Modal.confirm({
        title: 'Suspend Tenant',
        content: (
            <div style={{ marginTop: 16 }}>
                <p>Please enter the reason for suspension:</p>
                <Input.TextArea 
                    rows={4} 
                    onChange={(e) => reason = e.target.value}
                    placeholder="Minimum 10 characters"
                />
            </div>
        ),
        onOk: async () => {
            if (reason.length < 10) {
                message.error('Reason too short');
                return Promise.reject();
            }
            try {
                await superAdminService.suspendTenant(id, reason);
                message.success('Tenant suspended');
                fetchData();
            } catch (error: any) {
                message.error('Failed to suspend tenant');
            }
        }
    });
  };

  const handleDelete = async (id: string) => {
    try {
        await superAdminService.deleteTenant(id);
        message.success('Tenant deleted');
        fetchData();
    } catch (error: any) {
        message.error('Failed to delete tenant');
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Tenant Management</Title>
      <Card>
        <TenantsTable
          data={data}
          loading={loading}
          total={total}
          pagination={pagination}
          onTableChange={handleTableChange}
          onView={handleView}
          onActivate={handleActivate}
          onSuspend={handleSuspend}
          onDelete={handleDelete}
        />
      </Card>
    </div>
  );
};

export default TenantManagement;
