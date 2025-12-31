import React, { useState, useEffect, useCallback } from 'react';
import { Card, Input, Button, Space, Select, message, Row, Col } from 'antd';
import { PlusOutlined, ReloadOutlined, FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useRoleStore } from '../../store/management/roleStore';
import { roleService } from '../../services/management/roleService';
import RolesTable from './RolesTable';
import AddRoleModal from './AddRoleModal';
import EditRoleModal from './EditRoleModal';
import ViewPermissionsModal from './ViewPermissionsModal';
import type { Role } from '../../types/entities/role.types';
import { useDebounce } from '../../hooks/ui/useDebounce';

const { Search } = Input;

const RolesPage: React.FC = () => {
  const { roles, loading, pagination, getRoles, deleteRole } = useRoleStore();

  // Modal states
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewPermissionsVisible, setViewPermissionsVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Filter states
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const debouncedSearch = useDebounce(searchText, 300);

  const fetchRoles = useCallback(async (page = 1, limit = 10) => {
    await getRoles({
      page,
      limit,
      search: debouncedSearch || undefined,
      includeInactive: statusFilter === 'all' || statusFilter === 'inactive',
      includeSystem: typeFilter === 'all' || typeFilter === 'system',
    });
  }, [getRoles, debouncedSearch, statusFilter, typeFilter]);

  useEffect(() => {
    fetchRoles(1, pagination.limit);
  }, [debouncedSearch, statusFilter, typeFilter]);

  // Filter roles based on status and type filters
  const filteredRoles = roles.filter(role => {
    if (statusFilter === 'active' && !role.isActive) return false;
    if (statusFilter === 'inactive' && role.isActive) return false;
    if (typeFilter === 'system' && !role.isSystem) return false;
    if (typeFilter === 'custom' && role.isSystem) return false;
    return true;
  });

  const handlePageChange = (page: number, pageSize: number) => {
    fetchRoles(page, pageSize);
  };

  const handleRefresh = () => {
    setSearchText('');
    setStatusFilter('all');
    setTypeFilter('all');
    fetchRoles(1, pagination.limit);
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setEditModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRole(id);
      message.success('Role deleted successfully');
      fetchRoles(pagination.page, pagination.limit);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to delete role');
    }
  };

  const handleViewPermissions = (role: Role) => {
    setSelectedRole(role);
    setViewPermissionsVisible(true);
  };

  const handleAddSuccess = () => {
    setAddModalVisible(false);
    fetchRoles(1, pagination.limit);
    message.success('Role created successfully');
  };

  const handleEditSuccess = () => {
    setEditModalVisible(false);
    setSelectedRole(null);
    fetchRoles(pagination.page, pagination.limit);
    message.success('Role updated successfully');
  };

  const handleExportPDF = async () => {
    try {
      const blob = await roleService.exportToPDF({
        page: 1,
        limit: 1000,
        search: searchText || undefined,
        includeInactive: statusFilter !== 'active',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'roles.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      message.error('Failed to export PDF');
    }
  };

  const handleExportExcel = async () => {
    try {
      const blob = await roleService.exportToExcel({
        page: 1,
        limit: 1000,
        search: searchText || undefined,
        includeInactive: statusFilter !== 'active',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'roles.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      message.error('Failed to export Excel');
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Search
              placeholder="Search roles..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
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
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Select
              style={{ width: '100%' }}
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'system', label: 'System Roles' },
                { value: 'custom', label: 'Custom Roles' },
              ]}
            />
          </Col>
          <Col xs={24} sm={24} md={24} lg={10} style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Space wrap>
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
                Add Role
              </Button>
            </Space>
          </Col>
        </Row>

        <RolesTable
          data={filteredRoles}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewPermissions={handleViewPermissions}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            onChange: handlePageChange,
          }}
        />
      </Card>

      <AddRoleModal
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onSuccess={handleAddSuccess}
      />

      <EditRoleModal
        visible={editModalVisible}
        role={selectedRole}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedRole(null);
        }}
        onSuccess={handleEditSuccess}
      />

      <ViewPermissionsModal
        visible={viewPermissionsVisible}
        role={selectedRole}
        onClose={() => {
          setViewPermissionsVisible(false);
          setSelectedRole(null);
        }}
      />
    </div>
  );
};

export default RolesPage;
