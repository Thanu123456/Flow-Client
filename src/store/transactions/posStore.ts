import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { posService } from "../../services/transactions/posService";
import type { POSSaleRequest } from "../../services/transactions/posService";

interface CartItem {
    id: string; // Product.id or Variation.id
    productId: string;
    variationId?: string;
    name: string;
    unit: string;
    quantity: number;
    price: number;
    maxStock: number;
}

interface POSState {
    cart: CartItem[];
    loading: boolean;
    error: string | null;
    customerId: string | null;
    paymentMethod: string;
    isRefundMode: boolean;

    addToCart: (item: CartItem) => void;
    updateQuantity: (id: string, delta: number) => void;
    removeItem: (id: string) => void;
    clearCart: () => void;
    setCustomer: (id: string | null) => void;
    setPaymentMethod: (method: string) => void;
    setRefundMode: (mode: boolean) => void;
    checkout: (paidAmount: number) => Promise<void>;
}

export const usePOSStore = create<POSState>()(
    devtools(
        (set, get) => ({
            cart: [],
            loading: false,
            error: null,
            customerId: null,
            paymentMethod: "Cash",
            isRefundMode: false,

            addToCart: (item) => {
                const { cart } = get();
                const existing = cart.find((i) => i.id === item.id);
                if (existing) {
                    set({
                        cart: cart.map((i) =>
                            i.id === item.id
                                ? { ...i, quantity: Math.min(i.quantity + 1, i.maxStock > 0 ? i.maxStock : Infinity) }
                                : i
                        ),
                    });
                } else {
                    set({ cart: [...cart, { ...item, quantity: 1 }] });
                }
            },

            updateQuantity: (id, delta) => {
                const { cart } = get();
                set({
                    cart: cart.map((item) => {
                        if (item.id === id) {
                            const newQty = item.quantity + delta;
                            return newQty > 0 && newQty <= (item.maxStock > 0 ? item.maxStock : Infinity)
                                ? { ...item, quantity: newQty }
                                : item;
                        }
                        return item;
                    }),
                });
            },

            removeItem: (id) => {
                const { cart } = get();
                set({ cart: cart.filter((item) => item.id !== id) });
            },

            clearCart: () => set({ cart: [], customerId: null, paymentMethod: "Cash", isRefundMode: false }),

            setCustomer: (id) => set({ customerId: id }),

            setPaymentMethod: (method) => set({ paymentMethod: method }),
            
            setRefundMode: (mode) => set({ isRefundMode: mode }),

            checkout: async (paidAmount: number) => {
                const { cart, customerId, paymentMethod, isRefundMode, clearCart } = get();
                if (cart.length === 0) return;

                set({ loading: true, error: null });
                try {
                    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
                    
                    const payload: POSSaleRequest = {
                        customer_id: customerId || undefined,
                        payment_method: paymentMethod,
                        total_amount: Math.abs(totalAmount),
                        paid_amount: Math.abs(paidAmount),
                        products: cart.map(item => ({
                            product_id: item.productId,
                            variation_id: item.variationId,
                            quantity: item.quantity,
                            price: item.price
                        }))
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
        }),
        {
            name: "pos-store",
        }
    )
);
