import { create } from 'zustand';
import api from '../../utils/api';

export interface DashboardSummaryCard {
    title: string;
    amount: number;
    trend: string;
    isPositive: boolean;
}

export interface DashboardData {
    summary: {
        sales: DashboardSummaryCard;
        purchases: DashboardSummaryCard;
        salesReturn: DashboardSummaryCard;
        purchasesReturn: DashboardSummaryCard;
        expenses: DashboardSummaryCard;
        profit: DashboardSummaryCard;
    };
    secondarySummary: {
        stockValue: number;
        codReturns: number;
        codPending: number;
        codDelivered: number;
        estimatedProfit: number;
        creditCollected: number;
        creditOutstanding: number;
    };
}

export interface ChartPoint {
    label: string;
    value: number;
}

export interface MultiChartPoint {
    label: string;
    values: Record<string, number>;
}

export interface ProductSalesItem {
    no: number;
    productName: string;
    quantity: number;
    revenue: number;
}

export interface RecentSaleItem {
    id: string;
    referenceNo: string;
    customer: string;
    userName: string;
    itemCount: number;
    paymentMethod: string;
    totalPrice: number;
    saleDate: string;
}

export interface InventoryTurnoverItem {
    item: string;
    days: number;
}

export interface StockAlertItem {
    id: string;
    productID: string;
    productName: string;
    brandName: string;
    variationType: string;
    unit: string;
    stock: number;
}

export interface CreditCustomerItem {
    id: string;
    name: string;
    phone: string;
    balance: number;
    status: string;
}

export interface ExpireAlertItem {
    id: string;
    productID: string;
    productName: string;
    variationType: string;
    purchaseDate: string;
    expiryDate: string;
}

export interface DashboardCharts {
    salesPurchases: MultiChartPoint[];
    profitMargin: ChartPoint[];
    topProducts: ChartPoint[];
    revenueByCategory: ChartPoint[];
    paymentMethod: ChartPoint[];
    hourlySales: ChartPoint[];
    topCustomers: ChartPoint[];
    creditCollected: number;
    creditOutstanding: number;
    mostSellingItems: ProductSalesItem[];
    leastSellingItems: ProductSalesItem[];
    recentSales: RecentSaleItem[];
    inventoryTurnover: InventoryTurnoverItem[];
    topExpenses: ChartPoint[];
    stockAlerts: StockAlertItem[];
    creditCustomers: CreditCustomerItem[];
    expireAlerts: ExpireAlertItem[];
}

interface DashboardState {
    data: DashboardData | null;
    charts: DashboardCharts | null;
    loading: boolean;
    chartsLoading: boolean;
    error: string | null;
    fetchDashboardData: (period?: string) => Promise<void>;
    fetchDashboardCharts: (period?: string) => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
    data: null,
    charts: null,
    loading: false,
    chartsLoading: false,
    error: null,
    fetchDashboardData: async (period = 'today') => {
        set({ loading: true, error: null });
        try {
            const response = await api.get(`/admin/dashboard?period=${period}`);
            if (response.data && response.data.data) {
                set({ data: response.data.data, loading: false });
            } else {
                set({ error: 'Invalid response from server', loading: false });
            }
        } catch (error: any) {
            set({ error: error.message || 'Failed to fetch dashboard data', loading: false });
        }
    },
    fetchDashboardCharts: async (period = 'today') => {
        set({ chartsLoading: true, error: null });
        try {
            const response = await api.get(`/admin/dashboard/charts?period=${period}`);
            if (response.data && response.data.data) {
                set({ charts: response.data.data, chartsLoading: false });
            } else {
                set({ error: 'Invalid response from server for charts', chartsLoading: false });
            }
        } catch (error: any) {
            set({ error: error.message || 'Failed to fetch dashboard charts', chartsLoading: false });
        }
    },
}));
