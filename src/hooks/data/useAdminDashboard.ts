import { useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import api from '../../utils/api';
import { useDashboardStore } from '../../store/reports/dashboardStore';
import type { DashboardData, DashboardCharts } from '../../store/reports/dashboardStore';

interface DashboardBundle {
  data: DashboardData | null;
  charts: DashboardCharts | null;
}

async function fetchDashboardBundle(period: string): Promise<DashboardBundle> {
  const [dataRes, chartsRes] = await Promise.all([
    api.get(`/admin/dashboard?period=${period}`),
    api.get(`/admin/dashboard/charts?period=${period}`),
  ]);
  return {
    data: dataRes.data?.data ?? null,
    charts: chartsRes.data?.data ?? null,
  };
}

/**
 * useAdminDashboard — the analytics + charts payload for the admin dashboard,
 * keyed by period. React Query caches each period (staleTime 2 min), so toggling
 * TODAY / WEEK / MONTH / YEAR back to one you already viewed is instant and
 * issues no request. `keepPreviousData` keeps the current dashboard on screen
 * while the next period loads.
 *
 * Results are mirrored into the existing zustand dashboard store so the ~20
 * chart/table components that read `useDashboardStore()` need no changes.
 */
export function useAdminDashboard(period: string) {
  const query = useQuery({
    queryKey: ['admin', 'dashboard', period],
    queryFn: () => fetchDashboardBundle(period),
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  const { data, isPending, isError } = query;

  // Mirror query state into the zustand dashboard store so the ~20 chart/table
  // components that read `useDashboardStore()` keep working unchanged.
  //
  // Drive their skeletons off `isPending` (true only on the very first load with
  // no data yet). On a period switch `keepPreviousData` holds the old payload, so
  // components keep showing it while the new one loads instead of flashing
  // skeletons; the page-level <Spin> (fed by isFetching) covers that case.
  useEffect(() => {
    useDashboardStore.setState({
      loading: isPending,
      chartsLoading: isPending,
    });
  }, [isPending]);

  useEffect(() => {
    if (!data) return;
    useDashboardStore.setState({
      data: data.data,
      charts: data.charts,
      error: null,
    });
  }, [data]);

  useEffect(() => {
    if (isError) {
      useDashboardStore.setState({ error: 'Failed to load dashboard data' });
    }
  }, [isError]);

  return query;
}
