import { axiosInstance } from "../api/axiosInstance";
import type {
    CreateProductRequest,
    Product,
    ProductPaginationParams,
    ProductResponse,
} from "../../types/entities/product.types";

// Helper to transform backend product response to frontend Product type
const transformProduct = (p: any): Product => ({
    id: p.id,
    name: p.name,
    description: p.description,
    sku: p.sku || p.SKU,
    barcode: p.barcode || p.Barcode || p.barCode,
    productType: p.product_type || p.productType,
    categoryId: p.category_id,
    categoryName: p.category_name,
    subcategoryId: p.subcategory_id,
    subcategoryName: p.subcategory_name,
    brandId: p.brand_id,
    brandName: p.brand_name,
    unitId: p.unit_id,
    unitName: p.unit_name,
    unitShortName: p.unit_short_name,
    warehouseId: p.warehouse_id,
    warehouseName: p.warehouse_name,
    warrantyId: p.warranty_id,
    warrantyName: p.warranty_name,

    costPrice: p.cost_price,
    wholesalePrice: p.wholesale_price,
    // List API returns 'price' which is typically retail/our price. Use it as fallback.
    retailPrice: p.retail_price ?? p.price,
    ourPrice: p.our_price ?? p.price,

    discountType: p.discount_type,
    discountValue: p.discount_value,
    discountAppliesTo: p.discount_applies_to,

    quantityAlert: p.quantity_alert,
    currentStock: p.current_stock,

    imageUrl: p.image_url,

    status: p.is_active ? "active" : "inactive",
    createdAt: p.created_at,
    updatedAt: p.updated_at,

    variations: p.variations?.map((v: any) => ({
        id: v.id,
        variationId: v.variation_id || v.variationId || v.id, // Fallback for list view
        variationName: v.variation_name || v.variationName || "Variation",
        options: v.options?.map((o: any) => ({
            id: o.id,
            value: o.value,
        })) || [], // Default to empty array for list view variations
        sku: v.sku || v.SKU,
        barcode: v.barcode || v.Barcode || v.barCode,
        costPrice: v.cost_price ?? v.costPrice ?? 0,
        wholesalePrice: v.wholesale_price ?? v.wholesalePrice ?? 0,
        retailPrice: v.retail_price ?? v.retailPrice ?? 0,
        ourPrice: v.our_price ?? v.ourPrice ?? 0,
        discountType: v.discount_type || v.discountType,
        discountValue: v.discount_value ?? v.discountValue ?? 0,
        discountAppliesTo: v.discount_applies_to || v.discountAppliesTo,
        quantityAlert: v.quantity_alert || v.quantityAlert || 0,
        currentStock: v.current_stock ?? v.currentStock ?? 0,
        imageUrl: v.image_url || v.imageUrl,
        status: v.is_active ? "active" : "inactive",
    })),
    variationCount: p.variation_count || p.variations?.length || 0,
});

export const productService = {
    getProducts: async (params: ProductPaginationParams): Promise<ProductResponse> => {
        const backendParams: any = {
            page: params.page,
            per_page: params.limit,
            search: params.search || undefined,
            category_id: params.categoryId || undefined,
            subcategory_id: params.subcategoryId || undefined,
            brand_id: params.brandId || undefined,
            product_type: params.productType || undefined,
            include_inactive: params.status === 'inactive' ? true : undefined,
            is_active: params.status === 'active' ? true : params.status === 'inactive' ? false : undefined,
        };

        const response = await axiosInstance.get('/admin/products', { params: backendParams });
        const rd = response.data;
        const raw = rd.data ?? rd.products ?? [];
        const products: Product[] = Array.isArray(raw) ? raw.map(transformProduct) : [];

        return {
            data:       products,
            total:      rd.total       ?? rd.meta?.total       ?? products.length,
            page:       rd.page        ?? rd.meta?.page        ?? params.page,
            limit:      rd.per_page    ?? rd.meta?.per_page    ?? params.limit,
            totalPages: rd.total_pages ?? rd.meta?.total_pages ?? Math.ceil((rd.meta?.total ?? products.length) / params.limit),
        };
    },

    // Get product by ID
    getProductById: async (id: string): Promise<Product> => {
        const response = await axiosInstance.get(`/admin/products/${id}`);
        const productData = response.data.product || response.data.data || response.data;
        return transformProduct(productData);
    },

    // Create product
    createProduct: async (data: CreateProductRequest): Promise<Product> => {
        const response = await axiosInstance.post("/admin/products", data);
        const createdProduct = response.data.data || response.data;
        // The create response might match the get response structure, if not, we might need to fetch it or rely on what's returned
        return transformProduct(createdProduct);
    },

    // Update product (simplified signature for now)
    updateProduct: async (id: string, data: any): Promise<Product> => {
        const response = await axiosInstance.put(`/admin/products/${id}`, data);
        const updatedProduct = response.data.data || response.data;
        return transformProduct(updatedProduct);
    },

    // Delete product
    deleteProduct: async (id: string): Promise<void> => {
        await axiosInstance.delete(`/admin/products/${id}`);
    },

    // Check SKU availability (Generate SKU)
    generateSKU: async (): Promise<string> => {
        const response = await axiosInstance.get("/admin/products/generate-sku");
        return response.data.sku || response.data.data?.sku;
    },

    // ExportPDF, ExportExcel, Import can be added later
};
