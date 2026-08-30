import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { lookupsService, type LookupKey, type LookupsBundle } from '../../services/lookupsService';
import { useCategoryStore } from '../../store/management/categoryStore';
import { useSubcategoryStore } from '../../store/management/subCategoryStore';
import { useBrandStore } from '../../store/management/brandStore';
import { useUnitStore } from '../../store/management/unitStore';
import { useWarehouseStore } from '../../store/management/warehouseStore';
import { useWarrantyStore } from '../../store/management/warrantyStore';
import { useVariationStore } from '../../store/management/variationStore';

export const LOOKUPS_QUERY_KEY = ['lookups', 'bundle'] as const;

/**
 * useLookupsBundle — fetches every dropdown dataset a product form needs in ONE
 * request (GET /admin/lookups) and hydrates the existing zustand stores, so the
 * components that read `allCategories`, `allBrands`, … keep working unchanged.
 *
 * React Query caches the bundle (staleTime 5 min), so navigating back to a form
 * within that window issues no network call at all.
 */
export function useLookupsBundle(include?: LookupKey[]) {
  const query = useQuery({
    queryKey: include ? [...LOOKUPS_QUERY_KEY, include.join(',')] : LOOKUPS_QUERY_KEY,
    queryFn: () => lookupsService.getLookups(include),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const data: LookupsBundle | undefined = query.data;
    if (!data) return;

    useCategoryStore.setState({ allCategories: data.categories, allCategoriesLoading: false });
    useSubcategoryStore.setState({ allSubcategories: data.subcategories });
    useBrandStore.setState({ allBrands: data.brands });
    useUnitStore.setState({ allUnits: data.units });
    useWarehouseStore.setState({ allWarehouses: data.warehouses });
    useWarrantyStore.setState({ allWarranties: data.warranties });
    useVariationStore.setState({ variations: data.variations });
  }, [query.data]);

  return query;
}
