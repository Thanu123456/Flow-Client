import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { productService } from '../../services/inventory/productService';
import { getCachedProducts } from '../../utils/offline/catalogCache';
import type { Product } from '../../types/entities/product.types';

const POS_PRODUCT_LIMIT = 1000;

interface CategoryProducts {
  items: Product[];
  // True when this came from the local catalog cache because the network
  // request genuinely failed (offline/timeout) — not set for an empty
  // category or a server-side business error, only a real connectivity miss.
  fromCache: boolean;
}

/**
 * usePOSProducts — the active product grid for the POS screen, keyed by the
 * selected category. React Query caches each category's list (staleTime 60 s),
 * so flipping between categories you have already viewed is instant and issues
 * no request. `keepPreviousData` keeps the current grid on screen while the next
 * category loads instead of flashing empty.
 *
 * On a genuine network failure it falls back to the local catalog cache
 * (see utils/offline/catalogCache.ts, kept warm by useOfflineCatalogSync) so
 * a dropped connection degrades to "possibly stale prices/stock" rather than
 * "cashier can't find anything to sell" — offline resilience covering the
 * shopping itself, not just submitting a cart that was already built.
 */
export function usePOSProducts(selectedCategory: string) {
  const categoryId = selectedCategory === 'All Categories' ? undefined : selectedCategory;

  const query = useQuery({
    queryKey: ['pos', 'products', categoryId ?? 'all'],
    queryFn: async (): Promise<CategoryProducts> => {
      try {
        const res = await productService.getProducts({
          page: 1,
          limit: POS_PRODUCT_LIMIT,
          categoryId,
          status: 'active',
        });
        return { items: res.data ?? [], fromCache: false };
      } catch (err: any) {
        // No `response` means the request never reached the server — a real
        // network miss, worth falling back for. A server-returned error
        // (validation, 5xx, etc.) is a different problem the cache can't fix,
        // so it's left to propagate and surface normally.
        if (err?.response) throw err;
        return { items: await getCachedProducts(categoryId), fromCache: true };
      }
    },
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });

  return {
    products: query.data?.items ?? [],
    productsLoading: query.isLoading,
    isOfflineCatalog: query.data?.fromCache ?? false,
    refetchProducts: query.refetch,
  };
}
