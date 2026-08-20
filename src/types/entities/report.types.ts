export interface SalesReportCompany {
  shop_name: string;
  phone?: string;
  email?: string;
  address?: string;
  logo_url?: string;
}

export interface SalesReportItem {
  id: string;
  invoice_number: string;
  customer_name: string;
  payment_method: string;
  quantity: number;
  unit_price: number;
  total: number;
  created_at: string;
}

export interface SalesReportSummary {
  gross_sales: number;
  total_discounts: number;
  delivery_charges: number;
  total_refunds: number;
  net_sales: number;
  invoice_count: number;
  average_ticket_value: number;
}

export interface PaymentBreakdown {
  cash_collected: number;
  card_transactions: number;
  qr_mobile_wallets: number;
  store_credit_on_account: number;
  other?: number;
  total_settlement_checksum: number;
}

export interface ProductPerformanceItem {
  product_id: string;
  sku?: string;
  product_name: string;
  quantity_sold: number;
  unit_cost: number;
  unit_retail: number;
  net_margin_pct: number;
  revenue: number;
}

export interface CategoryBreakdownItem {
  category_id: string;
  category_name: string;
  quantity_sold: number;
  revenue: number;
}

export interface HourlyDensityItem {
  hour: number;
  invoice_count: number;
  revenue: number;
}

export interface SalesReportResponse {
  company: SalesReportCompany;
  date_from?: string;
  date_to?: string;
  generated_at: string;
  items: SalesReportItem[];
  subtotal: number;
  total: number;
  total_transactions: number;

  summary: SalesReportSummary;
  payment_breakdown: PaymentBreakdown;
  product_performance: ProductPerformanceItem[];
  category_breakdown: CategoryBreakdownItem[];
  hourly_density: HourlyDensityItem[];
}

export interface SalesReportFilter {
  search?: string;
  payment_method?: string;
  date_from?: string;
  date_to?: string;
}

/** Shared period-filter query params sent to every new report endpoint. */
export interface PeriodFilterParams {
  preset?: string;
  year?: number;
  quarter?: number;
  date_from?: string;
  date_to?: string;
}

// ---------------------------------------------------------------------------
// Log History Report
// ---------------------------------------------------------------------------

export interface LogHistorySession {
  session_id: string;
  session_start_time: string;
  session_end_time?: string;
  username: string;
  cash_in_hand: number;
  cash_amount: number;
  card_amount: number;
  total_sale_amount: number;
  total_refund_amount: number;
  note?: string;
  status: string; // active | ended
}

export interface LogHistorySessionListResponse {
  sessions: LogHistorySession[];
  total: number;
}

export interface LogHistoryReceipt {
  session_id: string;
  username: string;
  session_start_time: string;
  session_end_time?: string;
  duration_seconds: number;
  cash_in_hand: number;
  cash_amount: number;
  card_amount: number;
  credit_sales: number;
  credit_payments: number;
  total_sale_amount: number;
  total_refund_amount: number;
  note?: string;
}

export interface LogHistoryKPIs {
  total_sessions: number;
  currently_live: number;
  top_performer_name?: string;
  top_performer_sales: number;
  total_revenue: number;
  total_refunds: number;
}

export interface CurrentlyLoggedInItem {
  username: string;
  login_time: string;
  duration_seconds: number;
  live_sales_so_far: number;
}

export interface LeaderboardItem {
  username: string;
  status: string; // Live | Offline
  last_login: string;
  session_count: number;
  total_sales: number;
  total_refunds: number;
}

export interface TopCashierItem {
  username: string;
  sales: number;
}

export interface CashCardSplit {
  cash: number;
  card: number;
}

export interface DailyTrendItem {
  date: string;
  sales: number;
  refunds: number;
}

export interface LogHistoryAnalyticsResponse {
  kpis: LogHistoryKPIs;
  currently_logged_in: CurrentlyLoggedInItem[];
  leaderboard: LeaderboardItem[];
  top_cashiers: TopCashierItem[];
  cash_card_split: CashCardSplit;
  daily_trend: DailyTrendItem[];
}

// ---------------------------------------------------------------------------
// Top Selling Product Report
// ---------------------------------------------------------------------------

export interface TopSellingProductItem {
  rank: number;
  product_id: string;
  product_name: string;
  category: string;
  sku?: string;
  revenue: number;
  qty_sold: number;
  peak_hour: number; // -1 = no sales in window
  peak_day?: string;
}

export interface TopSellingProductSummary {
  total_products: number;
  total_revenue: number;
  total_qty: number;
}

export interface TopSellingProductResponse {
  items: TopSellingProductItem[];
  summary: TopSellingProductSummary;
  generated_at: string;
  date_from?: string;
  date_to?: string;
}

export interface TopSellingFilter extends PeriodFilterParams {
  payment_method?: string;
  limit?: number;
  offset?: number;
}

