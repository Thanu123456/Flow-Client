import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { productService } from '../../services/inventory/productService';
import type { Product } from '../../types/entities/product.types';

const POS_PRODUCT_LIMIT = 1000;

/**
 * usePOSProducts — the active product grid for the POS screen, keyed by the
 * selected category. React Query caches each category's list (staleTime 60 s),
 * so flipping between categories you have already viewed is instant and issues
 * no request. `keepPreviousData` keeps the current grid on screen while the next
 * category loads instead of flashing empty.
 */
export function usePOSProducts(selectedCategory: string) {
  const categoryId = selectedCategory === 'All Categories' ? undefined : selectedCategory;

  const query = useQuery({
    queryKey: ['pos', 'products', categoryId ?? 'all'],
    queryFn: async (): Promise<Product[]> => {
      const res = await productService.getProducts({
        page: 1,
        limit: POS_PRODUCT_LIMIT,
        categoryId,
        status: 'active',
      });
      return res.data ?? [];
    },
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });

  return {
    products: query.data ?? [],
    productsLoading: query.isLoading,
    refetchProducts: query.refetch,
  };
}
