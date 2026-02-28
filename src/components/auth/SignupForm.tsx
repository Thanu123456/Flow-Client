import React, { useState } from 'react';
import { Form, Input, Button, Select, Checkbox, Alert, Row, Col, Typography } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined, PhoneOutlined, ShopOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import type { RegisterRequest } from '../../types/auth/auth.types';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import { checkEmailExists } from '../../utils/api';

const { Text } = Typography;

interface SignupFormProps {
  onSubmit: (values: RegisterRequest) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

const businessTypes = [
  { value: 'retail', label: 'Retail' },
  { value: 'wholesale', label: 'Wholesale' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'cafe', label: 'Cafe' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'supermarket', label: 'Supermarket' },
  { value: 'other', label: 'Other' },
];

interface InputFieldProps {
  id: string;
  label: string;
  icon: any;
  type?: string;
  placeholder?: string;
  value?: string;
  error?: string;
  required?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus: (id: string) => void;
  onBlur: () => void;
  disabled?: boolean;
  focusedField: string | null;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  icon: Icon,
  type = 'text',
  placeholder,
  value,
  error,
  required = false,
  onChange,
  onFocus,
  onBlur,
  disabled = false,
  focusedField,
  showPassword,
  onTogglePassword,
}) => (
  <div className="space-y-1">
    <label htmlFor={id} className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <Icon className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${focusedField === id ? 'text-blue-500' : 'text-slate-400'}`} />
      <input
        id={id}
        type={type}
        value={value || ''}
        onChange={onChange}
        onFocus={() => onFocus(id)}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 rounded-xl focus:outline-none focus:bg-white transition-all duration-300 text-slate-900 text-sm placeholder:text-slate-400 ${error ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-blue-500 hover:border-slate-300'} ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`}
      />
      {id === 'password' && onTogglePassword && (
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
        >
          {!showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      )}
    </div>
    {error && <p className="text-[11px] text-red-500 ml-1 mt-0.5">{error}</p>}
  </div>
);

const SignupForm: React.FC<SignupFormProps> = ({
  onSubmit,
  loading = false,
  error = null,
}) => {

  const [formData, setFormData] = useState<Partial<RegisterRequest>>({
    country: 'Sri Lanka',
    business_type: 'retail'
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [password, setPassword] = useState('');

  const handleSubmit = async (values: RegisterRequest) => {
    setSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  };

  const validateEmail = async (_: unknown, value: string) => {
    if (!value) return Promise.resolve();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return Promise.reject('Please enter a valid email');
    }
    const exists = await checkEmailExists(value);
    if (exists) {
      return Promise.reject('This email is already registered');
    }
    return Promise.resolve();
  };

  const validatePassword = (_: unknown, value: string) => {
    if (!value) return Promise.reject('Please enter a password');
    if (value.length < 8) return Promise.reject('Password must be at least 8 characters');
    if (!/[A-Z]/.test(value)) return Promise.reject('Password must contain at least one uppercase letter');
    if (!/[a-z]/.test(value)) return Promise.reject('Password must contain at least one lowercase letter');
    if (!/[0-9]/.test(value)) return Promise.reject('Password must contain at least one number');
    if (!/[^A-Za-z0-9]/.test(value)) return Promise.reject('Password must contain at least one special character');
    return Promise.resolve();
  };

  return (
    <Form
      form={form}
      name="register"
      onFinish={handleSubmit}
      layout="vertical"
      requiredMark="optional"
      scrollToFirstError
    >
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Business Information */}
      <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 16 }}>
        Business Information
      </Text>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            name="shop_name"
            label="Shop/Business Name"
            rules={[
              { required: true, message: 'Please enter your business name' },
              { min: 3, message: 'Business name must be at least 3 characters' },
              { max: 100, message: 'Business name cannot exceed 100 characters' },
            ]}
          >
            <Input prefix={<ShopOutlined />} placeholder="Enter business name" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="business_type"
            label="Business Type"
            rules={[{ required: true, message: 'Please select your business type' }]}
          >
            <Select placeholder="Select business type" options={businessTypes} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item name="business_registration_number" label="Business Registration Number">
            <Input placeholder="Optional" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="tax_vat_number" label="Tax/VAT Number">
            <Input placeholder="Optional" />
          </Form.Item>
        </Col>
      </Row>

      {/* Owner Information */}
      <Text strong style={{ fontSize: 16, display: 'block', marginTop: 24, marginBottom: 16 }}>
        Owner Information
      </Text>

      <Form.Item
        name="full_name"
        label="Full Name"
        rules={[
          { required: true, message: 'Please enter your full name' },
          { min: 3, message: 'Name must be at least 3 characters' },
        ]}
      >
        <Input prefix={<UserOutlined />} placeholder="Enter your full name" />
      </Form.Item>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { validator: validateEmail },
            ]}
            validateTrigger="onBlur"
          >
            <Input prefix={<MailOutlined />} placeholder="Enter your email" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[
              { required: true, message: 'Please enter your phone number' },
              { pattern: /^(\+94|0)?[0-9]{9,10}$/, message: 'Please enter a valid phone number' },
            ]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="+94 XX XXX XXXX" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ validator: validatePassword }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Create a strong password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Item>
          <PasswordStrengthMeter password={password} />
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="confirm_password"
            label="Confirm Password"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject('Passwords do not match');
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Confirm your password" />
          </Form.Item>
        </Col>
      </Row>

      {/* Business Address */}
      <Text strong style={{ fontSize: 16, display: 'block', marginTop: 24, marginBottom: 16 }}>
        Business Address
      </Text>

      <Form.Item
        name="address_line1"
        label="Address Line 1"
        rules={[{ required: true, message: 'Please enter your address' }]}
      >
        <Input prefix={<EnvironmentOutlined />} placeholder="Street address" />
      </Form.Item>

      <Form.Item name="address_line2" label="Address Line 2">
        <Input placeholder="Apartment, suite, etc. (optional)" />
      </Form.Item>

      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item
            name="city"
            label="City"
            rules={[{ required: true, message: 'Please enter your city' }]}
          >
            <Input placeholder="City" />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="postal_code" label="Postal Code">
            <Input placeholder="Postal code (optional)" />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="country" label="Country" initialValue="Sri Lanka">
            <Input disabled />
          </Form.Item>
        </Col>
      </Row>

      {/* Terms & Conditions */}
      <Form.Item
        name="accept_terms"
        valuePropName="checked"
        rules={[
          {
            validator: (_, value) =>
              value ? Promise.resolve() : Promise.reject('You must accept the terms and conditions'),
          },
        ]}
      >
        <Checkbox>
          I agree to the <Link to="/terms">Terms & Conditions</Link> and{' '}
          <Link to="/privacy">Privacy Policy</Link>
        </Checkbox>
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          block
          loading={loading || submitting}
        >
          Register
        </Button>
      </Form.Item>

      <div style={{ textAlign: 'center' }}>
        Already have an account? <Link to="/login">Sign In</Link>
      </div>
    </Form >
  );
};

export default SignupForm;