// ---------------------------------------------------------------------------
// Purchases Report
// ---------------------------------------------------------------------------

export interface GRNListItem {
  id: string;
  grn_number: string;
  payment_method: string;
  total_amount: number;
  date: string;
}

export interface PurchaseKPIs {
  total_purchases: number;
  total_amount: number;
  total_discount: number;
  total_paid: number;
  outstanding: number;
}

export interface PaymentMethodBreakdownItem {
  method: string;
  amount: number;
  grn_count: number;
}

export interface TopSupplierItem {
  supplier_name: string;
  amount: number;
}

export interface TopItemItem {
  product_name: string;
  amount: number;
}

export interface PurchaseTrendItem {
  date: string;
  amount: number;
}

export interface PurchaseReportListResponse {
  items: GRNListItem[];
  running_total: number;
  generated_at: string;
}

export interface PurchaseReportAnalyticsResponse {
  kpis: PurchaseKPIs;
  payment_breakdown: PaymentMethodBreakdownItem[];
  top_suppliers: TopSupplierItem[];
  top_items: TopItemItem[];
  trend: PurchaseTrendItem[];
  generated_at: string;
}

// ---------------------------------------------------------------------------
// Profit & Loss Report
// ---------------------------------------------------------------------------

export interface ProfitLossKPIs {
  total_revenue: number;
  gross_profit: number;
  net_profit: number;
  bills_issued: number;
  items_sold: number;
  average_basket_value: number;
  operating_expenses: number;
  tax: number;
  payment_gateway_fees: number;
  tax_unimplemented: boolean;
  payment_gateway_fees_unimplemented: boolean;
}

export interface BillRow {
  bill_no: string;
  customer: string;
  cashier: string;
  qty_of_items: number;
  payment_method: string;
  total_price: number;
  sale_date: string;
  profit: number;
  is_return: boolean;
}

export interface RevenueTrendItem {
  date: string;
  revenue: number;
}

export interface ProfitTrendItem {
  date: string;
  profit: number;
}

export interface HourlyPeakItem {
  hour: number;
  revenue: number;
}

export interface TopProductItem {
  product_name: string;
  revenue: number;
  qty: number;
}

export interface PaymentBreakdownItem {
  method: string;
  revenue: number;
}

export interface ProfitLossResponse {
  kpis: ProfitLossKPIs;
  bills: BillRow[];
  revenue_trend: RevenueTrendItem[];
  profit_trend: ProfitTrendItem[];
  hourly_peak: HourlyPeakItem[];
  top_by_revenue: TopProductItem[];
  top_by_quantity: TopProductItem[];
  payment_breakdown: PaymentBreakdownItem[];
  estimated_profit_from_stock: number;
  generated_at: string;
}

// ---------------------------------------------------------------------------
// Stock Report
// ---------------------------------------------------------------------------

export interface StockListItem {
  product_id: string;
  product_name: string;
  category: string;
  brand: string;
  variation_type?: string;
  unit: string;
  stock: number;
  barcode?: string;
  sku?: string;
  cost_price: number;
  retail_price: number;
  wholesale_price: number;
  our_price: number;
  status: string; // In Stock | Low Stock | Out of Stock
}

export interface StockListResponse {
  items: StockListItem[];
  total: number;
}

export interface ProductStockDetail {
  product_name: string;
  category: string;
  brand: string;
  variation_type?: string;
  unit: string;
  stock: number;
}

export interface BatchExportItem {
  item_name: string;
  category: string;
  batch_id: string;
  expiry_date?: string;
  received_date?: string;
  on_hand_qty: number;
  unit_cost: number;
  total_cost: number;
  retail_price: number;
  status: string;
}

export interface StockKPIs {
  combined_stock_value: number;
  total_batch_rows: number;
  low_stock_items: number;
  out_of_stock_items: number;
}

export interface StockHealthSplit {
  in_stock: number;
  low_stock: number;
  out_of_stock: number;
}

export interface CategoryValueItem {
  category: string;
  value: number;
}

export interface ItemValueItem {
  item_name: string;
  value: number;
}

export interface StockTopSellingItem {
  product_name: string;
  revenue: number;
}

export interface StockAlertItem {
  item_name: string;
  category: string;
  on_hand: number;
  unit_cost: number;
  status: string;
}

export interface StockAnalyticsResponse {
  kpis: StockKPIs;
  health: StockHealthSplit;
  top_categories_by_value: CategoryValueItem[];
  top_items_by_value: ItemValueItem[];
  top_selling: StockTopSellingItem[];
  alerts: StockAlertItem[];
  generated_at: string;
}

export interface BatchExportFilter {
  date_filter_type?: 'none' | 'expiry' | 'received';
  date_from?: string;
  date_to?: string;
  stock_filter?: 'all' | 'exclude_zero' | 'only_zero';
  threshold?: number;
}
