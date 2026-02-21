import React, { useState } from 'react';
import { ShoppingBag, Mail, Lock, User, Phone, MapPin, Briefcase, Hash, Globe, ChevronRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { RegisterRequest } from '../../types/auth/auth.types';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
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

const SignupForm: React.FC<SignupFormProps> = ({
  onSubmit,
  loading = false,
}) => {
  const [formData, setFormData] = useState<Partial<RegisterRequest>>({
    country: 'Sri Lanka',
    business_type: 'retail'
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = async () => {
    const newErrors: Record<string, string> = {};

    if (!formData.shop_name || formData.shop_name.length < 3) newErrors.shop_name = 'Business name must be at least 3 characters';
    if (!formData.business_type) newErrors.business_type = 'Please select business type';

    if (!formData.full_name || formData.full_name.length < 3) newErrors.full_name = 'Full name must be at least 3 characters';

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    } else {
      const exists = await checkEmailExists(formData.email);
      if (exists) newErrors.email = 'This email is already registered';
    }

    if (!formData.phone || !/^(\+94|0)?[0-9]{9,10}$/.test(formData.phone)) {
      newErrors.phone = 'Valid phone number is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Min 8 characters';
    } else if (!/[A-Z]/.test(formData.password) || !/[a-z]/.test(formData.password) || !/[0-9]/.test(formData.password) || !/[^A-Za-z0-9]/.test(formData.password)) {
      newErrors.password = 'Must include upper, lower, number, & symbol';
    }

    if (formData.password !== confirmPassword) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    if (!formData.address_line1) newErrors.address_line1 = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.accept_terms) newErrors.accept_terms = 'You must accept terms';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof RegisterRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const isValid = await validate();
    if (!isValid) {
      setSubmitting(false);
      return;
    }
    try {
      await onSubmit(formData as RegisterRequest);
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = loading || submitting;

  const InputField = ({ id, label, icon: Icon, type = 'text', placeholder, value, error, required = false, onChange, disabled = false }: any) => (
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
          onChange={onChange || ((e: any) => handleChange(id, e.target.value))}
          onFocus={() => setFocusedField(id)}
          onBlur={() => setFocusedField(null)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 rounded-xl focus:outline-none focus:bg-white transition-all duration-300 text-slate-900 text-sm placeholder:text-slate-400 ${error ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-blue-500 hover:border-slate-300'} ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`}
        />
        {id === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && <p className="text-[11px] text-red-500 ml-1 mt-0.5">{error}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>

      {/* ── Section: Business Details ── */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <ShoppingBag className="w-4 h-4 text-blue-600" />
          </div>
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">Business Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            id="shop_name"
            label="Shop/Business Name"
            icon={ShoppingBag}
            placeholder="e.g. Acme Retail"
            value={formData.shop_name}
            error={errors.shop_name}
            required
          />
          <div className="space-y-1">
            <label htmlFor="business_type" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
              Business Type <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Briefcase className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${focusedField === 'business_type' ? 'text-blue-500' : 'text-slate-400'}`} />
              <select
                id="business_type"
                value={formData.business_type}
                onChange={(e) => handleChange('business_type', e.target.value)}
                onFocus={() => setFocusedField('business_type')}
                onBlur={() => setFocusedField(null)}
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 rounded-xl focus:outline-none focus:bg-white transition-all duration-300 text-slate-900 text-sm appearance-none ${errors.business_type ? 'border-red-400' : 'border-slate-200 focus:border-blue-500'}`}
              >
                {businessTypes.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          <InputField
            id="business_registration_number"
            label="Registration Number"
            icon={Hash}
            placeholder="Optional"
            value={formData.business_registration_number}
          />
          <InputField
            id="tax_vat_number"
            label="Tax/VAT Number"
            icon={Hash}
            placeholder="Optional"
            value={formData.tax_vat_number}
          />
        </div>
      </div>

      {/* ── Section: Personal Details ── */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <User className="w-4 h-4 text-indigo-600" />
          </div>
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">Owner Information</h2>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <InputField
            id="full_name"
            label="Full Name"
            icon={User}
            placeholder="Enter your full name"
            value={formData.full_name}
            error={errors.full_name}
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              id="email"
              label="Email Address"
              icon={Mail}
              type="email"
              placeholder="name@company.com"
              value={formData.email}
              error={errors.email}
              required
            />
            <InputField
              id="phone"
              label="Phone Number"
              icon={Phone}
              placeholder="+94 XX XXX XXXX"
              value={formData.phone}
              error={errors.phone}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <InputField
                id="password"
                label="Password"
                icon={Lock}
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={formData.password}
                error={errors.password}
                required
              />
              {formData.password && <PasswordStrengthIndicator password={formData.password} />}
            </div>
            <InputField
              id="confirm_password"
              label="Confirm Password"
              icon={Lock}
              type={showPassword ? 'text' : 'password'}
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e: any) => {
                setConfirmPassword(e.target.value);
                if (errors.confirm_password) setErrors(prev => ({ ...prev, confirm_password: '' }));
              }}
              error={errors.confirm_password}
              required
            />
          </div>
        </div>
      </div>

      {/* ── Section: Address ── */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-emerald-600" />
          </div>
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">Business Address</h2>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <InputField
            id="address_line1"
            label="Address Line 1"
            icon={MapPin}
            placeholder="Street address or P.O. Box"
            value={formData.address_line1}
            error={errors.address_line1}
            required
          />
          <InputField
            id="address_line2"
            label="Address Line 2"
            icon={MapPin}
            placeholder="Apartment, suite, unit, building, floor, etc. (optional)"
            value={formData.address_line2}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField
              id="city"
              label="City"
              icon={MapPin}
              placeholder="Colombo"
              value={formData.city}
              error={errors.city}
              required
            />
            <InputField
              id="postal_code"
              label="Postal Code"
              icon={Hash}
              placeholder="Optional"
              value={formData.postal_code}
            />
            <InputField
              id="country"
              label="Country"
              icon={Globe}
              value={formData.country}
              disabled
            />
          </div>
        </div>
      </div>

      {/* ── Terms & Submit ── */}
      <div className="pt-4 space-y-4">
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative flex items-center h-5">
            <input
              type="checkbox"
              id="accept_terms"
              checked={formData.accept_terms || false}
              onChange={(e) => handleChange('accept_terms', e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
          </div>
          <div className="text-xs leading-5">
            <span className="text-slate-600">I agree to the </span>
            <Link to="/terms" className="text-blue-600 font-semibold hover:underline">Terms & Conditions</Link>
            <span className="text-slate-600"> and </span>
            <Link to="/privacy" className="text-blue-600 font-semibold hover:underline">Privacy Policy</Link>
          </div>
        </label>
        {errors.accept_terms && <p className="text-[11px] text-red-500 ml-7 -mt-3">{errors.accept_terms}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="group relative w-full bg-slate-900 text-white py-3.5 rounded-xl text-sm font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Create My Account</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="bg-blue-50/50 rounded-xl p-4 flex items-start space-x-3 border border-blue-100">
        <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-[11px] font-bold text-blue-900 uppercase tracking-wider">Free Trial Includes:</h4>
          <p className="text-[11px] text-blue-700 leading-relaxed mt-1">
            Full access to all features, including inventory management, multi-store support, and advanced reporting.
          </p>
        </div>
      </div>

    </form>
  );
};

export default SignupForm;

