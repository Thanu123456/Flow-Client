import React, { useState } from 'react';
import { Checkbox, Row, Col, message } from 'antd';
import { Mail, Lock, User, Phone, ShoppingBag, MapPin, Building2, Eye, EyeOff, FileText, Hash } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { RegisterRequest } from '../../types/auth/auth.types';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import { checkEmailExists } from '../../utils/api';

interface SignupFormProps {
  onSubmit: (values: RegisterRequest) => Promise<void>;
  loading?: boolean;
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
}) => {
  const [formData, setFormData] = useState<Partial<RegisterRequest>>({
    country: 'Sri Lanka',
    business_type: 'retail',
    accept_terms: false,
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (fieldErrors[id]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const validate = async () => {
    const errors: Record<string, string> = {};

    if (!formData.full_name) errors.full_name = 'Full name is required';

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    } else {
      const exists = await checkEmailExists(formData.email);
      if (exists) errors.email = 'Email is already registered';
    }

    if (!formData.phone) {
      errors.phone = 'Phone number is required';
    } else if (!/^(\+94|0)?[0-9]{9,10}$/.test(formData.phone)) {
      errors.phone = 'Invalid phone number format';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.shop_name) errors.shop_name = 'Business name is required';
    if (!formData.address_line1) errors.address_line1 = 'Address is required';
    if (!formData.city) errors.city = 'City is required';
    if (!formData.accept_terms) errors.accept_terms = 'You must accept the Terms & Conditions';

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || submitting) return;

    setSubmitting(true);
    const errors = await validate();
    setFieldErrors(errors);

    if (Object.keys(errors).length === 0) {
      try {
        await onSubmit(formData as RegisterRequest);
      } catch (err) {
        console.error('Submit handle error:', err);
      } finally {
        setSubmitting(false);
      }
    } else {
      setSubmitting(false);
      message.error('Please Fill All the Mandatory Fields, before submitting the Form');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ── Business Info Section ── */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
          <Building2 className="w-4 h-4 mr-2 text-blue-500" />
          Business Information
        </h3>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <InputField
              id="shop_name"
              label="Business Name"
              icon={ShoppingBag}
              placeholder="Your retail shop name"
              value={formData.shop_name}
              onChange={handleInputChange}
              onFocus={setFocusedField}
              onBlur={() => setFocusedField(null)}
              focusedField={focusedField}
              error={fieldErrors.shop_name}
              required
            />
          </Col>
          <Col xs={24} md={12}>
            <div className="space-y-1">
              <label htmlFor="business_type" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                Business Type <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${focusedField === 'business_type' ? 'text-blue-500' : 'text-slate-400'}`} />
                <select
                  id="business_type"
                  value={formData.business_type}
                  onChange={(e) => handleInputChange(e as any)}
                  onFocus={() => setFocusedField('business_type')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 rounded-xl focus:outline-none focus:bg-white transition-all duration-300 text-slate-900 text-sm appearance-none ${focusedField === 'business_type' ? 'border-blue-500' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  {businessTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <InputField
              id="business_registration_number"
              label="Registration No."
              icon={FileText}
              placeholder="BRN (Optional)"
              value={formData.business_registration_number}
              onChange={handleInputChange}
              onFocus={setFocusedField}
              onBlur={() => setFocusedField(null)}
              focusedField={focusedField}
            />
          </Col>
          <Col xs={24} md={12}>
            <InputField
              id="tax_vat_number"
              label="Tax/VAT No."
              icon={Hash}
              placeholder="Optional"
              value={formData.tax_vat_number}
              onChange={handleInputChange}
              onFocus={setFocusedField}
              onBlur={() => setFocusedField(null)}
              focusedField={focusedField}
            />
          </Col>
        </Row>
      </div>

      {/* ── Owner Info Section ── */}
      <div className="space-y-4 pt-2">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
          <User className="w-4 h-4 mr-2 text-blue-500" />
          Owner Information
        </h3>

        <InputField
          id="full_name"
          label="Full Name"
          icon={User}
          placeholder="Enter your legal full name"
          value={formData.full_name}
          onChange={handleInputChange}
          onFocus={setFocusedField}
          onBlur={() => setFocusedField(null)}
          focusedField={focusedField}
          error={fieldErrors.full_name}
          required
        />

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <InputField
              id="email"
              label="Email Address"
              icon={Mail}
              type="email"
              placeholder="name@business.com"
              value={formData.email}
              onChange={handleInputChange}
              onFocus={setFocusedField}
              onBlur={() => setFocusedField(null)}
              focusedField={focusedField}
              error={fieldErrors.email}
              required
            />
          </Col>
          <Col xs={24} md={12}>
            <InputField
              id="phone"
              label="Contact Number"
              icon={Phone}
              placeholder="+94 XX XXX XXXX"
              value={formData.phone}
              onChange={handleInputChange}
              onFocus={setFocusedField}
              onBlur={() => setFocusedField(null)}
              focusedField={focusedField}
              error={fieldErrors.phone}
              required
            />
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <div className="space-y-2">
              <InputField
                id="password"
                label="Password"
                icon={Lock}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                onFocus={setFocusedField}
                onBlur={() => setFocusedField(null)}
                focusedField={focusedField}
                error={fieldErrors.password}
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                required
              />
              <PasswordStrengthMeter password={formData.password || ''} />
            </div>
          </Col>
          <Col xs={24} md={12}>
            <InputField
              id="confirmPassword"
              label="Confirm Password"
              icon={Lock}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (fieldErrors.confirmPassword) {
                  setFieldErrors(prev => {
                    const next = { ...prev };
                    delete next.confirmPassword;
                    return next;
                  });
                }
              }}
              onFocus={() => setFocusedField('confirmPassword')}
              onBlur={() => setFocusedField(null)}
              focusedField={focusedField}
              error={fieldErrors.confirmPassword}
              required
            />
          </Col>
        </Row>
      </div>

      {/* ── Address Section ── */}
      <div className="space-y-4 pt-2">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
          <MapPin className="w-4 h-4 mr-2 text-blue-500" />
          Business Address
        </h3>

        <InputField
          id="address_line1"
          label="Address Line 1"
          icon={MapPin}
          placeholder="Street address or P.O. Box"
          value={formData.address_line1}
          onChange={handleInputChange}
          onFocus={setFocusedField}
          onBlur={() => setFocusedField(null)}
          focusedField={focusedField}
          error={fieldErrors.address_line1}
          required
        />

        <InputField
          id="address_line2"
          label="Address Line 2"
          icon={MapPin}
          placeholder="Apartment, suite, unit, building, floor, etc. (Optional)"
          value={formData.address_line2}
          onChange={handleInputChange}
          onFocus={setFocusedField}
          onBlur={() => setFocusedField(null)}
          focusedField={focusedField}
        />

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <InputField
              id="city"
              label="City"
              icon={MapPin}
              placeholder="Colombo"
              value={formData.city}
              onChange={handleInputChange}
              onFocus={setFocusedField}
              onBlur={() => setFocusedField(null)}
              focusedField={focusedField}
              error={fieldErrors.city}
              required
            />
          </Col>
          <Col xs={24} md={8}>
            <InputField
              id="postal_code"
              label="Postal Code"
              icon={Hash}
              placeholder="Optional"
              value={formData.postal_code}
              onChange={handleInputChange}
              onFocus={setFocusedField}
              onBlur={() => setFocusedField(null)}
              focusedField={focusedField}
            />
          </Col>
          <Col xs={24} md={8}>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Country</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  disabled
                  value="Sri Lanka"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-2 border-slate-200 rounded-xl text-slate-500 text-sm cursor-not-allowed"
                />
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <div className="pt-8 space-y-10">
        <div className="mb-8">
          <Checkbox
            checked={formData.accept_terms}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, accept_terms: e.target.checked }));
              if (fieldErrors.accept_terms) {
                setFieldErrors(prev => { const next = { ...prev }; delete next.accept_terms; return next; });
              }
            }}
            className="text-slate-600 text-sm"
          >
            I agree to the <Link to="/terms" className="text-blue-600 font-semibold hover:underline">Terms & Conditions</Link> and <Link to="/privacy" className="text-blue-600 font-semibold hover:underline">Privacy Policy</Link>
          </Checkbox>
          {fieldErrors.accept_terms && (
            <p className="text-[11px] text-red-500 ml-1 mt-1">{fieldErrors.accept_terms}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || submitting}
          className={`w-full py-3.5 rounded-xl !text-white font-bold text-sm uppercase tracking-widest transition-all duration-300 shadow-lg ${loading || submitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 active:scale-[0.98] shadow-blue-500/25 hover:shadow-blue-500/40'}`}
        >
          {loading || submitting ? (
            <div className="flex items-center justify-center !text-white">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span className="!text-white">Processing...</span>
            </div>
          ) : <span className="!text-white">Complete Registration</span>}
        </button>

        <p className="text-center text-sm text-slate-500 mt-12 pt-6 pb-4">
          Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Sign In</Link>
        </p>
      </div>
    </form>
  );
};

export default SignupForm;
