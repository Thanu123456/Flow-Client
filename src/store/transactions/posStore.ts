import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { posService } from "../../services/transactions/posService";
import type { POSSaleRequest } from "../../services/transactions/posService";
import { isWeightBasedProduct } from "../../utils/posHelpers";

// ─────────────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────────────
export interface CartItem {
    id: string;          // Product.id or Variation.id (cart key)
    productId: string;
    variationId?: string;
    name: string;
    unit: string;
    quantity: number;    // Decimal for weight products, integer for others
    price: number;
    maxStock: number;    // 0 means unlimited (or no-stock allowed)
}

interface POSState {
    // Cart
    cart: CartItem[];

    // Meta
    loading: boolean;
    error: string | null;

    // Transaction fields
    customerId: string | null;
    paymentMethod: string;
    isRefundMode: boolean;

    // Feature #1 – Discount
    discountType: "fixed" | "percent";
    discountValue: number;

    // Feature #2 – Delivery Charge
    deliveryCharge: number;

    // Feature #3 – Card Payment
    cardBank: string;
    cardFirstDigit: string;
    cardLastFour: string;
    cardType: string;

    // Feature #6 – Price Mode
    priceMode: "our" | "retail" | "wholesale";

    // Actions
    addToCart: (item: CartItem) => void;
    setCartItemQuantity: (id: string, quantity: number) => void;
    updateQuantity: (id: string, delta: number) => void;
    removeItem: (id: string) => void;
    clearCart: () => void;
    setCustomer: (id: string | null) => void;
    setPaymentMethod: (method: string) => void;
    setRefundMode: (mode: boolean) => void;
    setDiscount: (type: "fixed" | "percent", value: number) => void;
    setDeliveryCharge: (amount: number) => void;
    setCardBank: (bank: string) => void;
    setCardFirstDigit: (digit: string) => void;
    setCardLastFour: (lastFour: string) => void;
    setCardType: (type: string) => void;
    setPriceMode: (mode: "our" | "retail" | "wholesale") => void;
    initializePriceMode: () => void;
    checkout: (paidAmount: number, billNumber?: string) => Promise<void>;
    updateCartItemPrices: (itemsWithNewPrices: { id: string; price: number }[]) => void;

    // Feature #10 – Hold Bills
    holdBill: () => Promise<void>;
    resumeHoldBill: (billData: any) => void;
}

