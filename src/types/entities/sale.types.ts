export interface SaleProductItem {
  productId: string;
  productType: string;
  productName: string;
  availableStock: number;
}

export interface SaleProductsResponse {
  data: SaleProductItem[];
}
