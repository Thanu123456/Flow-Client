import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, message, Modal, Input, Form, Select, Switch, Row, Col } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import UsersTable from '../../components/users/UsersTable';
import { userService } from '../../services/management/userService';
import { roleService } from '../../services/management/roleService';
import type { User } from '../../types/entities/user.types';
import type { Role } from '../../types/entities/role.types';

const { Title } = Typography;
const { Option } = Select;

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersData, rolesData] = await Promise.all([
        userService.listUsers(),
        roleService.listRoles()
      ]);
      setUsers(usersData);
      setRoles(rolesData);
    } catch (error: any) {
      message.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({ status: 'active', kiosk_enabled: false });
    setIsModalVisible(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await userService.deleteUser(id);
      message.success('User deleted successfully');
      fetchData();
    } catch (error: any) {
      message.error('Failed to delete user');
    }
  };

  const handleResetPIN = async (id: string) => {
    try {
      const { pin } = await userService.resetPIN(id);
      Modal.success({
        title: 'PIN Reset Successful',
        content: (
          <div>
            <p>The new temporary PIN is:</p>
            <Title level={2} style={{ textAlign: 'center' }}>{pin}</Title>
            <p>Please share this PIN with the user. They will be required to change it upon first use.</p>
          </div>
        ),
      });
    } catch (error: any) {
      message.error('Failed to reset PIN');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        await userService.updateUser(editingUser.id, values);
        message.success('User updated successfully');
      } else {
        await userService.createUser({ ...values, user_type: 'employee' });
        message.success('User created successfully');
      }
      setIsModalVisible(false);
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to save user');
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2}>User Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Add Employee
        </Button>
      </div>

      <Card>
        <UsersTable
          data={users}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onResetPIN={handleResetPIN}
        />
      </Card>

      <Modal
        title={editingUser ? 'Edit User' : 'Add Employee'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="full_name" label="Full Name" rules={[{ required: true, message: 'Required' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Valid email required' }]}>
                <Input disabled={!!editingUser} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phone" label="Phone">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="role_id" label="Role" rules={[{ required: true, message: 'Required' }]}>
                <Select placeholder="Select Role">
                  {roles.map(role => (
                    <Option key={role.id} value={role.id}>{role.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          {!editingUser && (
            <Form.Item name="password" label="Temporary Password" rules={[{ required: true, min: 8 }]}>
              <Input.Password />
            </Form.Item>
          )}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="status" label="Status">
                <Select>
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="kiosk_enabled" label="Kiosk Access" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;
