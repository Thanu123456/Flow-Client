export interface VariationValue {
  id: string;
  value: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Variation {
  id: string;
  name: string;
  values: VariationValue[];
  valuesCount?: number;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface VariationFormData {
  name: string;
  values: string[]; // Array of value strings
  status: "active" | "inactive";
}

export interface VariationPaginationParams {
  page: number;
  limit: number;
  search?: string;
  status?: boolean;
}

export interface VariationResponse {
  data: Variation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
