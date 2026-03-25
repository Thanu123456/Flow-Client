import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { unitService } from "../../services/management/unitService";
import type { Unit, UnitFormData, UnitPaginationParams } from "../../types/entities/unit.types";

interface UnitState {
  // Paginated table data
  units: Unit[];
  // Full list for dropdowns — separate so table data is never overwritten
  allUnits: Unit[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  getUnits: (params: UnitPaginationParams) => Promise<void>;
  getAllUnits: () => Promise<Unit[]>;
  getUnitById: (id: string) => Promise<Unit | null>;
  createUnit: (unitData: UnitFormData) => Promise<void>;
  updateUnit: (id: string, unitData: Partial<UnitFormData>) => Promise<void>;
  deleteUnit: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useUnitStore = create<UnitState>()(
  devtools(
    (set, get) => ({
      units: [],
      allUnits: [],
      loading: false,
      error: null,
      pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },

      getUnits: async (params) => {
        set({ loading: true, error: null });
        try {
          const response = await unitService.getUnits(params);
          const data = response.data ?? [];
          const total = response.total ?? data.length;
          
          if (params.limit === 1) {
            set(state => ({
              pagination: { ...state.pagination, total },
              loading: false
            }));
          } else {
            set({
              units: data,
              pagination: {
                total: total,
                page: response.page || params.page || 1,
                limit: response.limit || params.limit || 10,
                totalPages: response.totalPages || Math.ceil(total / (response.limit || 10)),
              },
              loading: false,
            });
          }
        } catch (error: any) {
          set({
            error: error.response?.data?.message || error.message || "Failed to fetch units",
            loading: false,
          });
        }
      },

      getUnitById: async (id) => {
        try {
          return await unitService.getUnitById(id);
        } catch (error: any) {
          set({ error: error.response?.data?.message || error.message || "Failed to fetch unit" });
          return null;
        }
      },

      getAllUnits: async () => {
        const cached = get().allUnits;
        const tryFetch = async (attemptsLeft: number): Promise<Unit[]> => {
          try {
            const units = await unitService.getAllUnits();
            set({ allUnits: units });
            return units;
          } catch (err: any) {
            if (cached.length === 0 && attemptsLeft > 0) {
              await new Promise(r => setTimeout(r, 3000));
              return tryFetch(attemptsLeft - 1);
            }
            if (cached.length > 0) return cached;
            set({ error: err.response?.data?.message || err.message || "Failed to fetch units" });
            return [];
          }
        };
        return tryFetch(2);
      },

      createUnit: async (unitData) => {
        set({ loading: true, error: null });
        try {
          await unitService.createUnit(unitData);
          set({ loading: false });
        } catch (error: any) {
          set({ error: error.response?.data?.message || error.message || "Failed to create unit", loading: false });
          throw error;
        }
      },

      updateUnit: async (id, unitData) => {
        set({ loading: true, error: null });
        try {
          await unitService.updateUnit(id, unitData);
          set({ loading: false });
        } catch (error: any) {
          set({ error: error.response?.data?.message || error.message || "Failed to update unit", loading: false });
          throw error;
        }
      },

      deleteUnit: async (id) => {
        set({ loading: true, error: null });
        try {
          await unitService.deleteUnit(id);
          set({ loading: false });
        } catch (error: any) {
          set({ error: error.response?.data?.message || error.message || "Failed to delete unit", loading: false });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    { name: "unit-store" }
  )
);