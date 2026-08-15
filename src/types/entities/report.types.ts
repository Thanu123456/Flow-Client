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
