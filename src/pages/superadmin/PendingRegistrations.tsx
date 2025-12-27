import React, { useState, useEffect } from 'react';
import { Card, Typography, message, Modal } from 'antd';
import PendingRegistrationsTable from '../../components/superadmin/PendingRegistrations/PendingRegistrationsTable';
import RegistrationDetailsModal from '../../components/superadmin/PendingRegistrations/RegistrationDetailsModal';
import RejectModal from '../../components/superadmin/PendingRegistrations/RejectModal';
import { superAdminService } from '../../services/superadmin/superAdminService';
import type { Registration } from '../../types/auth/superadmin.types';

const { Title } = Typography;

const PendingRegistrations: React.FC = () => {
  const [data, setData] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  
  // Modals state
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [isRejectVisible, setIsRejectVisible] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);

  const fetchData = async (page = pagination.current, pageSize = pagination.pageSize) => {
    setLoading(true);
    try {
      const response = await superAdminService.listPendingRegistrations(page, pageSize);
      setData(response.registrations);
      setTotal(response.total);
    } catch (error: any) {
      message.error('Failed to load pending registrations');
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

  const handleView = (reg: Registration) => {
    setSelectedReg(reg);
    setIsDetailsVisible(true);
  };

  const handleApprove = (id: string) => {
    Modal.confirm({
      title: 'Approve Registration',
      content: 'Are you sure you want to approve this registration? This will create a new tenant schema.',
      okText: 'Approve',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await superAdminService.approveRegistration(id);
          message.success('Registration approved successfully');
          fetchData();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Failed to approve registration');
        }
      },
    });
  };

  const handleRejectClick = (id: string) => {
    setSelectedReg(data.find(r => r.id === id) || null);
    setIsRejectVisible(true);
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!selectedReg) return;
    setRejectLoading(true);
    try {
      await superAdminService.rejectRegistration(selectedReg.id, reason);
      message.success('Registration rejected');
      setIsRejectVisible(false);
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to reject registration');
    } finally {
      setRejectLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Pending Registrations</Title>
      <Card>
        <PendingRegistrationsTable
          data={data}
          loading={loading}
          total={total}
          pagination={pagination}
          onTableChange={handleTableChange}
          onView={handleView}
          onApprove={handleApprove}
          onReject={handleRejectClick}
        />
      </Card>

      <RegistrationDetailsModal
        visible={isDetailsVisible}
        registration={selectedReg}
        onClose={() => setIsDetailsVisible(false)}
      />

      <RejectModal
        visible={isRejectVisible}
        loading={rejectLoading}
        onCancel={() => setIsRejectVisible(false)}
        onConfirm={handleRejectConfirm}
      />
    </div>
  );
};

export default PendingRegistrations;
