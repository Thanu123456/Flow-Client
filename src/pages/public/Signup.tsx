import React, { useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Select, 
  Checkbox, 
  Typography, 
  Divider, 
  Card, 
  message, 
  Row, 
  Col,
  theme,
  Modal
} from 'antd';
import { UserOutlined, ShopOutlined, EnvironmentOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { RegisterRequest } from '../../types/auth/auth.types';
import PasswordStrengthMeter from '../../components/auth/PasswordStrengthMeter';
import { checkEmailExists } from '../../utils/api';

const { Title, Text } = Typography;
const { Option } = Select;

const SRI_LANKAN_CITIES = ['Colombo', 'Kandy', 'Galle', 'Jaffna', 'Negombo', 'Anuradhapura', 'Trincomalee', 'Batticaloa', 'Kurunegala', 'Ratnapura'];

const Signup: React.FC = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const { token } = theme.useToken();
    const [messageApi, contextHolder] = message.useMessage();
    const [password, setPassword] = useState('');

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const requestData: RegisterRequest = {
                shop_name: values.shop_name,
                business_type: values.business_type,
                business_registration_number: values.business_registration_number,
                tax_vat_number: values.tax_vat_number,
                full_name: values.full_name,
                email: values.email,
                phone: values.phone,
                password: values.password,
                address_line1: values.address_line1,
                address_line2: values.address_line2,
                city: values.city,
                postal_code: values.postal_code,
                country: 'Sri Lanka',
                accept_terms: values.accept_terms,
            };

            await register(requestData);
            
            Modal.success({
                title: 'Registration Submitted Successfully!',
                content: 'Your account is pending approval from our admin team. You will be notified via email once approved.',
                onOk: () => navigate('/login'),
                okText: 'Go to Login'
            });

        } catch (error: any) {
            console.error(error);
            const errorMsg = error.response?.data?.message || 'Registration failed. Please try again.';
            messageApi.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: token.colorBgLayout, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            padding: '24px'
        }}>
            {contextHolder}
            <Card 
                style={{ 
                    width: '100%', 
                    maxWidth: 800, 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)' 
                }}
                variant="borderless"
            >
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{ 
                        height: 48, 
                        width: 48, 
                        background: token.colorPrimary, 
                        borderRadius: 8, 
                        margin: '0 auto 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                     }}>
                        <ShopOutlined style={{ fontSize: 24, color: '#fff' }} />
                    </div>
                    <Title level={2} style={{ margin: 0 }}>Create your Account</Title>
                    <Text type="secondary">Start your 14-day free trial, no credit card required.</Text>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    scrollToFirstError
                    requiredMark="optional"
                    initialValues={{
                        business_type: 'retail',
                        country: 'Sri Lanka'
                    }}
                >
                    <Divider orientation="left">Business Information</Divider>
                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="shop_name"
                                label="Shop / Business Name"
                                rules={[
                                    { required: true, message: 'Please enter your shop name' }, 
                                    { min: 3, message: 'Must be at least 3 characters' },
                                    { max: 100, message: 'Must be less than 100 characters' }
                                ]}
                            >
                                <Input prefix={<ShopOutlined />} placeholder="e.g. John's Grocery" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="business_type"
                                label="Business Type"
                                rules={[{ required: true, message: 'Please select business type' }]}
                            >
                                <Select>
                                    <Option value="retail">Retail</Option>
                                    <Option value="wholesale">Wholesale</Option>
                                    <Option value="restaurant">Restaurant</Option>
                                    <Option value="cafe">Cafe</Option>
                                    <Option value="pharmacy">Pharmacy</Option>
                                    <Option value="supermarket">Supermarket</Option>
                                    <Option value="other">Other</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="business_registration_number"
                                label="Business Reg. Number"
                            >
                                <Input placeholder="Optional" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="tax_vat_number"
                                label="Tax / VAT Number"
                            >
                                <Input placeholder="Optional" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation="left">Owner Information</Divider>
                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="full_name"
                                label="Full Name"
                                rules={[
                                    { required: true, message: 'Please enter your full name' },
                                    { min: 3, message: 'Must be at least 3 characters' }
                                ]}
                            >
                                <Input prefix={<UserOutlined />} placeholder="John Doe" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="email"
                                label="Email"
                                validateTrigger="onBlur"
                                rules={[
                                    { type: 'email', message: 'The input is not valid E-mail!' },
                                    { required: true, message: 'Please enter your email' },
                                    {
                                        validator: async (_, value) => {
                                            if (value && value.includes('@')) {
                                                const exists = await checkEmailExists(value);
                                                if (exists) {
                                                    return Promise.reject(new Error('This email is already registered.'));
                                                }
                                            }
                                            return Promise.resolve();
                                        },
                                    }
                                ]}
                            >
                                <Input prefix={<MailOutlined />} placeholder="john@example.com" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="phone"
                                label="Phone Number"
                                rules={[
                                    { required: true, message: 'Please enter your phone number' },
                                    { 
                                        pattern: /^\+94 \d{2} \d{3} \d{4}$/, 
                                        message: 'Format must be +94 XX XXX XXXX' 
                                    }
                                ]}
                            >
                                <Input prefix={<PhoneOutlined />} placeholder="+94 77 123 4567" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                             <Form.Item
                                name="password"
                                label="Password"
                                rules={[
                                    { required: true, message: 'Please input your password!' },
                                    { min: 8, message: 'Password must be at least 8 characters' },
                                    { 
                                        pattern: /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/,
                                        message: 'Must include uppercase, lowercase, number, and special char'
                                    }
                                ]}
                            >
                                <Input.Password 
                                    prefix={<LockOutlined />} 
                                    placeholder="Password" 
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </Form.Item>
                            <PasswordStrengthMeter password={password} />
                        </Col>
                        <Col xs={24} sm={12}>
                             <Form.Item
                                name="confirm"
                                label="Confirm Password"
                                dependencies={['password']}
                                hasFeedback
                                rules={[
                                    { required: true, message: 'Please confirm your password!' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('password') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('The two passwords that you entered do not match!'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation="left">Address</Divider>
                    <Row gutter={16}>
                         <Col xs={24}>
                            <Form.Item
                                name="address_line1"
                                label="Address Line 1"
                                rules={[{ required: true, message: 'Please enter address' }]}
                            >
                                <Input prefix={<EnvironmentOutlined />} placeholder="123 Main St" />
                            </Form.Item>
                        </Col>
                         <Col xs={24} sm={12}>
                            <Form.Item
                                name="address_line2"
                                label="Address Line 2"
                            >
                                <Input placeholder="Apartment, suite, etc." />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="city"
                                label="City"
                                rules={[{ required: true, message: 'Please select city' }]}
                            >
                                <Select showSearch placeholder="Select a city">
                                    {SRI_LANKAN_CITIES.map(city => (
                                        <Option key={city} value={city}>{city}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="postal_code"
                                label="Postal Code"
                            >
                                <Input placeholder="10000" />
                            </Form.Item>
                        </Col>
                         <Col xs={24} sm={12}>
                            <Form.Item
                                name="country"
                                label="Country"
                            >
                                <Input disabled />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="accept_terms"
                        valuePropName="checked"
                        rules={[
                            {
                                validator: (_, value) =>
                                    value ? Promise.resolve() : Promise.reject(new Error('Should accept terms')),
                            },
                        ]}
                    >
                        <Checkbox>
                            I accept the <Link to="/terms">Terms and Conditions</Link> and <Link to="/privacy">Privacy Policy</Link>
                        </Checkbox>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                            Register Business
                        </Button>
                    </Form.Item>

                    <div style={{ textAlign: 'center' }}>
                        <Text type="secondary">Already have an account? </Text>
                        <Link to="/login">Login</Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default Signup;
