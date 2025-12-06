import { axiosInstance } from "../api/axiosInstance";
import type {
    Unit,
    UnitFormData,
    UnitPaginationParams,
    UnitResponse,
} from "../../types/entities/unit.types";

export const unitService = {
    // Get All Units
    getUnits: async (params: UnitPaginationParams): Promise<UnitResponse> => {
        const response = await axiosInstance.get("/units", { params });

        // Assuming the backend returns an object with a `data` array and a `total` count
        const { data, total = response.data.length } = response.data;

        return {
            data,
            total,
            page: params.page,
            limit: params.limit,
            totalPages: Math.ceil(total / params.limit),
        };
    },

    // Get a specific Unit by ID
    getUnitById: async (id: string): Promise<Unit> => {
        const response = await axiosInstance.get(`/units/${id}`);
        return response.data;
    },

    // Create a New Unit
    createUnit: async (unitData: UnitFormData): Promise<Unit> => {
        const response = await axiosInstance.post("/units", unitData, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        return response.data;
    },

    // Update an existing Unit
    updateUnit: async (
        id: string,
        unitData: Partial<UnitFormData>
    ): Promise<Unit> => {
        const response = await axiosInstance.put(`/units/${id}`, unitData, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        return response.data;
    },

    // Delete a Unit
    deleteUnit: async (id: string): Promise<void> => {
        await axiosInstance.delete(`/units/${id}`);
    },

    // Export units to PDF
    exportToPDF: async (params: UnitPaginationParams): Promise<Blob> => {
        const response = await axiosInstance.get("/units/export/pdf", {
            params,
            responseType: "arraybuffer",
        });
        return new Blob([response.data], { type: "application/pdf" });
    },

    // Export units to Excel
    exportToExcel: async (params: UnitPaginationParams): Promise<Blob> => {
        const response = await axiosInstance.get("/units/export/excel", {
            params,
            responseType: "arraybuffer",
        });
        return new Blob([response.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
    },
};