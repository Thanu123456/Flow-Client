export interface Warranty {
    id: string;
    name: string;
    description?: string;
    duration: number; // in months or days? DB likely has it. Assuming months.
    duration_unit: "days" | "months" | "years";
    status: "active" | "inactive";
    createdAt: string;
    updatedAt: string;
}

export interface WarrantyFormData {
    name: string;
    description?: string;
    duration: number;
    duration_unit: "days" | "months" | "years";
    status: "active" | "inactive";
}

export interface WarrantyPaginationParams {
    page: number;
    limit: number;
    search?: string;
    status?: "active" | "inactive";
}

export interface WarrantyResponse {
    data: Warranty[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
