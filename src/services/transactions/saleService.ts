import { axiosInstance } from "../api/axiosInstance";
import type {
  SaleProductItem,
  SaleProductsResponse,
  SaleListItem,
  SaleDetailItem,
  SalesListFilter,
} from "../../types/entities/sale.types";

const transformSaleProduct = (p: any): SaleProductItem => ({
  productId: p.product_id,
  productType: p.product_type,
  productName: p.product_name,
  availableStock: p.available_stock ?? 0,
});

export const saleService = {
  getProducts: async (): Promise<SaleProductsResponse> => {
    const response = await axiosInstance.get("/admin/sales");
    const raw = response.data.data ?? [];
    return {
      data: Array.isArray(raw) ? raw.map(transformSaleProduct) : [],
    };
  },

  listSales: async (filter?: SalesListFilter): Promise<SaleListItem[]> => {
    const params = new URLSearchParams();
    if (filter?.search)         params.set("search",         filter.search);
    if (filter?.payment_method) params.set("payment_method", filter.payment_method);
    if (filter?.date_from)      params.set("date_from",      filter.date_from);
    if (filter?.date_to)        params.set("date_to",        filter.date_to);
    if (filter?.needs_review)   params.set("needs_review",   "true");

    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await axiosInstance.get(`/admin/sales${query}`);
    return response.data.data ?? [];
  },

  // Clears a flagged sale's review flag (sales.review).
  markReviewed: async (saleId: string): Promise<void> => {
    await axiosInstance.post(`/admin/sales/${saleId}/review`);
  },

  getSaleDetail: async (saleId: string): Promise<SaleDetailItem> => {
    const response = await axiosInstance.get(`/admin/sales/${saleId}`);
    return response.data.data;
  },
};
