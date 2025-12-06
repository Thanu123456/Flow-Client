export interface Unit {
    id: string;
    unitName: string;
    shortUnitName: string;
    status: "active" | "inactive";
    createdAt: string;
    productCount?: number;
}

export interface UnitFormData {
    unitName: string;
    shortUnitName: string;
    status: "active" | "inactive";
}

export interface UnitPaginationParams {
    page: number;
    limit: number;
    search?: string;
    status?: "active" | "inactive";
}

export interface UnitResponse {
    data: Unit[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}