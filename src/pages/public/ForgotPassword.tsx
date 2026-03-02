import React, { useState } from 'react';
import { ShieldCheck, RefreshCcw, Key, Mail } from 'lucide-react';
import { authService } from '../../services/auth/authService';
import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm';

const ForgotPassword: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (email: string) => {
        setLoading(true);
        setError(null);
        try {
            await authService.forgotPassword(email);
        } catch (err: unknown) {
            console.error('Forgot Password Failed:', err);
            const error = err as { response?: { data?: { message?: string } } };
            const errorMsg = error.response?.data?.message || 'Failed to process request';
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen overflow-hidden bg-white">
            <div className="grid grid-cols-1 lg:grid-cols-2 h-full">

                {/* ── Left Panel: Recovery Theme ── */}
                <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
                    {/* Animated blobs */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
                        <div className="absolute top-20 right-0 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
                        <div className="absolute -bottom-24 left-1/2 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
                    </div>

                    {/* Top Content */}
                    <div className="relative z-10 w-full space-y-8">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 overflow-hidden p-1">
                                <img src="/FlowPOS Logo-02.png" alt="FlowPOS Logo" className="w-full h-full object-contain" />
                            </div>
                            <span className="text-xl font-bold text-white tracking-tight">Flow POS</span>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                                    Secure Account <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Recovery.</span>
                                </h2>
                                <p className="text-slate-300 text-lg max-w-sm font-light">
                                    Quick and secure password reset to get you back to managing your business.
                                </p>
                            </div>

                            <div className="space-y-5">
                                <div className="flex items-start space-x-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                                        <Key className="w-5 h-5 text-blue-300" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold text-base">Encrypted Link</h3>
                                        <p className="text-slate-400 text-sm">One-time use recovery links sent directly to your inbox.</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                                        <ShieldCheck className="w-5 h-5 text-indigo-300" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold text-base">Multi-factor Shield</h3>
                                        <p className="text-slate-400 text-sm">Global security standards ensuring your account stays yours.</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-500/20 border border-slate-400/30 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                                        <RefreshCcw className="w-5 h-5 text-slate-300" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold text-base">Session Revocation</h3>
                                        <p className="text-slate-400 text-sm">Automatically log out of other devices after a reset.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Spotlight Card */}
                            <div className="relative group cursor-default w-full">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                                <div className="relative w-full bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl flex items-center">
                                    <div className="hidden sm:flex flex-1 relative h-full min-h-[140px] bg-gradient-to-br from-blue-600/10 to-transparent items-center justify-center p-5 border-r border-white/5">
                                        <div className="relative w-16 h-16">
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl rotate-12 opacity-50 blur-sm"></div>
                                            <div className="relative w-full h-full bg-slate-800 border border-white/20 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500">
                                                <Mail className="w-8 h-8 text-white" />
                                            </div>
                                            <div className="absolute -top-2 -right-2 bg-blue-500 text-white p-1 rounded-full shadow-lg animate-bounce">
                                                <RefreshCcw className="w-3 h-3" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 p-5 space-y-2 text-left">
                                        <div className="inline-flex items-center px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                                            Security Alert
                                        </div>
                                        <h4 className="text-lg font-bold text-white leading-tight">
                                            Lost your access? <br />
                                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">We've got you.</span>
                                        </h4>
                                        <p className="text-slate-400 text-[11px] leading-relaxed">
                                            Follow the email instructions to regain access in minutes.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom: Stats Card */}
                    <div className="relative z-10 w-full mt-6 pb-6">
                        <div className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 backdrop-blur-md">
                            <div className="grid grid-cols-2 gap-4 w-full">
                                <div className="text-center border-r border-white/10">
                                    <p className="text-white font-bold text-base leading-none">2-Min</p>
                                    <p className="text-slate-300 text-[10px] uppercase tracking-wider mt-1.5 opacity-80">Avg. Recovery</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-white font-bold text-base leading-none">24/7</p>
                                    <p className="text-slate-300 text-[10px] uppercase tracking-wider mt-1.5 opacity-80">Support Team</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Right Panel: Reset Form ── */}
                <div className="flex flex-col justify-center items-center p-6 lg:p-12 bg-white overflow-y-auto">
                    <div className="w-full max-w-sm">

                        {/* Mobile Logo */}
                        <div className="flex lg:hidden items-center space-x-2 mb-8">
                            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center overflow-hidden p-1 shadow-sm border border-slate-100">
                                <img src="/FlowPOS Logo-02.png" alt="FlowPOS Logo" className="w-full h-full object-contain" />
                            </div>
                            <span className="text-lg font-bold text-slate-900">Flow POS</span>
                        </div>

                        <ForgotPasswordForm
                            onSubmit={handleSubmit}
                            loading={loading}
                            error={error}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
