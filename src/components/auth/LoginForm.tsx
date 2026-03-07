import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const errors: { email?: string; password?: string } = {};
    if (!email) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!password) {
      errors.password = 'Password is required';
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || isLoading) return;

    const errors = validate();
    setValidationErrors(errors);

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      try {
        await onSubmit({ email, password, remember_me: rememberMe });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {error && (
        <div className="mb-4">
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-medium">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        </div>
      )}

      {/* Email Address */}
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-xs font-semibold text-slate-700 ml-1">
          Email Address
        </label>
        <div className="relative group">
          <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${focusedField === 'email' ? 'text-blue-500' : 'text-slate-400'}`} />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setValidationErrors(prev => ({ ...prev, email: undefined })); }}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
            placeholder="Enter your email"
            autoComplete="email"
            className={`w-full pl-11 pr-4 py-3 bg-slate-50 border-2 rounded-xl focus:outline-none focus:bg-white transition-all duration-300 text-slate-900 text-sm placeholder:text-slate-400 ${validationErrors.email ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-blue-500 hover:border-slate-300'}`}
          />
        </div>
        {validationErrors.email && (
          <p className="text-[11px] text-red-500 ml-1">{validationErrors.email}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label htmlFor="password" className="text-xs font-semibold text-slate-700 ml-1">
          Password
        </label>
        <div className="relative group">
          <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${focusedField === 'password' ? 'text-blue-500' : 'text-slate-400'}`} />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setValidationErrors(prev => ({ ...prev, password: undefined })); }}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
            placeholder="Enter your password"
            autoComplete="current-password"
            className={`w-full pl-11 pr-12 py-3 bg-slate-50 border-2 rounded-xl focus:outline-none focus:bg-white transition-all duration-300 text-slate-900 text-sm placeholder:text-slate-400 ${validationErrors.password ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-blue-500 hover:border-slate-300'}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200 p-1"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {validationErrors.password && (
          <p className="text-[11px] text-red-500 ml-1">{validationErrors.password}</p>
        )}
      </div>

      {/* Remember Me & Forgot Password */}
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

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || isLoading}
        className={`w-full bg-gradient-to-r from-blue-600 to-blue-500 !text-white py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading || isLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <div className="flex items-center justify-center gap-2 !text-white">
            <span className="!text-white">Sign in to Account</span>
            <ArrowRight className="w-4 h-4 !text-white" />
          </div>
        )}
      </button>

      {/* Google Login */}
      {onGoogleLogin && (
        <>
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-medium tracking-widest">or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onGoogleLogin}
            className="w-full bg-white border-2 border-slate-200 text-slate-700 py-3.5 rounded-xl text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 flex items-center justify-center gap-2.5 active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.954,4,4,12.954,4,24s8.954,20,20,20s20-8.954,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.321-11.285-7.961l-6.522,5.045C9.552,39.539,16.221,44,24,44z" />
              <path fill="#1976D2" d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
            </svg>
            <span>Google</span>
          </button>
        </>
      )}

      {/* Register Link */}
      <p className="text-center text-sm text-slate-500 mt-12 pt-6 pb-4">
        Don't have an account?{' '}
        <Link to="/register" className="text-blue-600 hover:text-blue-700 font-bold transition-colors">
          Register here
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;
