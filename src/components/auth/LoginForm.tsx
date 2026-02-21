import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
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
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const errors: { email?: string; password?: string } = {};
    if (!email) {
      errors.email = 'Please enter your email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email';
    }
    if (!password) errors.password = 'Please enter your password';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit({ email, password, remember_me: rememberMe } as LoginRequest);
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = loading || submitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>

      {/* Server-side error */}
      {error && (
        <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-xl">
          <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

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
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <span>Sign in to Account</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Google login */}
      {onGoogleLogin && (
        <>
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 border-t border-slate-200" />
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Or continue with</span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          <button
            type="button"
            onClick={onGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="text-xs font-bold text-slate-700">Continue with Google</span>
          </button>
        </>
      )}

      {/* Register link */}
      <p className="text-center text-xs text-slate-500 pt-2">
        Don't have an account?{' '}
        <Link
          to="/register"
          className="text-blue-600 hover:text-blue-700 font-bold transition-colors"
        >
          Register here
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;
