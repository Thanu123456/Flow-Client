import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Divider, Alert, Space } from 'antd';
import { MailOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import type { LoginRequest } from '../../types/auth/auth.types';

interface LoginFormProps {
  onSubmit: (values: LoginRequest) => Promise<void>;
  onGoogleLogin?: () => void;
  loading?: boolean;
  error?: string | null;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  onGoogleLogin,
  loading = false,
  error = null,
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: LoginRequest) => {
    setSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form
      form={form}
      name="login"
      onFinish={handleSubmit}
      layout="vertical"
      requiredMark={false}
      initialValues={{ remember_me: false }}
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

<<<<<<< Updated upstream
      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: 'Please enter your email' },
          { type: 'email', message: 'Please enter a valid email' },
        ]}
      >
        <Input
          prefix={<MailOutlined />}
          placeholder="Enter your email"
          size="large"
          autoComplete="email"
        />
      </Form.Item>

      <Form.Item
        name="password"
        label="Password"
        rules={[{ required: true, message: 'Please enter your password' }]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Enter your password"
          size="large"
          autoComplete="current-password"
        />
      </Form.Item>

      <Form.Item>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Form.Item name="remember_me" valuePropName="checked" noStyle>
            <Checkbox>Remember me</Checkbox>
          </Form.Item>
          <Link to="/forgot-password">Forgot Password?</Link>
        </Space>
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          block
          loading={loading || submitting}
        >
          Sign In
        </Button>
      </Form.Item>
=======
      {/* Email */}
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-xs font-semibold text-slate-700 ml-1">
          Email Address
        </label>
        <div className="relative group">
          <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${focusedField === 'email' ? 'text-blue-500' : 'text-slate-400'
            }`} />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setValidationErrors(prev => ({ ...prev, email: undefined })); }}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
            placeholder="Enter your email"
            autoComplete="email"
            className={`w-full pl-11 pr-4 py-2.5 bg-slate-50 border-2 rounded-xl focus:outline-none focus:bg-white transition-all duration-300 text-slate-900 text-sm placeholder:text-slate-400 ${validationErrors.email
              ? 'border-red-400 focus:border-red-500'
              : 'border-slate-200 focus:border-blue-500 hover:border-slate-300'
              }`}
          />
        </div>
        {validationErrors.email && (
          <p className="text-[11px] text-red-500 ml-1">{validationErrors.email}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-xs font-semibold text-slate-700 ml-1">
            Password
          </label>
        </div>
        <div className="relative group">
          <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${focusedField === 'password' ? 'text-blue-500' : 'text-slate-400'
            }`} />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setValidationErrors(prev => ({ ...prev, password: undefined })); }}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
            placeholder="Enter your password"
            autoComplete="current-password"
            className={`w-full pl-11 pr-11 py-2.5 bg-slate-50 border-2 rounded-xl focus:outline-none focus:bg-white transition-all duration-300 text-slate-900 text-sm placeholder:text-slate-400 ${validationErrors.password
              ? 'border-red-400 focus:border-red-500'
              : 'border-slate-200 focus:border-blue-500 hover:border-slate-300'
              }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200 p-1"
            tabIndex={-1}
          >
            {!showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {validationErrors.password && (
          <p className="text-[11px] text-red-500 ml-1">{validationErrors.password}</p>
        )}
      </div>

      {/* Remember me + Forgot password */}
      <div className="flex items-center justify-between px-0.5">
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all"
          />
          <span className="text-xs text-slate-600 group-hover:text-slate-900 transition-colors font-medium">
            Remember me
          </span>
        </label>
        <Link
          to="/forgot-password"
          className="text-xs text-blue-600 hover:text-blue-700 font-bold transition-colors"
        >
          Forgot password?
        </Link>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 !text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin !text-white" />
        ) : (
          <>
            <span className="!text-white">Sign in to Account</span>
            <ArrowRight className="w-4 h-4 !text-white" />
          </>
        )}
      </button>
>>>>>>> Stashed changes

  {
    onGoogleLogin && (
      <>
        <Divider plain>or</Divider>
        <Form.Item>
          <Button
            icon={<GoogleOutlined />}
            size="large"
            block
            onClick={onGoogleLogin}
            disabled={loading || submitting}
          >
            Continue with Google
          </Button>
        </Form.Item>
      </>
    )
  }

<<<<<<< Updated upstream
  <div style={{ textAlign: 'center', marginTop: 16 }}>
    Don't have an account? <Link to="/register">Register</Link>
  </div>
    </Form >
=======
      {/* Register link */}
      <p className="text-center text-xs text-slate-500 pt-6">
        Don't have an account?{' '}
        <Link
          to="/register"
          className="text-blue-600 hover:text-blue-700 font-bold transition-colors"
        >
          Register here
        </Link>
      </p>
    </form>
>>>>>>> Stashed changes
  );
};

export default LoginForm;
