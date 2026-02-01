export type ProductType = "single" | "variable";
export type DiscountType = "fixed" | "percentage";
export type DiscountAppliesTo = "wholesale" | "retail" | "our_price";
export type ProductStatus = "active" | "inactive";

export interface CreateProductRequest {
    name: string;
    description?: string;
    category_id: string;
    subcategory_id: string;
    brand_id?: string;
    unit_id: string;
    warehouse_id?: string;
    warranty_id?: string;
    product_type: ProductType;
    single_product?: SingleProductRequest;
    variable_product?: VariableProductRequest;
}

export interface SingleProductRequest {
    sku?: string;
    barcode?: string;
    cost_price: number;
    wholesale_price?: number;
    retail_price?: number;
    our_price?: number;
    discount_type?: DiscountType;
    discount_value?: number;
    discount_applies_to?: DiscountAppliesTo[];
    quantity_alert?: number;
    image_url?: string;
}

export interface VariableProductRequest {
    variation_id: string;
    variations: ProductVariationItemRequest[];
}

export interface ProductVariationItemRequest {
    variation_option_ids: string[];
    sku?: string;
    barcode?: string;
    cost_price: number;
    wholesale_price?: number;
    retail_price?: number;
    our_price?: number;
    discount_type?: DiscountType;
    discount_value?: number;
    discount_applies_to?: DiscountAppliesTo[];
    quantity_alert?: number;
    image_url?: string;
}

export interface Product {
    id: string;
    name: string;
    description?: string;
    sku?: string;
    barcode?: string;
    productType: ProductType;
    categoryId: string;
    categoryName: string;
    subcategoryId: string;
    subcategoryName: string;
    brandId?: string;
    brandName?: string;
    unitId: string;
    unitName: string;
    unitShortName: string;
    warehouseId?: string;
    warehouseName?: string;
    warrantyId?: string;
    warrantyName?: string;

    // Pricing (Single)
    costPrice?: number;
    wholesalePrice?: number;
    retailPrice?: number;
    ourPrice?: number;

    // Discount
    discountType?: DiscountType;
    discountValue?: number;
    discountAppliesTo?: DiscountAppliesTo[];

    // Stock
    quantityAlert?: number;
    currentStock: number;

    imageUrl?: string;

    status: ProductStatus;
    createdAt: string;
    updatedAt: string;

    variations?: ProductVariation[];
    variationCount?: number;
}

export interface ProductVariation {
    id: string;
    variationId: string;
    variationName: string;
    options: VariationOption[];
    sku?: string;
    barcode?: string;
    costPrice: number;
    wholesalePrice?: number;
    retailPrice?: number;
    ourPrice?: number;
    discountType?: DiscountType;
    discountValue?: number;
    discountAppliesTo?: DiscountAppliesTo[];
    quantityAlert?: number;
    currentStock: number;
    imageUrl?: string;
    status: ProductStatus;
}

export interface VariationOption {
    id: string;
    value: string;
}

export interface ProductPaginationParams {
    page: number;
    limit: number;
    search?: string;
    status?: ProductStatus;
    categoryId?: string;
    subcategoryId?: string;
    brandId?: string;
    productType?: ProductType;
}

export interface ProductResponse {
    data: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
