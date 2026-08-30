import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { lookupsService } from '../../services/lookupsService';
import { useCategoryStore } from '../../store/management/categoryStore';
import { useCustomerStore } from '../../store/management/customerStore';

export const POS_BOOTSTRAP_QUERY_KEY = ['pos', 'bootstrap'] as const;

/**
 * usePOSBootstrap — loads the category filter list and customer picker list for
 * the POS screen in ONE request (was two: getAllCategories + getAllCustomers).
 *
 * Hydrates the existing category / customer stores so the rest of POS.tsx keeps
 * reading `allCategories` / `allCustomers` unchanged. React Query caches the
 * result (staleTime 5 min) — re-entering POS within that window is a no-op.
 */
export function usePOSBootstrap() {
  const query = useQuery({
    queryKey: POS_BOOTSTRAP_QUERY_KEY,
    queryFn: lookupsService.getPOSBootstrap,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!query.data) return;
    useCategoryStore.setState({ allCategories: query.data.categories, allCategoriesLoading: false });
    useCustomerStore.setState({ allCustomers: query.data.customers });
  }, [query.data]);

  return query;
}
