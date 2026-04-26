import React, { useState, useEffect, useCallback } from 'react';
import { Button, Input, Select, Modal, Radio, Checkbox, Typography, Spin, Empty, message, AutoComplete, Avatar, Dropdown, Tooltip, InputNumber } from 'antd';
import type { MenuProps } from 'antd';
import { SearchOutlined, UserOutlined, SettingOutlined, DeleteOutlined, CloseOutlined, PlusOutlined, MinusOutlined, ShoppingOutlined, DashboardOutlined, KeyOutlined, LogoutOutlined, BarcodeOutlined } from '@ant-design/icons';
import { FaCcVisa, FaCcMastercard, FaCcDiscover } from 'react-icons/fa';
import { SiAmericanexpress } from 'react-icons/si';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useProductStore } from '../../store/inventory/productStore';
import { useCategoryStore } from '../../store/management/categoryStore';
import { usePOSStore } from '../../store/transactions/posStore';
import { useCustomerStore } from '../../store/management/customerStore';
import type { Product, ProductVariation } from '../../types/entities/product.types';
import AddCustomerModal from '../../components/customers/AddCustomerModal';
import WeightEntryModal from '../../components/pos/WeightEntryModal';
import PriceModeSelector from '../../components/pos/PriceModeSelector';
import HeldBillsModal from '../../components/pos/HeldBillsModal';
import POSRefundModal from '../../components/pos/POSRefundModal';
import { isWeightBasedProduct, formatQuantity } from '../../utils/posHelpers';
import { useBarcodeScanner } from '../../hooks/useBarcodeScanner';
import { axiosInstance } from '../../services/api/axiosInstance';

const { Text } = Typography;
const { Option } = Select;

// ─────────────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────────────
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

type PriceMode = 'retail' | 'wholesale' | 'our';

