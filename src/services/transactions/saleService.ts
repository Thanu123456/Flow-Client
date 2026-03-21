import { axiosInstance } from "../api/axiosInstance";
import type { SaleProductItem, SaleProductsResponse } from "../../types/entities/sale.types";

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
};
