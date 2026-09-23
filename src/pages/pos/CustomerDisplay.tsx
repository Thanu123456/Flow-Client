import React, { useEffect, useState } from 'react';
import { Typography, Avatar } from 'antd';
import { ShopOutlined, CheckCircleFilled, ShoppingOutlined } from '@ant-design/icons';
import { useTenant } from '../../contexts/TenantContext';
import ReceiptQRCode from '../../components/pos/ReceiptQRCode';
import {
    subscribeCustomerDisplay,
    type CustomerDisplayCartMessage,
    type CustomerDisplayPaymentMessage,
} from '../../utils/customerDisplay/customerDisplayChannel';

const { Text } = Typography;

type ViewState =
    | { mode: 'idle' }
    | { mode: 'cart'; data: CustomerDisplayCartMessage }
    | { mode: 'paid'; data: CustomerDisplayPaymentMessage };

// Meant to run in a second browser window dragged onto the customer-facing
// monitor of a dual-screen till — opened from the POS page's "Customer
// Display" button. Purely reactive: everything it shows comes from
// BroadcastChannel messages the cashier's POS tab posts (see
// customerDisplayChannel.ts and POS.tsx's cart-sync effect); this page makes
// no API calls of its own.
const CustomerDisplay: React.FC = () => {
    const { tenant } = useTenant();
    const [view, setView] = useState<ViewState>({ mode: 'idle' });
    const [clock, setClock] = useState(new Date());

    useEffect(() => {
        return subscribeCustomerDisplay((msg) => {
            setView((prev) => {
                if (msg.type === 'payment_complete') return { mode: 'paid', data: msg };
                if (msg.type === 'cart') {
                    if (msg.items.length === 0) {
                        // The POS clears its cart the instant a sale completes, which
                        // broadcasts an *empty* cart right behind the payment message.
                        // That must not replace the thank-you / receipt-QR screen the
                        // customer is about to scan — keep it until the timer below
                        // (or the next customer's first item) moves things on.
                        return prev.mode === 'paid' ? prev : { mode: 'idle' };
                    }
                    return { mode: 'cart', data: msg };
                }
                return { mode: 'idle' };
            });
        });
    }, []);

    // Auto-return to idle after the thank-you screen, long enough for the
    // customer to scan the QR code on their phone.
    useEffect(() => {
        if (view.mode !== 'paid') return;
        const t = setTimeout(() => setView({ mode: 'idle' }), 30000);
        return () => clearTimeout(t);
    }, [view]);

    useEffect(() => {
        const t = setInterval(() => setClock(new Date()), 1000 * 30);
        return () => clearInterval(t);
    }, []);

    const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const shopName = (view.mode === 'cart' && view.data.shopName) || tenant?.shop_name || 'Welcome';
    const logoUrl = (view.mode === 'cart' && view.data.logoUrl) || tenant?.logo_url;
    const itemCount = view.mode === 'cart' ? view.data.items.reduce((s, i) => s + i.quantity, 0) : 0;

    return (
        <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-[#0a0f1e] text-white">
            <style>{`
                @keyframes cd-blob { 0%, 100% { transform: translate(0,0) scale(1); } 33% { transform: translate(4%, -6%) scale(1.08); } 66% { transform: translate(-3%, 4%) scale(0.95); } }
                @keyframes cd-fade-up { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes cd-pop { 0% { opacity: 0; transform: scale(0.6); } 60% { opacity: 1; transform: scale(1.08); } 100% { opacity: 1; transform: scale(1); } }
                @keyframes cd-ring { 0% { opacity: 0.5; transform: scale(0.9); } 100% { opacity: 0; transform: scale(1.6); } }
                @keyframes cd-shrink { from { width: 100%; } to { width: 0%; } }
                .cd-blob { animation: cd-blob 14s ease-in-out infinite; }
                .cd-fade-up { animation: cd-fade-up 0.45s ease-out both; }
                .cd-pop { animation: cd-pop 0.55s cubic-bezier(0.34,1.56,0.64,1) both; }
                .cd-ring { animation: cd-ring 1.8s ease-out infinite; }
                .cd-timer { animation: cd-shrink 30s linear forwards; }
            `}</style>

            {/* Ambient background — soft moving gradient blobs, never distracting */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="cd-blob absolute -left-32 -top-32 h-[32rem] w-[32rem] rounded-full bg-blue-600/25 blur-3xl" />
                <div className="cd-blob absolute -bottom-40 -right-20 h-[36rem] w-[36rem] rounded-full bg-indigo-500/20 blur-3xl" style={{ animationDelay: '-6s' }} />
                <div className="cd-blob absolute left-1/3 top-1/2 h-[24rem] w-[24rem] rounded-full bg-cyan-400/10 blur-3xl" style={{ animationDelay: '-3s' }} />
            </div>

            {/* Persistent branding bar */}
            <div className="relative z-10 flex items-center justify-between px-8 py-5 sm:px-10">
                <div className="flex items-center gap-3">
                    <Avatar src={logoUrl} icon={<ShopOutlined />} size={40} className="!bg-blue-600 shadow-lg" />
                    <span className="text-base font-semibold tracking-tight text-white/90 sm:text-lg">{shopName}</span>
                </div>
                <div className="text-right leading-tight">
                    <div className="text-sm font-medium tabular-nums text-white/70 sm:text-base">
                        {clock.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-[11px] text-white/40 sm:text-xs">
                        {clock.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="relative z-10 flex flex-1 items-center justify-center overflow-hidden px-6 pb-8 sm:px-12">
                {view.mode === 'idle' && (
                    <div key="idle" className="cd-fade-up flex flex-col items-center text-center">
                        <Avatar
                            src={logoUrl}
                            icon={<ShopOutlined />}
                            size={112}
                            className="!bg-gradient-to-br !from-blue-500 !to-indigo-600 shadow-[0_0_60px_-10px_rgba(59,130,246,0.6)]"
                        />
                        <h1 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">{shopName}</h1>
                        <p className="mt-3 text-sm font-medium text-white/50 sm:text-base">
                            Your order will appear here as it's rung up
                        </p>
                    </div>
                )}

                {view.mode === 'cart' && (
                    <div key="cart" className="cd-fade-up grid h-full w-full max-w-5xl grid-cols-1 content-start gap-6 py-2 lg:content-stretch lg:grid-cols-[1.3fr_1fr]">
                        {/* Item list */}
                        <div className="flex max-h-[55vh] min-h-0 flex-col rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl lg:max-h-none">
                            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
                                    <ShoppingOutlined />
                                    Your Order
                                </div>
                                <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-300">
                                    {itemCount} item{itemCount === 1 ? '' : 's'}
                                </span>
                            </div>
                            <div className="flex-1 overflow-y-auto px-3 py-2">
                                {view.data.items.length === 0 ? (
                                    <div className="flex h-full items-center justify-center text-sm text-white/40">
                                        Your items will appear here
                                    </div>
                                ) : (
                                    view.data.items.map((item, i) => (
                                        <div
                                            key={i}
                                            className="cd-fade-up flex items-center justify-between gap-3 rounded-2xl px-3 py-3.5 odd:bg-white/[0.03]"
                                            style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <span className="flex h-7 min-w-7 items-center justify-center rounded-lg bg-white/10 px-1.5 text-xs font-bold text-white/60">
                                                    {item.quantity}×
                                                </span>
                                                <span className="truncate text-[15px] font-medium text-white/90">{item.name}</span>
                                            </div>
                                            <span className="shrink-0 text-[15px] font-semibold tabular-nums text-white/90">
                                                Rs. {fmt(item.price * item.quantity)}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Order summary */}
                        <div className="flex flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm text-white/60">
                                    <span>Subtotal</span>
                                    <span className="tabular-nums">Rs. {fmt(view.data.subtotal)}</span>
                                </div>
                                {view.data.discount > 0 && (
                                    <div className="flex justify-between text-sm text-emerald-400">
                                        <span>Discount</span>
                                        <span className="tabular-nums">-Rs. {fmt(view.data.discount)}</span>
                                    </div>
                                )}
                                {view.data.deliveryCharge > 0 && (
                                    <div className="flex justify-between text-sm text-white/60">
                                        <span>Delivery</span>
                                        <span className="tabular-nums">+Rs. {fmt(view.data.deliveryCharge)}</span>
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="my-5 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                                <div className="flex items-end justify-between">
                                    <span className="text-sm font-semibold uppercase tracking-wide text-white/50">Total</span>
                                    <span className="text-4xl font-bold tabular-nums text-white sm:text-5xl">
                                        Rs. {fmt(view.data.total)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {view.mode === 'paid' && (
                    <div key="paid" className="cd-pop flex flex-col items-center text-center">
                        <div className="relative flex h-24 w-24 items-center justify-center">
                            <span className="cd-ring absolute inset-0 rounded-full border-2 border-emerald-400" />
                            <CheckCircleFilled className="relative text-6xl text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.5)]" />
                        </div>
                        <h1 className="mt-6 text-3xl font-bold text-white sm:text-4xl">Thank You!</h1>
                        {view.data.invoiceNumber && (
                            <Text className="!mt-1 !text-white/40" style={{ fontSize: 13 }}>
                                Invoice #{view.data.invoiceNumber}
                            </Text>
                        )}

                        <div className="mt-6 flex items-baseline gap-2">
                            <span className="text-sm font-medium text-white/50">Total paid</span>
                            <span className="text-3xl font-bold tabular-nums text-white">Rs. {fmt(view.data.totalAmount)}</span>
                        </div>
                        {view.data.changeDue > 0 && (
                            <div className="mt-1 text-sm font-medium tabular-nums text-white/50">
                                Change due: <span className="text-white/80">Rs. {fmt(view.data.changeDue)}</span>
                            </div>
                        )}

                        {view.data.tenantId && view.data.saleId && (
                            <div className="mt-7 rounded-2xl bg-white p-4 shadow-[0_0_40px_-8px_rgba(255,255,255,0.35)]">
                                <ReceiptQRCode tenantId={view.data.tenantId} saleId={view.data.saleId} size={140} />
                            </div>
                        )}
                        <p className="mt-3 text-xs font-medium text-white/40">Scan for your digital receipt</p>

                        <div className="mt-8 h-1 w-40 overflow-hidden rounded-full bg-white/10">
                            <div key={view.data.saleId} className="cd-timer h-full rounded-full bg-emerald-400/70" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerDisplay;
