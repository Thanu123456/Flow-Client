// src/store/management/unitStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { unitService } from "../../services/management/unitService";
import type { Unit, UnitFormData, UnitPaginationParams } from "../../types/entities/unit.types";

interface UnitState {
    units: Unit[];
    loading: boolean;
    error: string | null;
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };

    // Actions
    getUnits: (params: UnitPaginationParams) => Promise<void>;
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
            loading: false,
            error: null,
            pagination: {
                total: 0,
                page: 1,
                limit: 10,
                totalPages: 0,
            },

            getUnits: async (params) => {
                set({ loading: true, error: null });
                try {
                    const response = await unitService.getUnits(params);
                    set({
                        units: response.data,
                        pagination: {
                            total: response.total,
                            page: response.page,
                            limit: response.limit,
                            totalPages: response.totalPages,
                        },
                        loading: false,
                    });
                } catch (error: any) {
                    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch units";
                    set({
                        error: errorMessage,
                        loading: false,
                    });
                }
            },

            getUnitById: async (id) => {
                try {
                    const unit = await unitService.getUnitById(id);
                    return unit;
                } catch (error: any) {
                    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch unit";
                    set({ error: errorMessage });
                    return null;
                }
            },

            createUnit: async (unitData) => {
                set({ loading: true, error: null });
                try {
                    await unitService.createUnit(unitData);
                    set({ loading: false });
                } catch (error: any) {
                    const errorMessage = error.response?.data?.message || error.message || "Failed to create unit";
                    set({
                        error: errorMessage,
                        loading: false,
                    });
                    throw error; // Re-throw to be caught by the modal's form
                }
            },

            updateUnit: async (id, unitData) => {
                set({ loading: true, error: null });
                try {
                    await unitService.updateUnit(id, unitData);
                    set({ loading: false });
                } catch (error: any) {
                    const errorMessage = error.response?.data?.message || error.message || "Failed to update unit";
                    set({
                        error: errorMessage,
                        loading: false,
                    });
                    throw error; // Re-throw to be caught by the modal's form
                }
            },

            deleteUnit: async (id) => {
                set({ loading: true, error: null });
                try {
                    await unitService.deleteUnit(id);
                    set({ loading: false });
                } catch (error: any) {
                    const errorMessage = error.response?.data?.message || error.message || "Failed to delete unit";
                    set({
                        error: errorMessage,
                        loading: false,
                    });
                    throw error; // Re-throw to be caught by the modal
                }
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: "unit-store",
        }
    )
);