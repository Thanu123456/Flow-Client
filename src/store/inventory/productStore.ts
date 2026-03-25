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
        (set, get) => ({
            products: [],
            loading: false,
            error: null,
            pagination: {
                total: 0,
                page: 1,
                limit: 50,
                totalPages: 0,
            },

            getProducts: async (params) => {
                // Only show the full-page loading spinner on the very first fetch
                // (when there are no products yet). Subsequent fetches keep the
                // existing list visible so the UI never goes blank during refreshes.
                const hasExisting = get().products.length > 0;
                set({ loading: !hasExisting, error: null });

                // Inner function so we can retry without re-triggering the loading flag.
                // On first load (empty products): keeps spinner alive and retries up to
                // `attemptsLeft` more times after the axios interceptor exhausts its own
                // 4 retries — prevents the "blank on first load, need one manual refresh"
                // symptom caused by serverless DB cold-starts.
                const tryFetch = async (attemptsLeft: number): Promise<void> => {
                    try {
                        const response = await productService.getProducts(params);
                        const data = response.data ?? [];
                        const total = response.total ?? data.length;
                        const limit = response.limit ?? params.limit ?? 50;
                        const page = response.page ?? params.page ?? 1;
                        const totalPages = response.totalPages ?? Math.ceil(total / limit);

                        if (params.limit === 1) {
                            // Counter-only call — update total without touching the list
                            set(state => ({
                                pagination: { ...state.pagination, total },
                                loading: false,
                            }));
                        } else {
                            // Always update when a filter is active (category, search, brand, etc.)
                            // so that selecting a category correctly replaces the product list.
                            // For unfiltered calls, keep the existing list if the response is empty
                            // (guards against stale/duplicate calls wiping a loaded list).
                            const isFiltered = !!(params.categoryId || params.search || params.brandId || params.subcategoryId);
                            const currentProducts = get().products;
                            const shouldUpdate = isFiltered || data.length > 0 || currentProducts.length === 0;
                            if (shouldUpdate) {
                                set({
                                    products: data,
                                    pagination: { total, page, limit, totalPages },
                                    loading: false,
                                });
                            } else {
                                set({ loading: false });
                            }
                        }
                    } catch (err: any) {
                        if (!hasExisting && attemptsLeft > 0) {
                            // Keep the spinner visible; pause then try again
                            await new Promise(r => setTimeout(r, 3000));
                            return tryFetch(attemptsLeft - 1);
                        }
                        // Final failure — preserve existing products, surface the error
                        set(state => ({
                            ...state,
                            error: err.response?.data?.message || "Failed to fetch products",
                            loading: false,
                        }));
                        throw err;
                    }
                };

                return tryFetch(2);
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