// ─────────────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────────────
const POS: React.FC = () => {
    const navigate = useNavigate();

    // ── UI state ───────────────────────────────────────────────────────
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isAddCustomerModalVisible, setIsAddCustomerModalVisible] = useState(false);
    const [heldBillsModalVisible, setHeldBillsModalVisible] = useState(false);
    const [currentTime, setCurrentTime] = useState(dayjs());
    const [paidAmount, setPaidAmount] = useState<number>(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');

    // ── Feature #4: Bill Number ────────────────────────────────────────
    const [billNumber, setBillNumber] = useState<string>('');
    const [billNumberLoading, setBillNumberLoading] = useState(false);

    // ── Feature #5: Weight Calculation (cart total weight) ───────────
    const [totalWeight, setTotalWeight] = useState<number>(0);

    // ── Feature #6: Price Mode ─────────────────────────────────────────
    const [isPriceModeVisible, setIsPriceModeVisible] = useState(false);

    // ── Feature #7: Weight Modal ───────────────────────────────────────
    const [weightModalVisible, setWeightModalVisible] = useState(false);
    const [selectedWeightProduct, setSelectedWeightProduct] = useState<POSItem | null>(null);

    // ── Feature #8: No-Stock Setting ──────────────────────────────────
    const [allowNoStockBills, setAllowNoStockBills] = useState<boolean>(false);
    const [settingsLoaded, setSettingsLoaded] = useState(false);

    // ── POS Refund Modal ───────────────────────────────────────────────
    const [refundModalVisible, setRefundModalVisible] = useState(false);

    // ── Customer state ─────────────────────────────────────────────────
    const [customerOptions, setCustomerOptions] = useState<{ value: string; label: string }[]>([]);
    const [customerNameDisplay, setCustomerNameDisplay] = useState('Walk-In Customer');

    // ── Print Bill checkbox ────────────────────────────────────────────
    const [printBill, setPrintBill] = useState(true);
    const [trackingNumber, setTrackingNumber] = useState('');

    // Stores
    const { products, loading: productsLoading, getProducts } = useProductStore();
    const { allCategories, allCategoriesLoading: categoriesLoading, getAllCategories } = useCategoryStore();
    const {
        cart, loading: posLoading, paymentMethod, isRefundMode,
        discountType, discountValue, deliveryCharge,
        cardBank, cardFirstDigit, cardLastFour, cardType, priceMode,
        addToCart, updateQuantity, removeItem, clearCart,
        setCustomer, setPaymentMethod, setRefundMode,
        setDiscount, setDeliveryCharge,
        setCardBank, setCardFirstDigit, setCardLastFour, setCardType, setPriceMode,
        updateCartItemPrices,
        initializePriceMode,
        checkout,
        holdBill, resumeHoldBill,
    } = usePOSStore();
    const { searchCustomers } = useCustomerStore();

    // Static user (will be from auth context in production)
    const user = { name: "John Doe", email: "john@example.com", avatar: null as string | null, role: "Admin" };

    // ─── Clock ───────────────────────────────────────────────────────
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(dayjs()), 1000);
        return () => clearInterval(timer);
    }, []);

    // ─── Load categories & products ──────────────────────────────────
    useEffect(() => { getAllCategories(); }, [getAllCategories]);

    useEffect(() => {
        getProducts({
            page: 1,
            limit: 1000,
            categoryId: selectedCategory === 'All Categories' ? undefined : selectedCategory,
            status: 'active',
        });
    }, [selectedCategory, getProducts]);

    // ─── Feature #8 – Load POS Settings ──────────────────────────────
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const resp = await axiosInstance.get('/admin/pos/settings');
                setAllowNoStockBills(resp.data?.allow_no_stock_bills ?? false);
            } catch {
                // Settings endpoint may not exist yet; default is safe (false = block no-stock)
                setAllowNoStockBills(false);
            } finally {
                setSettingsLoaded(true);
            }
        };
        loadSettings();
    }, []);

    // ─── Feature #6 – Initialize price mode from localStorage ──────────
    useEffect(() => {
        initializePriceMode();
    }, [initializePriceMode]);

    // ─── Feature #4 – Generate Bill Number locally ────────────────────
    //  Format: {MODE_PREFIX}{PAY_CODE}{YYMMDDHHMMSS}{3 random alphanum}
    //  MODE_PREFIX : O=Our/Cost  R=Retail  W=Wholesale
    //  PAY_CODE    : C=Cash  D=Card  R=Credit  O=COD
    const generateBillNumber = useCallback((mode: string, method: string, isRefund: boolean): string => {
        if (isRefund) {
            return `REF-${Math.floor(Date.now() / 1000)}`;
        }

        const modeMap: Record<string, string> = { our: 'O', cost: 'O', retail: 'R', wholesale: 'W' };
        const payMap: Record<string, string> = { Cash: 'C', Card: 'D', Credit: 'R', COD: 'O' };

        const modePrefix = modeMap[mode.toLowerCase()] ?? 'R';
        const payCode = payMap[method] ?? 'C';

        const now = new Date();
        const pad = (n: number, d = 2) => String(n).padStart(d, '0');
        const ts = [
            String(now.getFullYear()).slice(2),
            pad(now.getMonth() + 1),
            pad(now.getDate()),
            pad(now.getHours()),
            pad(now.getMinutes()),
            pad(now.getSeconds()),
        ].join('');

        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const rand = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');

        return `${modePrefix}${payCode}${ts}${rand}`;
    }, []);

    // Regenerate whenever modal opens, payment method changes, or refund mode changes
    useEffect(() => {
        if (isPaymentModalOpen) {
            setBillNumberLoading(true);
            const num = generateBillNumber(priceMode, paymentMethod, isRefundMode);
            setBillNumber(num);
            setBillNumberLoading(false);
        }
    }, [isPaymentModalOpen, paymentMethod, priceMode, isRefundMode, generateBillNumber]);


    // ─── Feature #5 – Calculate total weight ─────────────────────────
    useEffect(() => {
        const weightTotal = cart.reduce((sum, item) => {
            if (isWeightBasedProduct(item.unit)) {
                return sum + item.quantity;
            }
            return sum;
        }, 0);
        setTotalWeight(weightTotal);
    }, [cart]);

    // ─── POS Items (expanded from products) ──────────────────────────
    const posItems = React.useMemo((): POSItem[] => {
        const expanded: POSItem[] = [];

        for (const product of products) {
            const isVariable = product.productType?.toLowerCase() === 'variable';
            const hasVariations = Array.isArray(product.variations) && product.variations.length > 0;

            if (isVariable && hasVariations) {
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
                        price: getPriceByMode(product, v, priceMode),
                        stock: v.currentStock,
                        imageUrl: v.imageUrl || product.imageUrl,
                        sku: v.sku,
                        barcode: v.barcode,
                    });
                }
            } else {
                expanded.push({
                    cardId: product.id,
                    product,
                    variation: undefined,
                    displayName: product.name,
                    variationLabel: undefined,
                    typeName: 'Single',
                    price: getPriceByMode(product, undefined, priceMode),
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
    }, [products, searchTerm, priceMode]);

    // ─── Feature #6 – Get price by mode ──────────────────────────────
    function getPriceByMode(
        product: Product,
        variation: ProductVariation | undefined,
        mode: PriceMode
    ): number {
        const parsePrice = (val: any) => {
            if (val === null || val === undefined || val === '') return 0;
            const num = Number(val);
            return isNaN(num) ? 0 : num;
        };

        if (variation) {
            const vWholesale = parsePrice(variation.wholesalePrice);
            const vOur = parsePrice(variation.ourPrice);
            const vRetail = parsePrice(variation.retailPrice);
            const vCost = parsePrice(variation.costPrice);

            // DEBUG: Log first product to verify prices are loaded
            if (mode === 'wholesale' && !priceMode) {
                console.log('DEBUG Variation:', { name: product.name, vWholesale, vOur, vRetail, vCost, mode });
            }

            switch (mode) {
                case 'wholesale': return vWholesale || vRetail || vCost;
                case 'our': return vOur || vRetail || vCost;
                default: return vRetail || vCost;
            }
        }

        const pWholesale = parsePrice(product.wholesalePrice);
        const pOur = parsePrice(product.ourPrice);
        const pRetail = parsePrice(product.retailPrice);
        const pCost = parsePrice(product.costPrice);

        // DEBUG: Log first product to verify prices are loaded
        if (mode === 'wholesale' && !priceMode) {
            console.log('DEBUG Product:', { name: product.name, pWholesale, pOur, pRetail, pCost, mode });
        }

        switch (mode) {
            case 'wholesale': return pWholesale || pRetail || pCost;
            case 'our': return pOur || pRetail || pCost;
            default: return pRetail || pCost;
        }
    }

    // ─── Feature #7 & #8 & #9 – Add to cart logic ────────────────────
    const handleAddToCart = useCallback((item: POSItem) => {
        // Feature #8: No-stock check
        if (item.stock <= 0 && !allowNoStockBills) {
            message.error(`${item.displayName} is out of stock and cannot be added.`);
            return;
        }
        if (item.stock <= 0 && allowNoStockBills) {
            message.warning(`${item.displayName} is out of stock – adding as negative inventory.`);
        }

        // Feature #7: Weight-based modal
        if (isWeightBasedProduct(item.product.unitName || item.product.unitShortName)) {
            setSelectedWeightProduct(item);
            setWeightModalVisible(true);
            return;
        }

        // Regular add
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
            maxStock: item.stock,
        });
    }, [allowNoStockBills, addToCart]);

    // ─── Feature #7 – Weight modal confirm ───────────────────────────
    const handleWeightConfirm = (quantity: number) => {
        if (!selectedWeightProduct) return;
        addToCart({
            id: selectedWeightProduct.cardId,
            productId: selectedWeightProduct.product.id,
            variationId: selectedWeightProduct.variation?.id,
            name: selectedWeightProduct.variationLabel
                ? `${selectedWeightProduct.displayName} - ${selectedWeightProduct.variationLabel}`
                : selectedWeightProduct.displayName,
            unit: selectedWeightProduct.product.unitShortName || selectedWeightProduct.product.unitName || 'Units',
            quantity,
            price: selectedWeightProduct.price,
            maxStock: selectedWeightProduct.stock,
        });
        message.success(`Added ${formatQuantity(quantity, selectedWeightProduct.product.unitName)} ${selectedWeightProduct.product.unitShortName} to cart`);
        setWeightModalVisible(false);
        setSelectedWeightProduct(null);
    };

    // ─── Feature #9 – Barcode scanner handler ────────────────────────
    const handleBarcodeScanned = useCallback((barcode: string) => {
        const matching = posItems.find(
            i => i.barcode && i.barcode.toLowerCase() === barcode.toLowerCase()
        );
        if (!matching) {
            message.error(`No product found for barcode: ${barcode}`);
            return;
        }
        handleAddToCart(matching);
        if (matching.stock > 0 || allowNoStockBills) {
            if (!isWeightBasedProduct(matching.product.unitName || matching.product.unitShortName)) {
                message.success(`Scanned: ${matching.displayName}`);
            }
        }
    }, [posItems, handleAddToCart, allowNoStockBills]);

    // Initialize barcode scanner (disabled during payment modal)
    const { buffer: barcodeBuffer } = useBarcodeScanner({
        onScan: handleBarcodeScanned,
        debounceMs: 100,
        enabled: !isPaymentModalOpen && !weightModalVisible && !isPriceModeVisible,
    });

    // ─── Totals ───────────────────────────────────────────────────────
    const subTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountAmount = discountType === 'fixed'
        ? Math.min(discountValue, subTotal)
        : (subTotal * Math.min(discountValue, 100)) / 100;
    const totalPayable = subTotal - discountAmount + deliveryCharge;

    // ─── Card type detection ──────────────────────────────────────────
    const detectCardType = (firstDigit: string): string => {
        if (firstDigit === '4') return 'VISA';
        if (firstDigit === '5') return 'MASTERCARD';
        if (firstDigit === '3') return 'AMEX';
        if (firstDigit === '6') return 'DISCOVER';
        return '';
    };

    // ─── Keyboard shortcuts ───────────────────────────────────────────
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isPaymentModalOpen) { setIsPaymentModalOpen(false); return; }

            if (isPaymentModalOpen) {
                // Modal checkout shortcuts
                if (e.key === 'Enter') { e.preventDefault(); handleCheckout(); return; }
                if (e.key === 'F1') { e.preventDefault(); setPaymentMethod('Cash'); return; }
                if (e.key === 'F2') { e.preventDefault(); setPaymentMethod('Card'); return; }
                if (e.key === 'F3') { e.preventDefault(); setPaymentMethod('Credit'); return; }
                if (e.key === 'F4') { e.preventDefault(); setPaymentMethod('COD'); return; }
                if (e.key === 'F5') { e.preventDefault(); document.querySelector<HTMLInputElement>('.ant-select-selection-search-input')?.focus(); return; }
                if (e.key === 'F6') { e.preventDefault(); setDiscount('fixed', discountValue); return; }
                if (e.key === 'F7') { e.preventDefault(); setDiscount('percent', discountValue); return; }
                if (e.key === 'F9') { e.preventDefault(); document.querySelector<HTMLInputElement>('.pos-paid-input .ant-input-number-input')?.focus(); return; }
            } else {
                // Main POS screen shortcuts
                if (e.key === 'Delete') { clearCart(); return; }
                if (e.key === 'F1') { e.preventDefault(); setIsAddCustomerModalVisible(true); return; }
                if (e.key === 'F2') { e.preventDefault(); setPaymentMethod('Credit'); message.success('Payment method set to Credit'); return; }
                if (e.key === 'F3') { e.preventDefault(); setIsPriceModeVisible(true); return; }
                if (e.key === 'F4') { e.preventDefault(); setPaymentMethod('HOLD'); message.success('Cart On Hold'); return; }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPaymentModalOpen, discountValue, clearCart, setPaymentMethod, setDiscount]);

    // ─── Checkout ─────────────────────────────────────────────────────
    const handleCheckout = async () => {
        // Validation 1: Check if cart is empty
        if (cart.length === 0) {
            message.warning('Cart is empty');
            return;
        }

        // Validation 2: Payment specific fields
        if (paymentMethod === 'Card') {
            if (!cardBank) {
                message.error('Please select a bank for the card payment.');
                return;
            }
            if (!cardFirstDigit) {
                message.error('Please enter the first digit of the card.');
                return;
            }
            if (!cardLastFour || cardLastFour.length < 4) {
                message.error('Please enter the last 4 digits of the card.');
                return;
            }
        }

        if (paymentMethod === 'Credit') {
            if (customerNameDisplay === 'Walk-In Customer') {
                message.error('A customer must be selected for credit sales.');
                return;
            }
        }

        // Validation 3: Paid amount vs Payable
        if (paymentMethod !== 'Credit' && paidAmount < totalPayable - 0.01) {
            message.error(`Insufficient paid amount. Total payable is LKR ${totalPayable.toFixed(2)}`);
            return;
        }

        try {
            await checkout(paidAmount, billNumber);
            message.success('Payment completed successfully!');
            setIsPaymentModalOpen(false);
            setPaidAmount(0);
            setDeliveryCharge(0);
            setDiscount('fixed', 0);
            setCardBank(''); setCardFirstDigit(''); setCardLastFour(''); setCardType('');
            setCustomerNameDisplay('Walk-In Customer');
            // Generate fresh bill number for the next transaction
            setBillNumber(generateBillNumber(priceMode, paymentMethod, isRefundMode));
            getProducts({ page: 1, limit: 1000, categoryId: selectedCategory === 'All Categories' ? undefined : selectedCategory, status: 'active' });
        } catch (error) {
            message.error('Failed to complete checkout.');
        }
    };

    // ─── Customer search ──────────────────────────────────────────────
    const handleCustomerSearch = async (value: string) => {
        if (value.length > 2) {
            const results = await searchCustomers(value);
            setCustomerOptions(results.map(c => ({ value: c.id, label: `${c.fullName} - ${c.phone}` })));
        } else {
            setCustomerOptions([]);
        }
    };

    const handleCustomerSelect = (value: string, option: any) => {
        setCustomer(value);
        setCustomerNameDisplay(option.label);
    };

    // ─── User menu ────────────────────────────────────────────────────
    const userMenuItems: MenuProps['items'] = [
        { key: 'profile-info', label: (<div className="px-3 py-2"><div className="font-semibold text-gray-800">{user.name}</div><div className="text-xs text-gray-500">{user.email}</div><div className="text-xs text-gray-400 mt-1">{user.role}</div></div>), disabled: true },
        { type: 'divider' },
        { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard', onClick: () => navigate('/dashboard') },
        { key: 'profile', icon: <UserOutlined />, label: 'My Profile' },
        { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
        { key: 'change-password', icon: <KeyOutlined />, label: 'Change Password' },
        { type: 'divider' },
        { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true },
    ];

    // ─── Price Mode label ─────────────────────────────────────────────
    const priceModeLabel: Record<PriceMode, string> = { retail: 'Retail', wholesale: 'WholeSale', our: 'Our Price' };
    const priceModeColor: Record<PriceMode, string> = { retail: '#3b82f6', wholesale: '#10b981', our: '#8b5cf6' };

    // ─── Stock badge ──────────────────────────────────────────────────
    const stockBadge = (item: POSItem) => {
        if (item.stock > 0) {
            const isWeight = isWeightBasedProduct(item.product.unitName || item.product.unitShortName);
            return { bg: 'bg-emerald-500 border-emerald-400', text: isWeight ? `${item.stock.toFixed(3)} IN STOCK` : `${item.stock} IN STOCK` };
        }
        if (allowNoStockBills) return { bg: 'bg-amber-500 border-amber-400', text: 'LOW STOCK' };
        return { bg: 'bg-rose-500 border-rose-400', text: 'OUT OF STOCK' };
    };

    // ─────────────────────────────────────────────────────────────────
    //  RENDER
    // ─────────────────────────────────────────────────────────────────
    return (
        <div className="h-screen flex flex-col bg-[#f0f2f5] overflow-hidden font-sans">

            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200 shadow-sm gap-4 z-20">
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

                {/* Barcode buffer indicator (dev) */}
                {process.env.NODE_ENV === 'development' && barcodeBuffer && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 border border-yellow-300 rounded text-xs font-mono text-yellow-800">
                        <BarcodeOutlined /> {barcodeBuffer}
                    </div>
                )}

                <div className="flex items-center gap-2.5">
                    {/* Feature #8 – No-stock indicator */}
                    {settingsLoaded && (
                        <Tooltip title={allowNoStockBills ? 'No-stock bills ALLOWED' : 'No-stock bills BLOCKED'}>
                            <div className={`text-[9px] font-bold px-2 py-1 rounded-full border ${allowNoStockBills ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-green-100 border-green-300 text-green-700'}`}>
                                {allowNoStockBills ? 'ALLOW NO STOCK' : 'STOCK REQUIRED'}
                            </div>
                        </Tooltip>
                    )}
                    {/* Feature #6 – Price Mode button */}
                    <Tooltip title="Switch Price Mode (F3)">
                        <Button
                            onClick={() => setIsPriceModeVisible(true)}
                            size="middle"
                            style={{ backgroundColor: priceModeColor[priceMode], color: 'white', border: 'none' }}
                            className="hover:opacity-90 text-xs rounded-lg shadow-sm font-semibold"
                        >
                            ⬡ {priceModeLabel[priceMode]}
                        </Button>
                    </Tooltip>
                    <Button onClick={() => { setPaymentMethod('COD'); message.success('Payment method set to COD'); }} size="middle" style={{ backgroundColor: '#5c8aff', color: 'white', border: 'none' }} className="hover:opacity-90 text-xs rounded-lg shadow-sm font-semibold">COD</Button>
                    <Button
                        onClick={async () => {
                            if (cart.length === 0) {
                                message.warning('Cart is empty');
                                return;
                            }
                            try {
                                await holdBill();
                                message.success('Bill held successfully');
                                setHeldBillsModalVisible(true);
                            } catch (error) {
                                message.error('Failed to hold bill');
                            }
                        }}
                        size="middle"
                        style={{ backgroundColor: '#ffaf40', color: 'white', border: 'none' }}
                        className="hover:opacity-90 text-xs rounded-lg shadow-sm font-semibold"
                    >
                        HOLD BILL
                    </Button>
                    <Button onClick={() => setRefundModalVisible(true)} size="middle" style={{ backgroundColor: '#fa5f55', color: 'white', border: 'none' }} className="hover:opacity-90 text-xs rounded-lg shadow-sm font-semibold">REFUND</Button>

                    <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
                        <div className="cursor-pointer ml-2">
                            <Avatar size={40} src={user.avatar} icon={!user.avatar && <UserOutlined />} className="bg-indigo-500 hover:bg-indigo-600 transition-all shadow-sm" />
                        </div>
                    </Dropdown>
                    <Button type="text" onClick={() => navigate('/dashboard')} className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 font-semibold ml-2 rounded-lg px-4 transition-colors">Exit POS</Button>
                </div>
            </div>

            {/* ── Main Layout ──────────────────────────────────────────── */}
            <div className="flex flex-1 overflow-hidden h-full">

                {/* ── Left Pane – Products ────────────────────────────── */}
                <div className="w-1/2 flex flex-col bg-slate-50 border-r border-gray-200 shadow-sm z-10">
                    <div className="flex gap-3 p-3 bg-white border-b border-gray-200 flex-shrink-0">
                        <Input
                            size="large"
                            prefix={<SearchOutlined className="text-gray-400" />}
                            placeholder="Search products by name, SKU or barcode..."
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

                    <div className="flex-1 overflow-y-auto p-0 bg-white custom-scrollbar">
                        {productsLoading ? (
                            <div className="flex items-center justify-center h-full"><Spin size="large" /></div>
                        ) : posItems.length === 0 ? (
                            <div className="flex items-center justify-center h-full"><Empty description="No products found" /></div>
                        ) : (
                                <div className="grid grid-cols-4 border-t border-l border-gray-200">
                                    {posItems.map((item) => {
                                        const badge = stockBadge(item);
                                        const isOutOfStock = item.stock <= 0;
                                        const disabled = isOutOfStock && !allowNoStockBills;
                                        return (
                                            <div
                                                key={item.cardId}
                                                style={{ height: '320px' }}
                                                className={`bg-white border-r border-b border-gray-200 flex flex-col group relative transition-all duration-200 overflow-hidden ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'cursor-pointer hover:bg-blue-50/40'}`}
                                                onClick={() => !disabled && handleAddToCart(item)}
                                            >
                                                {/* ── Zone 1: Image (160px fixed) ── */}
                                                <div style={{ height: '160px', minHeight: '160px' }} className="bg-slate-50 flex items-center justify-center relative overflow-hidden shrink-0 border-b border-gray-100">
                                                    {/* Stock badge – top right */}
                                                    <div className={`absolute top-2 right-2 z-10 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide whitespace-nowrap ${badge.bg} text-white shadow-sm`}>
                                                        {item.stock > 0
                                                            ? `${isWeightBasedProduct(item.product.unitName || item.product.unitShortName) ? item.stock.toFixed(2) : item.stock}`
                                                            : badge.text}
                                                    </div>
                                                    {/* Weight badge – top left */}
                                                    {isWeightBasedProduct(item.product.unitName || item.product.unitShortName) && (
                                                        <div className="absolute top-2 left-2 z-10 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-600 text-white shadow-sm">
                                                            ⚖ WT
                                                        </div>
                                                    )}
                                                    {item.imageUrl ? (
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={item.displayName}
                                                            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '12px' }}
                                                        />
                                                    ) : (
                                                        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm">
                                                            <span className="text-4xl text-slate-300 font-black">{item.displayName.charAt(0)}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* ── Zone 2: Product Name (52px fixed) ── */}
                                                <div style={{ height: '52px', minHeight: '52px' }} className="px-3 pt-3 shrink-0 overflow-hidden">
                                                    <p className="text-[13px] font-bold text-slate-800 leading-tight uppercase line-clamp-2 group-hover:text-indigo-700 transition-colors m-0">
                                                        {item.displayName}
                                                    </p>
                                                </div>

                                                {/* ── Zone 3: Variation / Type tag (32px fixed) ── */}
                                                <div style={{ height: '32px', minHeight: '32px' }} className="px-3 pb-1 shrink-0 flex items-center overflow-hidden">
                                                    <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded border truncate max-w-full ${item.variation ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                                                        {item.variation ? item.variationLabel : item.typeName}
                                                    </span>
                                                </div>

                                                {/* ── Zone 4: Price + Add button (60px fixed) ── */}
                                                <div style={{ height: '60px', minHeight: '60px' }} className="px-3 py-2 shrink-0 border-t border-slate-100 flex items-center justify-between bg-white">
                                                    <div className="flex flex-col min-w-0 overflow-hidden">
                                                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest leading-none mb-1">
                                                            {priceModeLabel[priceMode]}
                                                        </span>
                                                        <div className="flex items-baseline gap-1 flex-nowrap overflow-hidden">
                                                            <span className="text-[11px] font-bold text-indigo-400 shrink-0">LKR</span>
                                                            <span className="text-lg font-black text-indigo-700 tracking-tighter truncate">
                                                                {item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {!disabled ? (
                                                        <div className="w-8 h-8 shrink-0 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-100 transition-colors ml-2">
                                                            <PlusOutlined style={{ fontSize: '12px' }} />
                                                        </div>
                                                    ) : (
                                                        <div className="w-8 h-8 shrink-0 rounded-lg bg-rose-100 flex items-center justify-center text-rose-400 ml-2">
                                                            <CloseOutlined style={{ fontSize: '11px' }} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                        )}
                    </div>
                </div>

                {/* ── Right Pane – Cart & Checkout ────────────────────── */}
                <div className="w-1/2 flex flex-col bg-white">
                    {/* Action buttons */}
                    <div className="p-3 border-b border-gray-200 flex gap-2 shrink-0">
                        <Button onClick={() => setIsAddCustomerModalVisible(true)} style={{ backgroundColor: '#54a0ff', color: 'white', border: 'none', height: '40px' }} className="flex-1 hover:opacity-90 font-semibold text-[11px] rounded-lg shadow-sm">CREATE CUSTOMER (F1)</Button>
                        <Button onClick={() => { setPaymentMethod('Credit'); message.success('Payment method set to Credit'); }} style={{ backgroundColor: '#ff6b6b', color: 'white', border: 'none', height: '40px' }} className="flex-1 hover:opacity-90 font-semibold text-[11px] rounded-lg shadow-sm">CREDIT (F2)</Button>
                        {/* Feature #6 – Price Mode button */}
                        <Button
                            onClick={() => setIsPriceModeVisible(true)}
                            style={{ backgroundColor: priceModeColor[priceMode], color: 'white', border: 'none', height: '40px' }}
                            className="flex-1 hover:opacity-90 font-semibold text-[10px] rounded-lg shadow-sm"
                        >
                            {priceModeLabel[priceMode].toUpperCase()} (F3)
                        </Button>
                        <Button onClick={() => message.info('Help Documentation coming soon.')} style={{ backgroundColor: '#95a5a6', color: 'white', border: 'none', height: '40px' }} className="hover:opacity-90 font-semibold text-[11px] px-4 rounded-lg shadow-sm">HELP (F12)</Button>
                        <Button onClick={() => navigate('/settings')} style={{ backgroundColor: '#bdc3c7', color: 'white', border: 'none', height: '40px', width: '40px' }} className="flex justify-center items-center hover:opacity-90 rounded-lg shadow-sm" icon={<SettingOutlined />} />
                    </div>

                    {/* Cart header */}
                    <div className="bg-[#2ea2f8] text-white text-xs font-bold uppercase tracking-wider flex py-2.5 px-4 z-10 shadow-sm shrink-0">
                        <div className="flex-[3] min-w-0 pl-1">Name</div>
                        <div className="flex-1 min-w-0 text-center">Unit</div>
                        <div className="w-32 shrink-0 px-2 text-center">Qty</div>
                        <div className="flex-1 min-w-0 text-right">Price</div>
                        <div className="flex-1 min-w-0 text-right pr-2">Total</div>
                        <div className="w-8 shrink-0"></div>
                    </div>

                    {/* Cart items */}
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
                                        <div className="w-7 h-7 rounded-full flex items-center justify-center bg-rose-50 hover:bg-rose-100 text-rose-500 cursor-pointer transition-colors" onClick={() => updateQuantity(item.id, -1)}>
                                            <MinusOutlined className="text-[12px] font-bold" />
                                        </div>
                                        {/* Feature #5 – Display weight with 3 decimals */}
                                        <span className="w-12 text-center font-bold text-gray-800 text-base select-none">
                                            {isWeightBasedProduct(item.unit) ? item.quantity.toFixed(3) : item.quantity}
                                        </span>
                                        <div className="w-7 h-7 rounded-full flex items-center justify-center bg-emerald-50 hover:bg-emerald-100 text-emerald-600 cursor-pointer transition-colors" onClick={() => updateQuantity(item.id, 1)}>
                                            <PlusOutlined className="text-[12px] font-bold" />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0 text-right text-gray-600 font-medium tabular-nums">{item.price.toFixed(2)}</div>
                                    <div className="flex-1 min-w-0 text-right font-bold text-gray-900 text-base tabular-nums pr-2">{(item.price * item.quantity).toFixed(2)}</div>
                                    <div className="w-8 shrink-0 flex justify-center">
                                        <div className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-rose-100 text-gray-400 hover:text-rose-600 cursor-pointer transition-colors" onClick={() => removeItem(item.id)}>
                                            <DeleteOutlined className="text-base" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Cart summary + action buttons */}
                    <div className="border-t border-gray-200 p-4 bg-gray-50 shrink-0">
                        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="text-slate-500 font-medium text-[11px] tracking-wider uppercase">Items</div>
                                    <div className="bg-indigo-50 text-indigo-700 font-bold px-2.5 py-0.5 rounded-md text-sm border border-indigo-100 min-w-[28px] text-center">{cart.length}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-slate-500 font-medium text-[11px] tracking-wider uppercase">Qty</div>
                                    <div className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded-md text-sm border border-emerald-100 min-w-[28px] text-center">
                                        {cart.length === 0 ? 0 : cart.reduce((s, i) => s + i.quantity, 0).toFixed(1).replace(/\.0$/, '')}
                                    </div>
                                </div>
                                {/* Feature #5 – Total Weight */}
                                {totalWeight > 0 && (
                                    <div className="flex items-center gap-2">
                                        <div className="text-slate-500 font-medium text-[11px] tracking-wider uppercase">Weight</div>
                                        <div className="bg-blue-50 text-blue-700 font-bold px-2.5 py-0.5 rounded-md text-sm border border-blue-100">
                                            {totalWeight.toFixed(3)} kg
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-slate-500 font-medium text-xs tracking-wider uppercase">Sub Total</div>
                                <div className="text-2xl font-black text-slate-800 tabular-nums tracking-tighter">{cart.length === 0 ? '0.00' : subTotal.toFixed(2)}</div>
                            </div>
                        </div>

                        <div className="flex gap-3 h-[120px]">
                            <div className="flex flex-col gap-3 w-1/2 h-full">
                                <Button onClick={() => { setPaymentMethod('HOLD'); message.success('Cart On Hold'); }} style={{ backgroundColor: '#ffaf40', color: 'white', border: 'none', height: '100%' }} className="hover:opacity-90 font-bold flex-1 w-full rounded-xl shadow-sm text-base tracking-wide">HOLD (F4)</Button>
                                <Button style={{ backgroundColor: '#ff5252', color: 'white', border: 'none', height: '100%' }} className="hover:opacity-90 font-bold flex-1 w-full rounded-xl shadow-sm text-base tracking-wide" onClick={clearCart}>RESET (DEL)</Button>
                            </div>
                            <Button
                                onClick={() => { if (cart.length > 0) { setIsPaymentModalOpen(true); setPaidAmount(totalPayable); } }}
                                style={{ height: '100%', fontSize: '32px', ...(cart.length > 0 ? { backgroundColor: '#32ff7e', color: '#006266', border: 'none' } : { border: 'none' }) }}
                                className={`w-1/2 font-black border-none shadow-md rounded-xl tracking-wide transition-all flex items-center justify-center ${cart.length > 0 ? 'hover:opacity-90 transform hover:-translate-y-0.5' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                            >
                                {isRefundMode ? 'REFUND NOW' : 'PAY NOW'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Payment Modal (Landscape) ──────────────────────────────── */}
            <Modal
                open={isPaymentModalOpen}
                onCancel={() => setIsPaymentModalOpen(false)}
                footer={null}
                closable={false}
                width={980}
                styles={{ body: { padding: 0 } }}
                centered
            >
                <div className="bg-white overflow-hidden rounded-xl shadow-2xl font-sans select-none">

                    {/* ── Title Bar ── */}
                    <div className="flex items-center justify-between px-5 py-3 bg-[#1a1a2e]">
                        <span className="text-white font-extrabold text-base tracking-wide">
                            {isRefundMode ? 'PROCESS REFUND' : 'PROCESS PAYMENT'}
                        </span>
                        <div className="flex items-center gap-5">
                            <div className="flex items-center gap-5 text-[12px] text-gray-300">
                                <span>Items: <strong className="text-white">{cart.length}</strong></span>
                                <span>Subtotal: <strong className="text-white">{subTotal.toFixed(2)}</strong></span>
                                <span>Weight: <strong className="text-blue-300">{totalWeight.toFixed(3)} Kg</strong></span>
                                <label className="flex items-center gap-1.5 cursor-pointer text-gray-300">
                                    <Checkbox checked={printBill} onChange={e => setPrintBill(e.target.checked)} />
                                    <span className="whitespace-nowrap">Print Bill (F12)</span>
                                </label>
                            </div>
                            <button
                                onClick={() => setIsPaymentModalOpen(false)}
                                className="w-7 h-7 bg-red-500 hover:bg-red-600 rounded-md flex items-center justify-center text-white transition-colors"
                            >
                                <CloseOutlined style={{ fontSize: 10 }} />
                            </button>
                        </div>
                    </div>

                    {/* ── 2-Column Body ── */}
                    <div className="flex divide-x divide-gray-200" style={{ minHeight: 460 }}>

                        {/* ── LEFT COLUMN — Form Inputs ── */}
                        <div className="flex-1 px-5 py-4 flex flex-col gap-4 overflow-y-auto">

                            {/* Customer */}
                            <div>
                                <div className="text-[11px] font-bold text-gray-500 uppercase mb-1.5 tracking-wide">
                                    CUSTOMER <span className="text-gray-400 font-normal">[F5]</span>
                                    {paymentMethod === 'Credit' && <span className="text-red-500 ml-1">*required</span>}
                                </div>
                                <AutoComplete
                                    onSearch={handleCustomerSearch}
                                    onSelect={handleCustomerSelect}
                                    options={customerOptions}
                                    className="w-full"
                                >
                                    <Input
                                        placeholder="Search customer name / phone..."
                                        className="rounded-md border-gray-300"
                                        style={{ height: 34 }}
                                    />
                                </AutoComplete>
                                <div className="mt-1 text-[12px] font-semibold text-blue-600">{customerNameDisplay}</div>
                            </div>

                            {/* Bill No + Weight inline */}
                            <div className="flex items-center gap-4 text-[12px] text-gray-500">
                                <span className="font-semibold">{isRefundMode ? 'Refund No:' : 'Bill No:'}</span>
                                {billNumberLoading
                                    ? <Spin size="small" />
                                    : <span className="font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">{billNumber || '—'}</span>
                                }
                            </div>

                            <div className="border-t border-gray-100" />

                            {/* Discount & Delivery */}
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <div className="text-[11px] font-bold text-gray-500 uppercase mb-1.5 tracking-wide">
                                        DISCOUNT <span className="text-gray-400 font-normal text-[10px]">F6=Fixed F7=%</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Radio.Group
                                            value={discountType}
                                            onChange={e => setDiscount(e.target.value, discountValue)}
                                            size="small"
                                        >
                                            <Radio value="fixed" className="text-sm">Fixed</Radio>
                                            <Radio value="percent" className="text-sm">%</Radio>
                                        </Radio.Group>
                                        <InputNumber
                                            value={discountValue}
                                            onChange={v => setDiscount(discountType, Number(v))}
                                            className="flex-1 rounded-md"
                                            precision={2}
                                            min={0}
                                        />
                                        <span className="text-[10px] text-red-500 font-semibold whitespace-nowrap">
                                            -{discountAmount.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                                <div className="w-40">
                                    <div className="text-[11px] font-bold text-gray-500 uppercase mb-1.5 tracking-wide">
                                        DELIVERY <span className="text-gray-400 font-normal">[F8]</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <InputNumber
                                            value={deliveryCharge}
                                            onChange={v => setDeliveryCharge(Number(v))}
                                            className="flex-1 rounded-md"
                                            precision={2}
                                            min={0}
                                        />
                                        <span className="text-[10px] text-green-600 font-semibold whitespace-nowrap">
                                            +{deliveryCharge.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Tracking */}
                            <div>
                                <div className="text-[11px] font-bold text-gray-500 uppercase mb-1.5 tracking-wide">
                                    TRACKING NO <span className="text-gray-400 font-normal">(Optional) [F10]</span>
                                </div>
                                <Input
                                    style={{ height: 34 }}
                                    value={trackingNumber}
                                    onChange={e => setTrackingNumber(e.target.value)}
                                    placeholder="Enter tracking number... (F10)"
                                    className="rounded-md border-gray-300"
                                />
                            </div>

                            <div className="border-t border-gray-100" />

                            {/* Payment Method */}
                            <div>
                                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">
                                    PAYMENT METHOD <span className="text-gray-400 font-normal text-[10px]">F1=Cash F2=Card F3=Credit F4=COD</span>
                                </div>
                                <Radio.Group
                                    value={paymentMethod}
                                    onChange={e => setPaymentMethod(e.target.value)}
                                    className="flex gap-5"
                                >
                                    {['Cash', 'Card', 'Credit', 'COD'].map(m => (
                                        <Radio key={m} value={m} className="text-[14px] font-medium text-gray-700">{m}</Radio>
                                    ))}
                                </Radio.Group>
                            </div>

                            {/* Card Details — shown in left col to avoid vertical overflow */}
                            {paymentMethod === 'Card' && (
                                <div className="bg-gray-50 rounded-lg border border-gray-200 p-3.5 flex flex-col gap-3">
                                    <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Card Details</div>
                                    <Select
                                        value={cardBank || undefined}
                                        onChange={setCardBank}
                                        placeholder="Select issuing bank..."
                                        className="w-full"
                                    >
                                        <Option value="COM">Commercial Bank</Option>
                                        <Option value="SAM">Sampath Bank</Option>
                                        <Option value="HNB">HNB Bank</Option>
                                        <Option value="BOC">Bank of Ceylon</Option>
                                        <Option value="NDB">NDB Bank</Option>
                                    </Select>
                                    <div className="flex gap-2 items-end">
                                        <div className="flex-1">
                                            <div className="text-[11px] text-gray-500 font-semibold mb-1">1st Digit</div>
                                            <Input
                                                style={{ height: 34 }}
                                                maxLength={1}
                                                value={cardFirstDigit}
                                                onChange={e => { setCardFirstDigit(e.target.value); setCardType(detectCardType(e.target.value)); }}
                                                placeholder="4"
                                                className="text-center font-bold text-base rounded-md"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-[11px] text-gray-500 font-semibold mb-1">Last 4 Digits</div>
                                            <Input
                                                style={{ height: 34 }}
                                                maxLength={4}
                                                value={cardLastFour}
                                                onChange={e => setCardLastFour(e.target.value)}
                                                placeholder="0000"
                                                className="text-center font-bold text-base rounded-md tracking-widest"
                                            />
                                        </div>
                                        {cardType && (
                                            <div className="flex items-center gap-1.5 bg-gray-800 px-2.5 py-1.5 rounded-lg flex-shrink-0">
                                                <span className="text-white text-[10px] font-bold">{cardType}</span>
                                                <div className="text-white text-lg">
                                                    {cardType === 'VISA' && <FaCcVisa />}
                                                    {cardType === 'MASTERCARD' && <FaCcMastercard />}
                                                    {cardType === 'AMEX' && <SiAmericanexpress />}
                                                    {cardType === 'DISCOVER' && <FaCcDiscover />}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* ── RIGHT COLUMN — Summary & Action ── */}
                        <div className="w-80 flex-shrink-0 px-5 py-4 flex flex-col justify-between bg-gray-50/50">

                            <div className="flex flex-col gap-4">
                                {/* Total Payable */}
                                <div>
                                    <div className="text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-1">TOTAL PAYABLE</div>
                                    <div className="text-[46px] font-black text-blue-600 leading-none tabular-nums tracking-tight">
                                        {totalPayable.toFixed(2)}
                                    </div>
                                    <div className="mt-2 flex flex-col gap-1">
                                        {discountAmount > 0 && (
                                            <div className="flex justify-between text-[11px] text-red-500">
                                                <span>Discount (−)</span>
                                                <span className="font-semibold">{discountAmount.toFixed(2)}</span>
                                            </div>
                                        )}
                                        {deliveryCharge > 0 && (
                                            <div className="flex justify-between text-[11px] text-green-600">
                                                <span>Delivery (+)</span>
                                                <span className="font-semibold">{deliveryCharge.toFixed(2)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="border-t border-gray-200" />

                                {/* Paid Amount */}
                                <div>
                                    <div className="text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                                        PAID AMOUNT <span className="text-gray-400 font-normal">[F9]</span>
                                    </div>
                                    <InputNumber
                                        value={paidAmount}
                                        onChange={v => setPaidAmount(Number(v))}
                                        className="w-full pos-paid-input"
                                        style={{ width: '100%', height: 62, backgroundColor: '#eff6ff', border: '2px solid #bfdbfe', borderRadius: 8, fontSize: 28, fontWeight: 900, color: '#1d4ed8' }}
                                        precision={2}
                                        autoFocus
                                        onFocus={e => e.target.select()}
                                        controls={false}
                                    />
                                    <div className="text-[11px] text-gray-400 mt-1 text-center">Enter to complete</div>
                                </div>

                                {/* Balance */}
                                <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                                    <span className="text-[13px] font-bold text-gray-600">Balance:</span>
                                    <span className={`text-2xl font-black tabular-nums ${paidAmount - totalPayable < 0 ? 'text-red-500' : 'text-green-600'}`}>
                                        {(paidAmount - totalPayable).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-2 mt-5">
                                <Button
                                    onClick={handleCheckout}
                                    loading={posLoading}
                                    style={{ backgroundColor: '#22c55e', border: 'none', color: 'white', height: 50, fontSize: 13, fontWeight: 900, letterSpacing: '0.07em', borderRadius: 8 }}
                                    className="w-full"
                                >
                                    {isRefundMode ? 'CONFIRM REFUND' : 'COMPLETE PAYMENT'} [Enter]
                                </Button>
                                <Button
                                    onClick={() => setIsPaymentModalOpen(false)}
                                    style={{ height: 38, fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', color: '#6b7280', backgroundColor: '#f3f4f6', border: 'none', borderRadius: 8 }}
                                    className="w-full"
                                >
                                    CANCEL [Esc]
                                </Button>
                            </div>

                        </div>
                    </div>

                </div>
            </Modal>

            {/* ── Feature #7 – Weight Entry Modal ───────────────────────── */}
            <WeightEntryModal
                visible={weightModalVisible}
                product={selectedWeightProduct?.product || null}
                onConfirm={handleWeightConfirm}
                onCancel={() => { setWeightModalVisible(false); setSelectedWeightProduct(null); }}
                allowNoStock={allowNoStockBills}
            />

            {/* ── Feature #6 – Price Mode Selector ─────────────────────── */}
            <PriceModeSelector
                visible={isPriceModeVisible}
                currentMode={priceMode as "our" | "retail" | "wholesale"}
                onSelect={(mode) => {
                    const newMode = mode as PriceMode;
                    setPriceMode(newMode);

                    // Update prices of all items already in the cart
                    const updatedItems = cart.map(item => {
                        const product = products.find(p => p.id === item.productId);
                        if (!product) return { id: item.id, price: item.price };
                        const variation = product.variations?.find(v => v.id === item.variationId);
                        const newPrice = getPriceByMode(product as any, variation as any, newMode);
                        return { id: item.id, price: newPrice };
                    });

                    updateCartItemPrices(updatedItems);
                    message.success(`Price mode changed to ${priceModeLabel[newMode]}`);
                }}
                onClose={() => setIsPriceModeVisible(false)}
            />

            {/* ── Add Customer Modal ─────────────────────────────────────── */}
            <AddCustomerModal
                visible={isAddCustomerModalVisible}
                onCancel={() => setIsAddCustomerModalVisible(false)}
                onSuccess={() => setIsAddCustomerModalVisible(false)}
            />

            {/* ── POS Refund Modal ───────────────────────────────────────── */}
            <POSRefundModal
                visible={refundModalVisible}
                onClose={() => setRefundModalVisible(false)}
            />

            {/* ── Feature #10 – Held Bills Modal ─────────────────────────── */}
            <HeldBillsModal
                visible={heldBillsModalVisible}
                onClose={() => setHeldBillsModalVisible(false)}
                onResume={(billData) => {
                    resumeHoldBill(billData);
                    setHeldBillsModalVisible(false);
                    message.success('Bill resumed to cart');
                }}
                loading={posLoading}
            />
        </div>
    );
};

export default POS;
