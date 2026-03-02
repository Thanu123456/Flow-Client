import React, { useState } from 'react';
import { AlertCircle, Mail, ArrowLeft, Send, CheckCircle2, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ForgotPasswordFormProps {
  onSubmit: (email: string) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  backUrl?: string;
}

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
}) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="text-xs font-semibold text-slate-700 ml-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative group">
      <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-300 flex items-center justify-center ${focusedField === id ? 'text-blue-600 scale-110' : 'text-slate-400 group-hover:text-slate-500'}`}>
        <Icon className="w-4.5 h-4.5" strokeWidth={2.2} />
      </div>
      <input
        id={id}
        type={type}
        value={value || ''}
        onChange={onChange}
        onFocus={() => onFocus(id)}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full pl-11 pr-4 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all duration-300 text-slate-900 text-sm placeholder:text-slate-400 font-medium ${error ? 'border-red-200 bg-red-50/30 focus:border-red-500' : 'border-slate-100 focus:border-blue-500 hover:border-slate-200'} ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}`}
      />
    </div>
    {error && (
      <div className="flex items-center gap-1.5 ml-1 mt-1 text-red-500 animate-in fade-in slide-in-from-left-1 duration-300">
        <AlertCircle className="w-3 h-3" />
        <p className="text-[10px] font-bold uppercase tracking-wider">{error}</p>
      </div>
    )}
  </div>
);

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSubmit,
  loading = false,
  error = null,
  backUrl = '/login',
}) => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setValidationError('Please enter your email address');
      return;
    }
    setValidationError(null);
    setSubmitting(true);
    try {
      await onSubmit(email);
      setSubmittedEmail(email);
      setSubmitted(true);
    } catch {
      // Error handled by parent via prop
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="relative w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto border-2 border-green-100 shadow-xl shadow-green-500/10">
            <CheckCircle2 className="w-10 h-10 text-green-600 animate-in zoom-in spin-in-12 duration-700" strokeWidth={1.5} />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Check Your Email</h2>
          <div className="space-y-2">
            <p className="text-slate-500">
              We've sent a password reset link to:
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-slate-50 rounded-full border border-slate-100 font-bold text-slate-800 text-sm">
              {submittedEmail}
            </div>
          </div>
          <p className="text-xs text-slate-400 max-w-[280px] mx-auto leading-relaxed">
            The link will expire in 1 hour. If you don't see the email, please check your spam folder.
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <p className="text-center text-sm text-slate-500 mt-12 pt-6 pb-4">
            <Link
              to={backUrl}
              className="text-blue-600 font-bold hover:underline transition-colors"
            >
              Back to Login
            </Link>
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="flex items-center justify-center w-full bg-white border-2 border-slate-100 text-slate-600 py-3.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all duration-300 gap-2 active:scale-[0.98]"
          >
            <RefreshCcw className="w-4 h-4" />
            Send Link Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Forgot Password?</h2>
        <p className="text-slate-500 text-sm leading-relaxed">
          No worries! Enter your email address below and we'll send you instructions to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-red-800 leading-none">Reset Failed</p>
              <p className="text-xs text-red-600 leading-relaxed font-medium">{error}</p>
            </div>
          </div>
        )}

        <InputField
          id="email"
          label="Email Address"
          icon={Mail}
          type="email"
          placeholder="Enter your registered email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (validationError) setValidationError(null);
          }}
          onFocus={setFocusedField}
          onBlur={() => setFocusedField(null)}
          focusedField={focusedField}
          error={validationError || undefined}
          required
        />

        <div className="space-y-4 pt-2">
          <button
            type="submit"
            disabled={loading || submitting}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 !text-white py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading || submitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Send Reset Link</span>
                <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </>
            )}
          </button>

          <p className="text-center text-sm text-slate-500 mt-12 pt-6 pb-4">
            <Link
              to={backUrl}
              className="text-blue-600 hover:text-blue-700 font-bold transition-all duration-300 inline-flex items-center gap-2 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Login
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;
