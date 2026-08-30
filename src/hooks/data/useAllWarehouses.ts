import { useQuery } from '@tanstack/react-query';
import { warehouseService } from '../../services/management/warehouseService';
import type { Warehouse } from '../../types/entities/warehouse.types';

/**
 * useAllWarehouses — the full warehouse list for dropdowns (GET /admin/warehouses/all),
 * React Query-cached for 5 min so moving between the purchase list / add-purchase
 * screens does not re-fetch it every time.
 */
export function useAllWarehouses() {
  const query = useQuery({
    queryKey: ['warehouses', 'all'],
    queryFn: () => warehouseService.getAllWarehouses(),
    staleTime: 5 * 60 * 1000,
  });
  return {
    warehouses: (query.data ?? []) as Warehouse[],
    isLoading: query.isLoading,
  };
}