// ─────────────────────────────────────────────────────────────────────
//  Store
// ─────────────────────────────────────────────────────────────────────
export const usePOSStore = create<POSState>()(
    devtools(
        (set, get) => ({
            cart: [],
            loading: false,
            error: null,
            customerId: null,
            paymentMethod: "Cash",
            isRefundMode: false,
            discountType: "fixed",
            discountValue: 0,
            deliveryCharge: 0,
            cardBank: "",
            cardFirstDigit: "",
            cardLastFour: "",
            cardType: "",
            priceMode: "retail",

            // ── addToCart ─────────────────────────────────────────────
            // For weight products: accumulates decimal quantities
            // For regular products: increments by 1, capped at maxStock
            addToCart: (item) => {
                const { cart } = get();
                const existing = cart.find((i) => i.id === item.id);
                const isWeight = isWeightBasedProduct(item.unit);

                if (existing) {
                    const maxAllowed = existing.maxStock > 0 ? existing.maxStock : Infinity;
                    const newQty = isWeight
                        ? Math.min(existing.quantity + item.quantity, maxAllowed)
                        : Math.min(existing.quantity + 1, maxAllowed);
                    set({
                        cart: cart.map((i) =>
                            i.id === item.id ? { ...i, quantity: newQty } : i
                        ),
                    });
                } else {
                    const initialQty = isWeight ? item.quantity : 1;
                    set({ cart: [...cart, { ...item, quantity: initialQty }] });
                }
            },

            // ── setCartItemQuantity (direct set, for weight items) ────
            setCartItemQuantity: (id, quantity) => {
                const { cart } = get();
                if (quantity <= 0) {
                    set({ cart: cart.filter((i) => i.id !== id) });
                    return;
                }
                set({
                    cart: cart.map((item) =>
                        item.id === id ? { ...item, quantity } : item
                    ),
                });
            },

            // ── updateQuantity (delta: +1 or -1) ─────────────────────
            updateQuantity: (id, delta) => {
                const { cart } = get();
                set({
                    cart: cart
                        .map((item) => {
                            if (item.id !== id) return item;
                            const step = isWeightBasedProduct(item.unit) ? 0.1 : 1;
                            const newQty = item.quantity + delta * step;
                            const maxAllowed = item.maxStock > 0 ? item.maxStock : Infinity;
                            if (newQty <= 0) return { ...item, quantity: 0 };
                            return { ...item, quantity: Math.min(newQty, maxAllowed) };
                        })
                        .filter((item) => item.quantity > 0),
                });
            },

            removeItem: (id) => {
                set({ cart: get().cart.filter((item) => item.id !== id) });
            },

            clearCart: () =>
                set({
                    cart: [],
                    customerId: null,
                    paymentMethod: "Cash",
                    isRefundMode: false,
                    discountType: "fixed",
                    discountValue: 0,
                    deliveryCharge: 0,
                    cardBank: "",
                    cardFirstDigit: "",
                    cardLastFour: "",
                    cardType: "",
                }),

            setCustomer: (id) => set({ customerId: id }),
            setPaymentMethod: (method) => set({ paymentMethod: method }),
            setRefundMode: (mode) => set({ isRefundMode: mode }),
            setDiscount: (type, value) => set({ discountType: type, discountValue: value }),
            setDeliveryCharge: (amount) => set({ deliveryCharge: Math.max(0, amount) }),
            setCardBank: (bank) => set({ cardBank: bank }),
            setCardFirstDigit: (digit) => set({ cardFirstDigit: digit.slice(0, 1) }),
            setCardLastFour: (lastFour) => set({ cardLastFour: lastFour.slice(0, 4) }),
            setCardType: (type) => set({ cardType: type }),
            setPriceMode: (mode) => {
                set({ priceMode: mode });
                // Persist to localStorage immediately
                if (typeof window !== 'undefined') {
                    localStorage.setItem('posPriceMode', mode);
                }
            },
            // ── Initialize price mode from localStorage ────────────────────
            initializePriceMode: () => {
                if (typeof window !== 'undefined') {
                    const saved = localStorage.getItem('posPriceMode') as "our" | "retail" | "wholesale" | null;
                    if (saved && ['our', 'retail', 'wholesale'].includes(saved)) {
                        set({ priceMode: saved });
                    }
                }
            },

            // ── checkout ──────────────────────────────────────────────
            checkout: async (paidAmount: number, billNumber?: string) => {
                const {
                    cart, customerId, paymentMethod, isRefundMode,
                    clearCart, discountType, discountValue, deliveryCharge,
                    cardBank, cardFirstDigit, cardLastFour, cardType, priceMode,
                } = get();

                if (cart.length === 0) return;

                set({ loading: true, error: null });
                try {
                    const totalAmount = cart.reduce(
                        (sum, item) => sum + item.price * item.quantity,
                        0
                    );

                    // Feature #1 – Discount calculation
                    let discountAmount = 0;
                    if (discountType === "fixed") {
                        discountAmount = Math.min(discountValue, totalAmount);
                    } else if (discountType === "percent") {
                        discountAmount = (totalAmount * Math.min(discountValue, 100)) / 100;
                    }

                    const payload: POSSaleRequest = {
                        invoice_number: billNumber,                         // Feature #4
                        customer_id: customerId || undefined,
                        payment_method: paymentMethod,
                        total_amount: Math.abs(totalAmount),
                        paid_amount: Math.abs(paidAmount),
                        discount_type: discountType,
                        discount_value: discountValue,
                        discount_amount: discountAmount,                 // Feature #1
                        delivery_charge: deliveryCharge,                 // Feature #2
                        card_bank: cardBank || undefined,                // Feature #3
                        card_number:
                            cardFirstDigit || cardLastFour
                                ? `${cardFirstDigit}***${cardLastFour}`
                                : undefined,
                        card_type: cardType || undefined,
                        price_mode: priceMode,                           // Feature #6
                        products: cart.map((item) => ({
                            product_id: item.productId,
                            variation_id: item.variationId,
                            quantity: item.quantity,                     // Feature #5 decimal qty
                            price: item.price,
                        })),
                    };

                    if (isRefundMode) {
                        await posService.createReturn(payload);
                    } else {
                        await posService.createSale(payload);
                    }

                    clearCart();
                    set({ loading: false });
                } catch (error: any) {
                    set({
                        error: error.response?.data?.message || "Failed to complete checkout",
                        loading: false,
                    });
                    throw error;
                }
            },

            // ── holdBill (Feature #10) ────────────────────────────────
            holdBill: async () => {
                const {
                    cart, customerId, discountType, discountValue,
                    deliveryCharge, clearCart,
                } = get();

                if (cart.length === 0) return;

                set({ loading: true, error: null });
                try {
                    const subtotal = cart.reduce(
                        (sum, item) => sum + item.price * item.quantity,
                        0
                    );

                    let discountAmount = 0;
                    if (discountType === "fixed") {
                        discountAmount = Math.min(discountValue, subtotal);
                    } else if (discountType === "percent") {
                        discountAmount = (subtotal * Math.min(discountValue, 100)) / 100;
                    }

                    const totalAmount = subtotal - discountAmount + deliveryCharge;

                    const payload = {
                        customer_id: customerId || undefined,
                        items: cart.map((item) => ({
                            id: item.id,
                            product_id: item.productId,
                            variation_id: item.variationId,
                            name: item.name,
                            unit: item.unit,
                            quantity: item.quantity,
                            price: item.price,
                            max_stock: item.maxStock,
                        })),
                        subtotal,
                        discount_type: discountType,
                        discount_value: discountValue,
                        discount_amount: discountAmount,
                        delivery_charge: deliveryCharge,
                        total_amount: totalAmount,
                    };

                    const response = await fetch('/api/admin/pos/hold', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                    });

                    if (response.ok) {
                        clearCart();
                        set({ loading: false });
                    } else {
                        throw new Error('Failed to hold bill');
                    }
                } catch (error: any) {
                    set({
                        error: error.message || "Failed to hold bill",
                        loading: false,
                    });
                    throw error;
                }
            },

            // ── resumeHoldBill (Feature #10) ──────────────────────────
            resumeHoldBill: (billData) => {
                const cartItems: CartItem[] = billData.items.map((item: any) => ({
                    id: item.id,
                    productId: item.product_id,
                    variationId: item.variation_id,
                    name: item.name,
                    unit: item.unit,
                    quantity: item.quantity,
                    price: item.price,
                    maxStock: item.max_stock,
                }));

                set({
                    cart: cartItems,
                    customerId: billData.customer_id || null,
                    discountType: billData.discount_type,
                    discountValue: billData.discount_value,
                    deliveryCharge: billData.delivery_charge,
                });
            },

            // ─── updateCartItemPrices ─────────────────────────────────
            updateCartItemPrices: (itemsWithNewPrices) => {
                const { cart } = get();
                const newCart = cart.map((item) => {
                    const match = itemsWithNewPrices.find((m) => m.id === item.id);
                    return match ? { ...item, price: match.price } : item;
                });
                set({ cart: newCart });
            },
        }),
        { name: "pos-store" }
    )
);
