import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { productService } from "../../services/inventory/productService";
import type {
    CreateProductRequest,
    Product,
    ProductPaginationParams,
} from "../../types/entities/product.types";

interface ProductState {
    products: Product[];
    loading: boolean;
    error: string | null;
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };

    getProducts: (params: ProductPaginationParams) => Promise<void>;
    getProductById: (id: string) => Promise<Product>;
    createProduct: (data: CreateProductRequest) => Promise<void>;
    updateProduct: (id: string, data: any) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
    clearError: () => void;
}

export const useProductStore = create<ProductState>()(
    devtools(
        (set) => ({
            products: [],
            loading: false,
            error: null,
            pagination: {
                total: 0,
                page: 1,
                limit: 10,
                totalPages: 0,
            },

            getProducts: async (params) => {
                set({ loading: true, error: null });
                try {
                    const response = await productService.getProducts(params);
                    const data = response.data ?? [];
                    const total = response.total ?? data.length;
                    const limit = response.limit ?? params.limit ?? 10;
                    const page = response.page ?? params.page ?? 1;
                    const totalPages = response.totalPages ?? Math.ceil(total / limit);
                    
                    // Update pagination total regardless of limit (good for counters)
                    // But only update the products list if we're doing a real fetch
                    if (params.limit === 1) {
                        set(state => ({
                            pagination: {
                                ...state.pagination,
                                total,
                            },
                            loading: false,
                        }));
                    } else {
                        set({
                            products: data,
                            pagination: {
                                total,
                                page,
                                limit,
                                totalPages,
                            },
                            loading: false,
                        });
                    }
                    return response;
                } catch (error: any) {
                    set({
                        error: error.response?.data?.message || "Failed to fetch products",
                        loading: false,
                    });
                    throw error;
                }
            },

            getProductById: async (id) => {
                set({ loading: true, error: null });
                try {
                    const product = await productService.getProductById(id);
                    set({ loading: false });
                    return product;
                } catch (error: any) {
                    set({
                        error: error.response?.data?.message || "Failed to fetch product",
                        loading: false,
                    });
                    throw error;
                }
            },

            createProduct: async (data) => {
                set({ loading: true, error: null });
                try {
                    await productService.createProduct(data);
                    set({ loading: false });
                } catch (error: any) {
                    set({
                        error: error.response?.data?.message || "Failed to create product",
                        loading: false,
                    });
                    throw error;
                }
            },

            updateProduct: async (id, data) => {
                set({ loading: true, error: null });
                try {
                    await productService.updateProduct(id, data);
                    set({ loading: false });
                } catch (error: any) {
                    set({
                        error: error.response?.data?.message || "Failed to update product",
                        loading: false,
                    });
                    throw error;
                }
            },

            deleteProduct: async (id) => {
                set({ loading: true, error: null });
                try {
                    await productService.deleteProduct(id);
                    set({ loading: false });
                } catch (error: any) {
                    set({
                        error: error.response?.data?.message || "Failed to delete product",
                        loading: false,
                    });
                    throw error;
                }
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: "product-store",
        }
    )
);
