import React, { useState } from 'react';
import { message } from 'antd';
import { Zap, Users, TrendingUp, ArrowLeft, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { LoginRequest, AccountStatus } from '../../types/auth/auth.types';
import { API_URL } from '../../utils/api';
import { useApiError } from '../../hooks/useApiError';
import LoginForm from '../../components/auth/LoginForm';
import { MfaVerification } from '../../components/auth';

// Account status messages per requirements
const STATUS_MESSAGES: Record<AccountStatus, { type: 'warning' | 'error' | 'info'; message: string }> = {
    pending: {
        type: 'warning',
        message: 'Your account is awaiting admin approval. Please check your email for updates. For urgent inquiries, contact: support@yourpos.com'
    },
    rejected: {
        type: 'error',
        message: 'Your registration was not approved. Please contact support for more information: support@yourpos.com'
    },
    suspended: {
        type: 'error',
        message: 'Your account has been temporarily suspended. Please contact support: support@yourpos.com'
    },
    inactive: {
        type: 'info',
        message: 'Your account is currently inactive. Please contact support for assistance.'
    },
    active: {
        type: 'info',
        message: ''
    }
};

const Login: React.FC = () => {
    const { login, mfaRequired, verifyMfaLogin, cancelMfaLogin } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const [statusAlert, setStatusAlert] = useState<{ type: 'warning' | 'error' | 'info'; message: string; reason?: string } | null>(null);
    const [mfaError, setMfaError] = useState<string | null>(null);
    const apiError = useApiError();

    const handleSubmit = async (values: LoginRequest) => {
        setLoading(true);
        setStatusAlert(null);
        try {
            const response = await login(values);

            if (response && 'mfa_required' in response && response.mfa_required) {
                return;
            }

            messageApi.success('Login Successful');

            if (response && 'must_change_password' in response && response.must_change_password) {
                navigate('/change-password');
            } else {
                navigate('/dashboard');
            }
        } catch (error: unknown) {
            console.error('Login Failed:', error);
            const err = error as { response?: { data?: { message?: string; status?: AccountStatus; rejection_reason?: string; error?: { message?: string } } }; message?: string };
            const errorData = err.response?.data;
            const status = errorData?.status;
            const rejectionReason = errorData?.rejection_reason;

            if (status && STATUS_MESSAGES[status]) {
                const statusInfo = STATUS_MESSAGES[status];
                let alertMessage = statusInfo.message;

                if (status === 'rejected' && rejectionReason) {
                    alertMessage = `Your registration was not approved. Reason: ${rejectionReason}. Please contact support for more information: support@yourpos.com`;
                }

                setStatusAlert({
                    type: statusInfo.type,
                    message: alertMessage,
                    reason: rejectionReason
                });
            } else {
                const message = errorData?.error?.message || errorData?.message || err.message || 'Invalid email or password';
                setStatusAlert({
                    type: 'error',
                    message: message
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleMfaVerify = async (code: string) => {
        setMfaError(null);
        try {
            await verifyMfaLogin(code);
            messageApi.success('Login Successful');
            navigate('/dashboard');
        } catch (error: any) {
            const errorMsg = error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Invalid verification code';
            setMfaError(errorMsg);
            throw error;
        }
    };

    const handleCancelMfa = () => {
        cancelMfaLogin();
        setMfaError(null);
    };

    const handleGoogleLogin = () => {
        window.location.href = `${API_URL}/auth/google/login`;
    };

    return (
        <div className="h-screen overflow-hidden bg-white">
            {contextHolder}
            <div className="grid grid-cols-1 lg:grid-cols-2 h-full">

                {/* ── Left Panel ── */}
                <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
                    {/* Animated blobs */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
                        <div className="absolute top-0 right-0 w-72 h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
                        <div className="absolute -bottom-24 left-1/2 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
                    </div>

                    {/* Top: logo + headline + features */}
                    <div className="relative z-10 w-full">
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden p-1 shadow-sm">
                                <img src="/FlowPOS Logo-02.png" alt="FlowPOS Logo" className="w-full h-full object-contain" />
                            </div>
                            <span className="text-xl font-bold text-white">Flow POS</span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-2 leading-tight">
                                    Manage millions of transactions in real-time
                                </h2>
                                <p className="text-slate-300 text-sm">
                                    Enterprise-grade retail management platform trusted by the world's leading retailers
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <div className="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center flex-shrink-0">
                                        <Zap className="w-4 h-4 text-blue-300" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold text-sm">Blazing Fast</h3>
                                        <p className="text-slate-400 text-xs">Sub-millisecond response times for real-time inventory</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center flex-shrink-0">
                                        <Users className="w-4 h-4 text-cyan-300" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold text-sm">Multi-tenant</h3>
                                        <p className="text-slate-400 text-xs">Manage unlimited stores and users seamlessly</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <div className="w-9 h-9 rounded-lg bg-teal-500/20 border border-teal-400/30 flex items-center justify-center flex-shrink-0">
                                        <TrendingUp className="w-4 h-4 text-teal-300" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold text-sm">Advanced Analytics</h3>
                                        <p className="text-slate-400 text-xs">AI-powered insights to drive business growth</p>
                                    </div>
                                </div>
                            </div>

                            {/* ── Radiant Security Card ── */}
                            <div className="mt-4 relative group cursor-default w-full">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-sky-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                                <div className="relative w-full bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl flex items-center">
                                    {/* Mockup / Visual (Left) */}
                                    <div className="hidden sm:flex flex-1 relative h-full min-h-[120px] bg-gradient-to-br from-blue-600/10 to-transparent items-center justify-center p-4 border-r border-white/5">
                                        <div className="relative w-16 h-16">
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-sky-600 rounded-3xl rotate-12 opacity-50 blur-sm"></div>
                                            <div className="relative w-full h-full bg-slate-800 border border-white/20 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500">
                                                <Zap className="w-8 h-8 text-white" />
                                            </div>
                                            {/* Security badges */}
                                            <div className="absolute -top-2 -right-2 bg-blue-500 text-white p-1 rounded-full shadow-lg animate-pulse">
                                                <Zap className="w-3 h-3 fill-current" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Details (Right) */}
                                    <div className="flex-1 p-5 space-y-2">
                                        <div className="inline-flex items-center px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                                            Security First
                                        </div>
                                        <h4 className="text-lg font-bold text-white leading-tight">
                                            Enterprise-grade <br />
                                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300">Data Protection.</span>
                                        </h4>
                                        <p className="text-slate-400 text-[11px] leading-relaxed">
                                            Your data is encrypted and protected by bank-level security protocols.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom: stats card */}
                    <div className="relative z-10 w-full mt-6 pb-6">
                        <div className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 backdrop-blur-md">
                            <div className="grid grid-cols-3 gap-2 w-full">
                                <div className="text-center">
                                    <p className="text-white font-bold text-base leading-none">1.2M+</p>
                                    <p className="text-slate-300 text-[10px] uppercase tracking-wider mt-1.5 opacity-80">Transactions</p>
                                </div>
                                <div className="text-center border-x border-white/10">
                                    <p className="text-white font-bold text-base leading-none">50K+</p>
                                    <p className="text-slate-300 text-[10px] uppercase tracking-wider mt-1.5 opacity-80">Retailers</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-white font-bold text-base leading-none">99.9%</p>
                                    <p className="text-slate-300 text-[10px] uppercase tracking-wider mt-1.5 opacity-80">Uptime</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Right Panel ── */}
                <div className="flex flex-col justify-center items-center p-6 lg:p-8 bg-white overflow-y-auto">
                    <div className="w-full max-w-sm">

                        {/* Mobile-only logo */}
                        <div className="flex lg:hidden items-center space-x-2 mb-6">
                            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center overflow-hidden p-1 shadow-sm">
                                <img src="/FlowPOS Logo-02.png" alt="FlowPOS Logo" className="w-full h-full object-contain" />
                            </div>
                            <span className="text-lg font-bold text-slate-900">Flow POS</span>
                        </div>

                        {mfaRequired ? (
                            /* ── MFA Verification ── */
                            <div>
                                <button
                                    type="button"
                                    onClick={handleCancelMfa}
                                    className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors mb-5"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    <span className="text-sm font-medium">Back to Login</span>
                                </button>
                                <MfaVerification
                                    onSubmit={handleMfaVerify}
                                    loading={loading}
                                    error={mfaError}
                                />
                            </div>
                        ) : (
                            /* ── Login Form ── */
                            <>
                                <div className="mb-8">
                                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h1>
                                    <p className="text-slate-500">Sign in to your owner/admin account</p>
                                </div>

                                {statusAlert && (
                                    <div className={`relative mb-6 p-4 rounded-2xl border flex gap-3 transition-all duration-300 animate-[slideDown_0.3s_ease-out] shadow-sm ${statusAlert.type === 'error' ? 'bg-red-50/80 border-red-100 text-red-900' :
                                        statusAlert.type === 'warning' ? 'bg-amber-50/80 border-amber-100 text-amber-900' :
                                            'bg-blue-50/80 border-blue-100 text-blue-900'
                                        }`}>
                                        <div className="flex-shrink-0 mt-0.5">
                                            {statusAlert.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                                            {statusAlert.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                                            {statusAlert.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
                                        </div>
                                        <div className="flex-1 pr-6">
                                            <h4 className="text-sm font-bold mb-1 opacity-90">
                                                {statusAlert.type === 'warning' ? 'Account Pending' : statusAlert.type === 'error' ? 'Login Failed' : 'Notice'}
                                            </h4>
                                            <p className="text-xs leading-relaxed opacity-80 font-medium">
                                                {statusAlert.message}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setStatusAlert(null)}
                                            className="absolute top-3 right-3 p-1 rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
                                        >
                                            <X className="w-4 h-4 opacity-50" />
                                        </button>
                                    </div>
                                )}

                                {apiError && apiError.status === 429 && (
                                    <div className="mb-6 p-4 rounded-2xl border bg-red-50/80 border-red-100 text-red-900 flex gap-3 shadow-sm animate-[slideDown_0.3s_ease-out]">
                                        <div className="flex-shrink-0 mt-0.5">
                                            <AlertCircle className="w-5 h-5 text-red-500" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold mb-1">Too Many Attempts</h4>
                                            <p className="text-xs font-medium opacity-80">{apiError.message}</p>
                                        </div>
                                    </div>
                                )}

                                <LoginForm
                                    onSubmit={handleSubmit}
                                    onGoogleLogin={handleGoogleLogin}
                                    loading={loading}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
