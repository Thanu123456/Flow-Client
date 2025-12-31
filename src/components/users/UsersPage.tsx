import React, { useState, useEffect, useCallback } from 'react';
import { Card, Input, Button, Space, Select, message, Row, Col } from 'antd';
import { PlusOutlined, ReloadOutlined, FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useUserStore } from '../../store/management/userStore';
import { useRoleStore } from '../../store/management/roleStore';
import { userService } from '../../services/management/userService';
import UsersTable from './UsersTable';
import AddUserModal from './AddUserModal';
import EditUserModal from './EditUserModal';
import UserDetailsModal from './UserDetailsModal';
import ResetPINModal from './ResetPINModal';
import BulkActions from './BulkActions';
import type { User } from '../../types/entities/user.types';
import { useDebounce } from '../../hooks/ui/useDebounce';

const { Search } = Input;

const UsersPage: React.FC = () => {
  const { users, loading, pagination, getUsers, deleteUser, bulkAction } = useUserStore();
  const { getAllRoles, allRoles } = useRoleStore();

  // Modal states
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [resetPINModalVisible, setResetPINModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Selection states
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  // Filter states
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const debouncedSearch = useDebounce(searchText, 300);

  const fetchUsers = useCallback(async (page = 1, limit = 10) => {
    await getUsers({
      page,
      limit,
      search: debouncedSearch || undefined,
      roleId: roleFilter !== 'all' ? roleFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter as 'active' | 'inactive' | 'locked' : undefined,
    });
  }, [getUsers, debouncedSearch, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers(1, pagination.limit);
  }, [debouncedSearch, roleFilter, statusFilter]);

  useEffect(() => {
    getAllRoles();
  }, [getAllRoles]);

  const handlePageChange = (page: number, pageSize: number) => {
    fetchUsers(page, pageSize);
  };

  const handleRefresh = () => {
    setSearchText('');
    setRoleFilter('all');
    setStatusFilter('all');
    setSelectedRowKeys([]);
    fetchUsers(1, pagination.limit);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditModalVisible(true);
  };

  const handleView = (user: User) => {
    setSelectedUser(user);
    setViewModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id);
      message.success('User deleted successfully');
      fetchUsers(pagination.page, pagination.limit);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleResetPIN = (user: User) => {
    setSelectedUser(user);
    setResetPINModalVisible(true);
  };

  const handleAddSuccess = () => {
    setAddModalVisible(false);
    fetchUsers(1, pagination.limit);
  };

  const handleEditSuccess = () => {
    setEditModalVisible(false);
    setSelectedUser(null);
    fetchUsers(pagination.page, pagination.limit);
  };

  const handleResetPINSuccess = () => {
    setResetPINModalVisible(false);
    setSelectedUser(null);
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select users first');
      return;
    }

    try {
      const response = await bulkAction({
        user_ids: selectedRowKeys,
        action,
      });

      if (response.failed > 0) {
        message.warning(`${response.successful} succeeded, ${response.failed} failed`);
      } else {
        message.success(`${response.successful} users ${action}d successfully`);
      }

      setSelectedRowKeys([]);
      fetchUsers(pagination.page, pagination.limit);
    } catch (error: any) {
      message.error(error.response?.data?.message || `Failed to ${action} users`);
    }
  };

  const handleExportPDF = async () => {
    try {
      const blob = await userService.exportToPDF({
        page: 1,
        limit: 1000,
        search: searchText || undefined,
        roleId: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter as any : undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'users.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      message.error('Failed to export PDF');
    }
  };

  const handleExportExcel = async () => {
    try {
      const blob = await userService.exportToExcel({
        page: 1,
        limit: 1000,
        search: searchText || undefined,
        roleId: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter as any : undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'users.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      message.error('Failed to export Excel');
    }
  };

  const roleOptions = [
    { value: 'all', label: 'All Roles' },
    ...allRoles.map(role => ({ value: role.id, label: role.name })),
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Search
              placeholder="Search users..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Select
              style={{ width: '100%' }}
              value={roleFilter}
              onChange={setRoleFilter}
              options={roleOptions}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Select
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'locked', label: 'Locked' },
              ]}
            />
          </Col>
          <Col xs={24} sm={24} md={24} lg={10} style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Space wrap>
              {selectedRowKeys.length > 0 && (
                <BulkActions
                  selectedCount={selectedRowKeys.length}
                  onActivate={() => handleBulkAction('activate')}
                  onDeactivate={() => handleBulkAction('deactivate')}
                  onDelete={() => handleBulkAction('delete')}
                />
              )}
              <Button icon={<FilePdfOutlined />} onClick={handleExportPDF}>
                PDF
              </Button>
              <Button icon={<FileExcelOutlined />} onClick={handleExportExcel}>
                Excel
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
                Refresh
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalVisible(true)}>
                Add User
              </Button>
            </Space>
          </Col>
        </Row>

        <UsersTable
          data={users}
          loading={loading}
          selectedRowKeys={selectedRowKeys}
          onSelectChange={setSelectedRowKeys}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onResetPIN={handleResetPIN}
          onView={handleView}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            onChange: handlePageChange,
          }}
        />
      </Card>

      <AddUserModal
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onSuccess={handleAddSuccess}
      />

      <EditUserModal
        visible={editModalVisible}
        user={selectedUser}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedUser(null);
        }}
        onSuccess={handleEditSuccess}
      />

      <UserDetailsModal
        visible={viewModalVisible}
        user={selectedUser}
        onClose={() => {
          setViewModalVisible(false);
          setSelectedUser(null);
        }}
      />

      <ResetPINModal
        visible={resetPINModalVisible}
        user={selectedUser}
        onCancel={() => {
          setResetPINModalVisible(false);
          setSelectedUser(null);
        }}
        onSuccess={handleResetPINSuccess}
      />
    </div>
  );
};

export default UsersPage;
