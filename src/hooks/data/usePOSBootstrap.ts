import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { lookupsService } from '../../services/lookupsService';
import { useCategoryStore } from '../../store/management/categoryStore';
import { useCustomerStore } from '../../store/management/customerStore';
import { getCachedCategories } from '../../utils/offline/catalogCache';

export const POS_BOOTSTRAP_QUERY_KEY = ['pos', 'bootstrap'] as const;

/**
 * usePOSBootstrap — loads the category filter list and customer picker list for
 * the POS screen in ONE request (was two: getAllCategories + getAllCustomers).
 *
 * Hydrates the existing category / customer stores so the rest of POS.tsx keeps
 * reading `allCategories` / `allCustomers` unchanged. React Query caches the
 * result (staleTime 5 min) — re-entering POS within that window is a no-op.
 *
 * On a genuine network failure, categories fall back to the local catalog
 * cache (see utils/offline/catalogCache.ts) so the category filter still
 * works offline. The customer picker does NOT have an offline fallback —
 * a walk-in cash sale doesn't need one, and caching customer records (names,
 * phone numbers, credit balances) offline is a real decision, not a default
 * to make silently; skipped here deliberately rather than half-built.
 */
export function usePOSBootstrap() {
  const query = useQuery({
    queryKey: POS_BOOTSTRAP_QUERY_KEY,
    queryFn: async () => {
      try {
        return await lookupsService.getPOSBootstrap();
      } catch (err: any) {
        if (err?.response) throw err;
        return { categories: (await getCachedCategories()) ?? [], customers: [] };
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!query.data) return;
    useCategoryStore.setState({ allCategories: query.data.categories, allCategoriesLoading: false });
    useCustomerStore.setState({ allCustomers: query.data.customers });
  }, [query.data]);

  return query;
}
