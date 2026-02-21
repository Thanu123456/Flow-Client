import React, { useState } from 'react';
import { message, Alert, Modal } from 'antd';
import { ShoppingBag, Zap, Users, TrendingUp, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { RegisterRequest } from '../../types/auth/auth.types';
import SignupForm from '../../components/auth/SignupForm';

const Signup: React.FC = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const [formError, setFormError] = useState<string | null>(null);

    const handleSubmit = async (values: RegisterRequest) => {
        setLoading(true);
        setFormError(null);
        try {
            await register(values);

            Modal.success({
                title: 'Registration Submitted Successfully!',
                content: (
                    <div className="space-y-2 text-slate-600">
                        <p>We've sent a verification email to <strong className="text-slate-900">{values.email}</strong>.</p>
                        <p>Please verify your email address, then wait for admin approval. You will be notified via email once your account is approved.</p>
                    </div>
                ),
                onOk: () => navigate(`/verify-email?email=${encodeURIComponent(values.email)}`),
                okText: 'Check Email Verification',
                centered: true,
                className: 'rounded-2xl overflow-hidden'
            });

        } catch (error: unknown) {
            console.error('Registration Failed:', error);
            const err = error as { response?: { data?: { message?: string } } };
            const errorMsg = err.response?.data?.message || 'Registration failed. Please try again.';
            setFormError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen overflow-x-hidden bg-white">
            {contextHolder}
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">

                {/* ── Left Panel ── */}
                <div className="hidden lg:flex flex-col justify-between p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
                    {/* Animated blobs */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
                        <div className="absolute top-0 right-0 w-72 h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
                        <div className="absolute -bottom-24 left-1/2 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
                    </div>

                    {/* Left Content Section */}
                    <div className="relative z-10 space-y-8">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 overflow-hidden p-1">
                                <img src="/FlowPOS Logo-02.png" alt="FlowPOS Logo" className="w-full h-full object-contain" />
                            </div>
                            <span className="text-xl font-bold text-white tracking-tight">Flow POS</span>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                                    Join the future of retail management.
                                </h2>
                                <p className="text-slate-300 text-lg max-w-md font-light">
                                    Scale your business with enterprise-grade tools designed for modern commerce.
                                </p>
                            </div>

                            <div className="space-y-5">
                                <div className="flex items-start space-x-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                                        <Zap className="w-5 h-5 text-blue-300" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold text-base">Quick Setup</h3>
                                        <p className="text-slate-400 text-sm">Get your store up and running in less than 5 minutes.</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                                        <Users className="w-5 h-5 text-cyan-300" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold text-base">Collaborative tools</h3>
                                        <p className="text-slate-400 text-sm">Unlimited team members with role-based access control.</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                                        <TrendingUp className="w-5 h-5 text-teal-300" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold text-base">Scale Globally</h3>
                                        <p className="text-slate-400 text-sm">Multi-currency and multi-location support built-in.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Radiant Feature Card */}
                            <div className="relative group cursor-default pt-2">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                                <div className="relative bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl flex items-center">
                                    <div className="flex-1 p-6 space-y-3">
                                        <div className="inline-flex items-center px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                                            Enterprise Ready
                                        </div>
                                        <h4 className="text-lg font-bold text-white leading-tight">
                                            One platform, <br />
                                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Infinite possibilities.</span>
                                        </h4>
                                        <p className="text-slate-400 text-xs leading-relaxed max-w-[170px]">
                                            Everything you need to run, grow, and scale your retail empire.
                                        </p>
                                    </div>
                                    <div className="hidden sm:flex flex-1 relative h-full min-h-[140px] bg-gradient-to-br from-blue-500/10 to-transparent items-center justify-center p-4">
                                        <div className="w-full h-full relative">
                                            <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between h-16 space-x-1">
                                                <div className="w-full bg-blue-500/40 rounded-t-sm h-[30%] animate-pulse"></div>
                                                <div className="w-full bg-cyan-500/60 rounded-t-sm h-[60%]"></div>
                                                <div className="w-full bg-blue-500/40 rounded-t-sm h-[45%]"></div>
                                                <div className="w-full bg-cyan-500/80 rounded-t-sm h-[90%]"></div>
                                                <div className="w-full bg-blue-500/50 rounded-t-sm h-[70%]"></div>
                                            </div>
                                            <div className="absolute top-2 right-2 bg-white/10 backdrop-blur-md border border-white/20 px-2 py-1 rounded text-[8px] text-white animate-bounce">
                                                +24% Sales
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── Branding Spotlight Card ── */}
                            <div className="relative group cursor-default">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-sky-500 rounded-2xl blur opacity-20 group-hover:opacity-35 transition duration-1000"></div>
                                <div className="relative bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl flex items-center">
                                    <div className="hidden sm:flex flex-1 relative h-full min-h-[140px] bg-gradient-to-br from-blue-600/10 to-transparent items-center justify-center p-6 border-r border-white/5">
                                        <div className="relative w-16 h-16">
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-sky-600 rounded-3xl rotate-12 opacity-50 blur-sm"></div>
                                            <div className="relative w-full h-full bg-slate-800 border border-white/20 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500">
                                                <ShoppingBag className="w-10 h-10 text-blue-500" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 p-6 space-y-2">
                                        <div className="inline-flex items-center px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                                            The Flow Identity
                                        </div>
                                        <h4 className="text-lg font-bold text-white leading-tight">
                                            Built for <br />
                                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300">Fluid Commerce.</span>
                                        </h4>
                                        <p className="text-slate-400 text-[11px] leading-relaxed">
                                            A legacy of innovation, power, and high-performance simplicity.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Banner */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                            <div className="grid grid-cols-3 gap-4 mb-3">
                                <div>
                                    <p className="text-white font-bold text-lg">14 Days</p>
                                    <p className="text-slate-400 text-xs">Free Trial</p>
                                </div>
                                <div>
                                    <p className="text-white font-bold text-lg">No Card</p>
                                    <p className="text-slate-400 text-xs">Required</p>
                                </div>
                                <div>
                                    <p className="text-white font-bold text-lg">24/7</p>
                                    <p className="text-slate-400 text-xs">Support</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-300 italic">
                                <span>* Trusted by over 50,000 retailers worldwide</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Right Panel ── */}
                <div className="flex flex-col justify-center items-center p-6 lg:p-12 bg-white overflow-y-auto">
                    <div className="w-full max-w-2xl">
                        <div className="mb-8">
                            <Link to="/login" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors mb-6 group">
                                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                                Back to login
                            </Link>

                            <div className="flex lg:hidden items-center space-x-2 mb-6">
                                <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center overflow-hidden p-1 shadow-sm">
                                    <img src="/FlowPOS Logo-02.png" alt="FlowPOS Logo" className="w-full h-full object-contain" />
                                </div>
                                <span className="text-lg font-bold text-slate-900">Flow POS</span>
                            </div>

                            <h1 className="text-3xl font-bold text-slate-900 mb-2">
                                Create your account
                            </h1>
                            <p className="text-slate-500">
                                Start your 14-day free trial, no credit card required.
                            </p>
                        </div>

                        {formError && (
                            <Alert
                                message="Registration Failed"
                                description={formError}
                                type="error"
                                showIcon
                                closable
                                onClose={() => setFormError(null)}
                                className="mb-6 rounded-xl border-red-200"
                            />
                        )}

                        <SignupForm
                            onSubmit={handleSubmit}
                            loading={loading}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Signup;
