import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, message, Modal, Input, Form, Checkbox, Row, Col, Divider } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import RolesTable from '../../components/roles/RolesTable';
import { roleService } from '../../services/management/roleService';
import { PERMISSIONS } from '../../types/auth/permissions';
import type { Role } from '../../types/entities/role.types';

const { Title } = Typography;

const Roles: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPermModalVisible, setIsPermModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [form] = Form.useForm();

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const data = await roleService.listRoles();
      setRoles(data);
    } catch (error: any) {
      message.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleCreate = () => {
    setEditingRole(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    form.setFieldsValue(role);
    setIsModalVisible(true);
  };

  const handleManagePermissions = (role: Role) => {
    setEditingRole(role);
    // Backend returns permission objects, we need the codes
    const codes = role.permissions?.map(p => p.code) || [];
    setSelectedPermissions(codes);
    setIsPermModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await roleService.deleteRole(id);
      message.success('Role deleted successfully');
      fetchRoles();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to delete role');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingRole) {
        await roleService.updateRole(editingRole.id, values);
        message.success('Role updated successfully');
      } else {
        await roleService.createRole({ ...values, permissions: [] });
        message.success('Role created successfully');
      }
      setIsModalVisible(false);
      fetchRoles();
    } catch (error: any) {
      message.error('Failed to save role');
    }
  };

  const handlePermOk = async () => {
    if (!editingRole) return;
    try {
      await roleService.assignPermissions(editingRole.id, selectedPermissions);
      message.success('Permissions updated successfully');
      setIsPermModalVisible(false);
      fetchRoles();
    } catch (error: any) {
      message.error('Failed to update permissions');
    }
  };

  // Group permissions by module (first part of the code)
  const groupedPermissions = Object.values(PERMISSIONS).reduce((acc: any, code: string) => {
    const module = code.split('.')[0];
    if (!acc[module]) acc[module] = [];
    acc[module].push(code);
    return acc;
  }, {});

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2}>Role Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Create Role
        </Button>
      </div>

      <Card>
        <RolesTable
          data={roles}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onManagePermissions={handleManagePermissions}
        />
      </Card>

      <Modal
        title={editingRole ? 'Edit Role' : 'Create Role'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Role Name" rules={[{ required: true, message: 'Please enter role name' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          {editingRole && (
             <Form.Item name="is_active" valuePropName="checked">
                <Checkbox>Active</Checkbox>
             </Form.Item>
          )}
        </Form>
      </Modal>

      <Modal
        title={`Manage Permissions - ${editingRole?.name}`}
        open={isPermModalVisible}
        onOk={handlePermOk}
        onCancel={() => setIsPermModalVisible(false)}
        width={800}
      >
        <Checkbox.Group 
            value={selectedPermissions} 
            onChange={(values: any) => setSelectedPermissions(values)}
            style={{ width: '100%' }}
        >
          {Object.entries(groupedPermissions).map(([module, perms]: [string, any]) => (
            <div key={module} style={{ marginBottom: 16 }}>
              <Divider orientation="left" style={{ margin: '12px 0' }}>
                <Typography.Text strong style={{ textTransform: 'capitalize' }}>{module}</Typography.Text>
              </Divider>
              <Row>
                {perms.map((p: string) => (
                  <Col span={8} key={p}>
                    <Checkbox value={p} style={{ marginBottom: 8 }}>
                        {p.split('.')[1].replace('_', ' ').toUpperCase()}
                    </Checkbox>
                  </Col>
                ))}
              </Row>
            </div>
          ))}
        </Checkbox.Group>
      </Modal>
    </div>
  );
};

export default Roles;
