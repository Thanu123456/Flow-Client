import React, { useState, useEffect } from 'react';
import { Button, Input, Select, Modal, Radio, Checkbox, Typography, Row, Col, Spin, Empty, message, AutoComplete, Avatar, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { SearchOutlined, UserOutlined, SettingOutlined, DeleteOutlined, CloseOutlined, PlusOutlined, MinusOutlined, ShoppingOutlined, DashboardOutlined, KeyOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useProductStore } from '../../store/inventory/productStore';
import { useCategoryStore } from '../../store/management/categoryStore';
import { usePOSStore } from '../../store/transactions/posStore';
import { useCustomerStore } from '../../store/management/customerStore';
import type { Product, ProductVariation } from '../../types/entities/product.types';
import AddCustomerModal from '../../components/customers/AddCustomerModal';

const { Text } = Typography;
const { Option } = Select;

const POS: React.FC = () => {
    const navigate = useNavigate();

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isAddCustomerModalVisible, setIsAddCustomerModalVisible] = useState(false);
    const [currentTime, setCurrentTime] = useState(dayjs());
    const [paidAmount, setPaidAmount] = useState<number>(0);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');

    const user = {
        name: "John Doe",
        email: "john@example.com",
        avatar: null,
        role: "Admin",
    };

    const userMenuItems: MenuProps["items"] = [
        {
            key: "profile-info",
            label: (
                <div className="px-3 py-2">
                    <div className="font-semibold text-gray-800">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                    <div className="text-xs text-gray-400 mt-1">{user.role}</div>
                </div>
            ),
            disabled: true,
        },
        { type: "divider" },
        { key: "dashboard", icon: <DashboardOutlined />, label: "Dashboard", onClick: () => navigate('/dashboard') },
        { key: "profile", icon: <UserOutlined />, label: "My Profile" },
        { key: "settings", icon: <SettingOutlined />, label: "Settings" },
        { key: "change-password", icon: <KeyOutlined />, label: "Change Password" },
        { type: "divider" },
        { key: "logout", icon: <LogoutOutlined />, label: "Logout", danger: true },
    ];

    // Stores
    const { products, loading: productsLoading, getProducts } = useProductStore();
    const { allCategories, allCategoriesLoading: categoriesLoading, getAllCategories } = useCategoryStore();
    const { cart, loading: posLoading, paymentMethod, isRefundMode, addToCart, updateQuantity, removeItem, clearCart, setCustomer, setPaymentMethod, setRefundMode, checkout } = usePOSStore();
    const { searchCustomers } = useCustomerStore();

    const [customerOptions, setCustomerOptions] = useState<{ value: string, label: string }[]>([]);
    const [customerNameDisplay, setCustomerNameDisplay] = useState('Walk-In Customer');

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(dayjs()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        getAllCategories();
    }, [getAllCategories]);

    useEffect(() => {
        getProducts({
            page: 1,
            limit: 1000, // Fetch larger limit for local POS caching
            categoryId: selectedCategory === 'All Categories' ? undefined : selectedCategory,
            status: 'active'
        });
    }, [selectedCategory, getProducts]);

    interface POSItem {
        cardId: string;
        product: Product;
        variation?: ProductVariation;
        displayName: string;
        variationLabel?: string;
        typeName: string;
        price: number;
        stock: number;
        imageUrl?: string;
        sku?: string;
        barcode?: string;
    }

    const posItems = React.useMemo((): POSItem[] => {
        const expanded: POSItem[] = [];

        for (const product of products) {
            const isVariable = product.productType?.toLowerCase() === 'variable';
            const hasVariations = Array.isArray(product.variations) && product.variations.length > 0;

            if (isVariable && hasVariations) {
                // One card per variation
                for (const v of (product.variations || [])) {
                    const label = v.options && v.options.length > 0
                        ? v.options.map((o: any) => o.value).join(' / ')
                        : v.variationName;
                    expanded.push({
                        cardId: v.id,
                        product,
                        variation: v,
                        displayName: product.name,
                        variationLabel: label,
                        typeName: 'Variation',
                        price: v.retailPrice ?? v.costPrice ?? 0,
                        stock: v.currentStock,
                        imageUrl: v.imageUrl || product.imageUrl,
                        sku: v.sku,
                        barcode: v.barcode,
                    });
                }
            } else {
                // Single product
                expanded.push({
                    cardId: product.id,
                    product,
                    variation: undefined,
                    displayName: product.name,
                    variationLabel: undefined,
                    typeName: 'Single',
                    price: product.retailPrice ?? product.costPrice ?? 0,
                    stock: product.currentStock,
                    imageUrl: product.imageUrl,
                    sku: product.sku,
                    barcode: product.barcode,
                });
            }
        }

        if (!searchTerm.trim()) return expanded;
        const q = searchTerm.toLowerCase();
        return expanded.filter(item =>
            item.displayName.toLowerCase().includes(q) ||
            (item.variationLabel && item.variationLabel.toLowerCase().includes(q)) ||
            (item.sku && item.sku.toLowerCase().includes(q)) ||
            (item.barcode && item.barcode.toLowerCase().includes(q))
        );
    }, [products, searchTerm]);

    const handleAddToCart = (item: POSItem) => {
        addToCart({
            id: item.cardId,
            productId: item.product.id,
            variationId: item.variation?.id,
            name: item.variationLabel
                ? `${item.displayName} - ${item.variationLabel}`
                : item.displayName,
            unit: item.product.unitShortName || item.product.unitName || 'Units',
            quantity: 1,
            price: item.price,
            maxStock: item.stock
        });
    };

    const subTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isPaymentModalOpen) {
                setIsPaymentModalOpen(false);
            }
            if (e.key === 'Delete' && !isPaymentModalOpen) {
                clearCart();
            }
            if (e.key === 'Enter' && isPaymentModalOpen) {
                handleCheckout();
            }
            if (e.key === 'F1') {
                e.preventDefault();
                setIsAddCustomerModalVisible(true);
            }
            if (e.key === 'F2') {
                e.preventDefault();
                setPaymentMethod('Credit');
                message.success("Payment method set to Credit");
            }
            if (e.key === 'F3') {
                e.preventDefault();
                message.info("Price Mode functionality coming soon");
            }
            if (e.key === 'F4') {
                e.preventDefault();
                setPaymentMethod('HOLD');
                message.success("Payment method set to HOLD");
            }
            if (e.key === 'F12') {
                e.preventDefault();
                message.info("Help Documentation coming soon.");
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPaymentModalOpen, cart]);

    const handleCheckout = async () => {
        try {
            await checkout(paidAmount);
            message.success("Payment completed successfully!");
            setIsPaymentModalOpen(false);
            setPaidAmount(0);

            // Refresh products to show updated stock
            getProducts({
                page: 1,
                limit: 1000,
                categoryId: selectedCategory === 'All Categories' ? undefined : selectedCategory,
                status: 'active'
            });
        } catch (e) {
            message.error("Failed to complete checkout.");
        }
    };

    const handleCustomerSearch = async (value: string) => {
        if (value.length > 2) {
            const results = await searchCustomers(value);
            setCustomerOptions(results.map(c => ({
                value: c.id,
                label: `${c.fullName} - ${c.phone}`
            })));
        } else {
            setCustomerOptions([]);
        }
    };

    const handleCustomerSelect = (value: string, option: any) => {
        setCustomer(value);
        setCustomerNameDisplay(option.label);
    };

    return (
        <div className="h-screen flex flex-col bg-[#f0f2f5] overflow-hidden font-sans">
            {/* Header bar */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200 shadow-sm gap-4 z-20">
                {/* Left header */}
                <div className="flex items-center gap-6">
                    <div className="text-sm font-medium w-36 border-r border-gray-200 pr-4">
                        <div className="text-gray-800 tracking-wide text-lg">{currentTime.format('hh:mm:ss A')}</div>
                        <div className="text-blue-600 text-xs mt-0.5 font-semibold">{currentTime.format('ddd, MMM DD, YYYY')}</div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-1.5 rounded-lg border border-gray-100 shadow-sm flex items-center justify-center w-12 h-12">
                            <img src="/FlowPOS Logo-02.png" alt="Flow POS" className="w-full h-full object-contain" />
                        </div>
                        <div className="flex flex-col">
                            <Text className="text-[11px] font-medium text-gray-500 uppercase tracking-widest mb-0.5">Welcome To</Text>
                            <Text className="text-sm font-semibold text-gray-800">E scope International (Pvt) Ltd</Text>
                        </div>
                    </div>
                </div>

                {/* Global actions */}
                <div className="flex items-center gap-2.5">
                    <Button onClick={() => { setPaymentMethod('COD'); message.success("Payment method set to COD"); }} size="middle" style={{ backgroundColor: '#5c8aff', color: 'white', border: 'none' }} className="hover:opacity-90 text-xs rounded-lg shadow-sm font-semibold">COD</Button>
                    <Button onClick={() => { setPaymentMethod('HOLD'); message.success("Payment method set to HOLD"); }} size="middle" style={{ backgroundColor: '#ffaf40', color: 'white', border: 'none' }} className="hover:opacity-90 text-xs rounded-lg shadow-sm font-semibold">HOLD</Button>
                    <Button onClick={() => { setRefundMode(!isRefundMode); message.success(isRefundMode ? "Refund Mode Disabled" : "Refund Mode Enabled"); }} size="middle" style={{ backgroundColor: isRefundMode ? '#2f3542' : '#fa5f55', color: 'white', border: 'none' }} className="hover:opacity-90 text-xs rounded-lg shadow-sm font-semibold">{isRefundMode ? 'CANCEL REFUND' : 'REFUND'}</Button>

                    <Dropdown
                        menu={{ items: userMenuItems }}
                        trigger={["click"]}
                        placement="bottomRight"
                    >
                        <div className="cursor-pointer ml-2">
                            <Avatar
                                size={40}
                                src={user.avatar}
                                icon={!user.avatar && <UserOutlined />}
                                className="bg-indigo-500 hover:bg-indigo-600 transition-all shadow-sm"
                            />
                        </div>
                    </Dropdown>

                    <Button type="text" onClick={() => navigate('/dashboard')} className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 font-semibold ml-2 rounded-lg px-4 transition-colors">Exit POS</Button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden h-full">
                {/* Left Pane - Products */}
                <div className="w-1/2 flex flex-col bg-slate-50 border-r border-gray-200 shadow-sm z-10">
                    <div className="flex gap-3 p-3 bg-white border-b border-gray-200 flex-shrink-0">
                        <Input
                            size="large"
                            prefix={<SearchOutlined className="text-gray-400" />}
                            placeholder="Search products by name or SKU..."
                            className="flex-1 rounded-lg border-gray-300 hover:border-indigo-400 focus:border-indigo-500 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Select
                            size="large"
                            value={selectedCategory}
                            onChange={setSelectedCategory}
                            className="w-1/3 rounded-lg shadow-sm"
                            loading={categoriesLoading}
                        >
                            <Option value="All Categories">All Categories</Option>
                            {allCategories.map((cat: any) => (
                                <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                            ))}
                        </Select>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {productsLoading ? (
                            <div className="flex items-center justify-center h-full"><Spin size="large" /></div>
                        ) : posItems.length === 0 ? (
                            <div className="flex items-center justify-center h-full"><Empty description="No products found" /></div>
                        ) : (
                            <Row gutter={[16, 16]}>
                                {posItems.map((item) => (
                                    <Col span={6} key={item.cardId}>
                                        <div
                                            className="bg-white rounded-2xl border border-gray-200/60 overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 hover:border-indigo-400 transition-all duration-300 flex flex-col h-full group relative"
                                            onClick={() => handleAddToCart(item)}
                                        >
                                            <div className="h-52 bg-slate-50 flex items-center justify-center relative p-4 overflow-hidden">
                                                <div className={`absolute top-3 right-3 z-10 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border shadow-sm whitespace-nowrap ${
                                                    item.stock > 0
                                                        ? 'bg-emerald-500 text-white border-emerald-400'
                                                        : 'bg-rose-500 text-white border-rose-400'
                                                }`}>
                                                    {item.stock > 0 ? `${item.stock} IN STOCK` : 'OUT OF STOCK'}
                                                </div>

                                                {item.imageUrl ? (
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={item.displayName}
                                                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 p-2"
                                                    />
                                                ) : (
                                                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-50 to-slate-100 rounded-3xl shadow-inner flex items-center justify-center border border-white group-hover:scale-110 transition-transform duration-500">
                                                        <span className="text-4xl text-indigo-400 font-black italic select-none">
                                                            {item.displayName.charAt(0)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-4 flex-1 flex flex-col bg-white">
                                                <div className="mb-2">
                                                    <div className="text-sm font-bold text-slate-800 leading-snug line-clamp-2 min-h-[40px] group-hover:text-indigo-600 transition-colors">
                                                        {item.displayName}
                                                    </div>
                                                </div>

                                                <div className="mb-4">
                                                    <div className={`inline-flex flex-col py-1 px-2.5 rounded-lg border ${
                                                        item.variation 
                                                            ? 'bg-indigo-50 border-indigo-100 text-indigo-100 text-indigo-600' 
                                                            : 'bg-slate-50 border-slate-100 text-slate-500'
                                                    }`}>
                                                        <span className="text-[7px] font-black uppercase tracking-widest leading-none mb-1 opacity-60">
                                                            {item.variation ? 'Variation' : 'Type'}
                                                        </span>
                                                        <span className="text-[10px] font-bold truncate uppercase tracking-tight">
                                                            {item.variation ? item.variationLabel : item.typeName}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mt-auto pt-3 border-t border-slate-100 flex items-end justify-between">
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Price</span>
                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-[10px] font-bold text-indigo-400 uppercase">LKR</span>
                                                            <span className="text-xl font-black text-indigo-600 tracking-tighter">
                                                                {item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        )}
                    </div>
                </div>

                {/* Right Pane - Cart & Checkout */}
                <div className="w-1/2 flex flex-col bg-white">
                    <div className="p-3 border-b border-gray-200 flex gap-2 shrink-0">
                        <Button onClick={() => setIsAddCustomerModalVisible(true)} style={{ backgroundColor: '#54a0ff', color: 'white', border: 'none', height: '40px' }} className="flex-1 hover:opacity-90 font-semibold text-[11px] rounded-lg shadow-sm transition-opacity">CREATE CUSTOMER (F1)</Button>
                        <Button onClick={() => { setPaymentMethod('Credit'); message.success("Payment method set to Credit"); }} style={{ backgroundColor: '#ff6b6b', color: 'white', border: 'none', height: '40px' }} className="flex-1 hover:opacity-90 font-semibold text-[11px] rounded-lg shadow-sm transition-opacity">CREDIT (F2)</Button>
                        <Button onClick={() => message.info("Price Mode functionality coming soon")} style={{ backgroundColor: '#34495e', color: 'white', border: 'none', height: '40px' }} className="flex justify-center items-center hover:opacity-90 font-semibold text-[10px] px-3 rounded-lg shadow-sm transition-opacity">
                            PRICE MODE (F3)
                        </Button>
                        <Button onClick={() => message.info("Help Documentation coming soon.")} style={{ backgroundColor: '#95a5a6', color: 'white', border: 'none', height: '40px' }} className="hover:opacity-90 font-semibold text-[11px] px-4 rounded-lg shadow-sm transition-opacity">HELP (F12)</Button>
                        <Button onClick={() => navigate('/settings')} style={{ backgroundColor: '#bdc3c7', color: 'white', border: 'none', height: '40px', width: '40px' }} className="flex justify-center items-center hover:opacity-90 rounded-lg shadow-sm transition-opacity" icon={<SettingOutlined />} />
                    </div>

                    <div className="bg-[#2ea2f8] text-white text-xs font-bold uppercase tracking-wider flex py-2.5 px-4 z-10 shadow-sm shrink-0">
                        <div className="flex-[3] min-w-0 pl-1">Name</div>
                        <div className="flex-1 min-w-0 text-center">Unit</div>
                        <div className="w-32 shrink-0 px-2 text-center">Qty</div>
                        <div className="flex-1 min-w-0 text-right">Price</div>
                        <div className="flex-1 min-w-0 text-right pr-2">Total</div>
                        <div className="w-8 shrink-0"></div>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-white p-2 custom-scrollbar">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
                                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center border border-dashed border-gray-300">
                                    <ShoppingOutlined className="text-2xl" />
                                </div>
                                <span className="text-sm font-medium">Cart is empty</span>
                            </div>
                        ) : (
                            cart.map((item, index) => (
                                <div key={item.id} className={`flex items-center py-3 px-3 text-[15px] rounded-lg mb-1 hover:bg-indigo-50/50 transition-colors border border-transparent hover:border-indigo-50 ${index % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'}`}>
                                    <div className="flex-[3] min-w-0 pr-3 truncate text-gray-800 font-medium">{item.name}</div>
                                    <div className="flex-1 min-w-0 text-center text-gray-500 text-sm">{item.unit}</div>
                                    <div className="w-32 shrink-0 px-2 flex justify-center items-center gap-3">
                                        <div
                                            className="w-7 h-7 rounded-full flex items-center justify-center bg-rose-50 hover:bg-rose-100 text-rose-500 cursor-pointer transition-colors"
                                            onClick={() => updateQuantity(item.id, -1)}
                                        >
                                            <MinusOutlined className="text-[12px] font-bold" />
                                        </div>
                                        <span className="w-8 text-center font-bold text-gray-800 text-base select-none">{item.quantity}</span>
                                        <div
                                            className="w-7 h-7 rounded-full flex items-center justify-center bg-emerald-50 hover:bg-emerald-100 text-emerald-600 cursor-pointer transition-colors"
                                            onClick={() => updateQuantity(item.id, 1)}
                                        >
                                            <PlusOutlined className="text-[12px] font-bold" />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0 text-right text-gray-600 font-medium tabular-nums">{item.price.toFixed(2)}</div>
                                    <div className="flex-1 min-w-0 text-right font-bold text-gray-900 text-base tabular-nums pr-2">{(item.price * item.quantity).toFixed(2)}</div>
                                    <div className="w-8 shrink-0 flex justify-center">
                                        <div
                                            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-rose-100 text-gray-400 hover:text-rose-600 cursor-pointer transition-colors"
                                            onClick={() => removeItem(item.id)}
                                        >
                                            <DeleteOutlined className="text-base" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="border-t border-gray-200 p-4 bg-gray-50 shrink-0">
                        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="text-slate-500 font-medium text-[11px] tracking-wider uppercase">Items</div>
                                    <div className="bg-indigo-50 text-indigo-700 font-bold px-2.5 py-0.5 rounded-md text-sm border border-indigo-100 min-w-[28px] text-center">
                                        {cart.length}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-slate-500 font-medium text-[11px] tracking-wider uppercase">Qty</div>
                                    <div className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded-md text-sm border border-emerald-100 min-w-[28px] text-center">
                                        {cart.length === 0 ? 0 : cart.reduce((s, i) => s + i.quantity, 0)}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-slate-500 font-medium text-xs tracking-wider uppercase">Sub Total</div>
                                <div className="text-2xl font-black text-slate-800 tabular-nums tracking-tight">
                                    {cart.length === 0 ? '0.00' : subTotal.toFixed(2)}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 h-[120px]">
                            <div className="flex flex-col gap-3 w-1/2 h-full">
                                <Button onClick={() => { setPaymentMethod('HOLD'); message.success("Cart On Hold"); }} style={{ backgroundColor: '#ffaf40', color: 'white', border: 'none', height: '100%' }} className="hover:opacity-90 font-bold flex-1 w-full rounded-xl shadow-sm transition-opacity text-base tracking-wide">HOLD (F4)</Button>
                                <Button style={{ backgroundColor: '#ff5252', color: 'white', border: 'none', height: '100%' }} className="hover:opacity-90 font-bold flex-1 w-full rounded-xl shadow-sm transition-opacity text-base tracking-wide" onClick={clearCart}>RESET (DEL)</Button>
                            </div>
                            <Button
                                onClick={() => { if (cart.length > 0) { setIsPaymentModalOpen(true); setPaidAmount(subTotal); } }}
                                style={{ height: '100%', fontSize: '32px', ...(cart.length > 0 ? { backgroundColor: '#32ff7e', color: '#006266', border: 'none' } : { border: 'none' }) }}
                                className={`w-1/2 font-black border-none shadow-md rounded-xl tracking-wide transition-all flex items-center justify-center ${cart.length > 0 ? 'hover:opacity-90 transform hover:-translate-y-0.5' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {isRefundMode ? 'REFUND NOW' : 'PAY NOW'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            <Modal
                open={isPaymentModalOpen}
                onCancel={() => setIsPaymentModalOpen(false)}
                footer={null}
                closable={false}
                width={480}
                styles={{ body: { padding: 0 } }}
                maskStyle={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                centered
            >
                <div className="bg-white rounded-xl shadow-xl overflow-hidden font-sans border border-gray-200 relative">
                    {posLoading && (
                        <div className="absolute inset-0 bg-white/50 z-20 flex items-center justify-center">
                            <Spin size="large" />
                        </div>
                    )}
                    <div className="flex justify-between items-center bg-gray-100 p-2 border-b">
                        <div className="font-bold text-gray-700 text-sm px-2">{isRefundMode ? 'PROCESS REFUND' : 'PROCESS PAYMENT'}</div>
                        <Button type="text" size="small" icon={<CloseOutlined />} onClick={() => setIsPaymentModalOpen(false)} className="text-red-500 hover:text-white hover:bg-red-500 rounded font-bold bg-white border border-gray-300 shadow-sm" />
                    </div>

                    <div className="p-4 px-5">
                        <div className="flex justify-between text-xs text-gray-600 mb-4 border-b pb-2">
                            <div>Items: <span className="font-semibold text-black">{cart.reduce((s, i) => s + i.quantity, 0)}</span></div>
                            <div>Subtotal: <span className="font-bold text-black">{subTotal.toFixed(2)}</span></div>
                            <div>Weight: <span className="text-blue-600 font-semibold">0.000 Kg</span></div>
                            <div><Checkbox defaultChecked className="text-xs text-blue-600 font-semibold">Print Bill (F12)</Checkbox></div>
                        </div>

                        <div className="mb-3">
                            <div className="text-[10px] text-gray-500 uppercase font-semibold mb-1">CUSTOMER [F5]</div>
                            <AutoComplete
                                onSearch={handleCustomerSearch}
                                options={customerOptions}
                                onSelect={handleCustomerSelect}
                                style={{ width: '100%' }}
                            >
                                <Input placeholder="Search or type customer name / phone.." className="rounded text-sm py-1.5 border-gray-300 w-full" />
                            </AutoComplete>
                            <div className="text-blue-600 font-semibold text-xs mt-1">{customerNameDisplay}</div>
                        </div>


                        <div className="mb-3">
                            <div className="text-[10px] text-gray-500 uppercase font-semibold mb-1">TRACKING NO (Optional) [F10]</div>
                            <Input placeholder="Enter tracking number... (F10)" className="rounded text-sm py-1.5 border-gray-300" />
                        </div>

                        <div className="mb-4">
                            <div className="text-[10px] text-gray-500 uppercase font-semibold mb-1">TOTAL PAYABLE</div>
                            <div className="text-3xl font-extrabold text-[#0000a0] tabular-nums tracking-tight">
                                {subTotal.toFixed(2)}
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="text-[10px] text-gray-500 uppercase font-semibold mb-2">PAYMENT METHOD <span className="font-normal text-[9px] ml-1">F1=Cash F2=Card F3=Credit F4=COD</span></div>
                            <Radio.Group onChange={e => setPaymentMethod(e.target.value)} value={paymentMethod} className="flex gap-6">
                                <Radio value="Cash" className="font-bold text-sm text-gray-800 rounded">Cash</Radio>
                                <Radio value="Card" className="text-sm text-gray-800">Card</Radio>
                                <Radio value="Credit" className="text-sm text-gray-800">Credit</Radio>
                                <Radio value="COD" className="text-sm text-gray-800">COD</Radio>
                            </Radio.Group>
                        </div>

                        <div className="mb-4">
                            <div className="text-[10px] text-gray-500 uppercase font-semibold mb-1">PAID AMOUNT [F9]</div>
                            <Input
                                value={paidAmount}
                                onChange={(e) => setPaidAmount(Number(e.target.value) || 0)}
                                className="text-right text-lg border-blue-400 font-bold text-blue-800 py-1"
                                type="number"
                                min={0}
                            />
                        </div>

                        <div className="flex justify-between items-center mb-4">
                            <div className="text-gray-500 uppercase text-xs font-semibold">Change:</div>
                            <div className="text-red-500 font-bold text-xl tabular-nums">
                                {Math.max(paidAmount - subTotal, 0).toFixed(2)}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 mt-2">
                            <Button
                                size="large"
                                style={{ backgroundColor: '#009900', color: 'white', border: 'none' }}
                                className="font-bold text-sm h-11 rounded-md"
                                onClick={handleCheckout}
                                loading={posLoading}
                            >
                                COMPLETE PAYMENT [Enter]
                            </Button>
                            <Button
                                size="large"
                                style={{ backgroundColor: '#e0e0e0', color: '#374151', border: 'none' }}
                                className="font-bold text-xs h-9 rounded-md uppercase tracking-wider"
                                onClick={() => setIsPaymentModalOpen(false)}
                                disabled={posLoading}
                            >
                                CANCEL [Esc]
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Add Customer Modal */}
            <AddCustomerModal
                visible={isAddCustomerModalVisible}
                onCancel={() => setIsAddCustomerModalVisible(false)}
                onSuccess={() => setIsAddCustomerModalVisible(false)}
            />
        </div>
    );
};

export default POS;
