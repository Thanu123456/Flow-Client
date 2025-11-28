import { axiosInstance } from "../api/axiosInstance";
import type {
  Brand,
  BrandFormData,
  BrandPaginationParams,
  BrandResponse,
} from "../../types/entities/brand.types";

export const brandService = {
  // Get All Brands
  getBrands: async (params: BrandPaginationParams): Promise<BrandResponse> => {
    const response = await axiosInstance.get("/brands", { params });

    const data: Brand[] = response.data.map((b: any) => ({
      ...b,
      imageUrl: getImageUrl(b.imageBase64),
    }));

    console.log("all brands >>>", response);

    return {
      data,
      total: response.data.length,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(response.data.length / params.limit),
    };
  },

  // Get a specific Brand by ID

  getBrandById: async (id: string): Promise<Brand> => {
    const response = await axiosInstance.get(`/brands/${id}`);

    return {
      ...response.data,
      imageUrl: getImageUrl(response.data.imageBase64),
    };
  },

  // Create a New Brand

  createBrand: async (brandData: BrandFormData): Promise<Brand> => {
    const payload = {
      name: brandData.name,
      description: brandData.description,
      status: brandData.status,
      imageBase64: stripBase64Prefix(brandData.imageUrl),
    };

    const response = await axiosInstance.post("/brands", payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("response >>> ", response);

    return {
      ...response.data,
      imageUrl: getImageUrl(response.data.imageBase64),
    };
  },

  // Update an existing Brand

  updateBrand: async (
    id: string,
    brandData: Partial<BrandFormData>
  ): Promise<Brand> => {
    const payload: any = {
      ...brandData,
      imageBase64: stripBase64Prefix(brandData.imageUrl),
    };

    const response = await axiosInstance.put(`/brands/${id}`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return {
      ...response.data,
      imageUrl: getImageUrl(response.data.imageBase64),
    };
  },

  // Delete a Brand

  deleteBrand: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/brands/${id}`);
  },

  // Export brands to PDF

  exportToPDF: async (params: BrandPaginationParams): Promise<Blob> => {
    const response = await axiosInstance.get("/brands/export/pdf", {
      params,
      responseType: "arraybuffer",
    });
    return new Blob([response.data], { type: "application/pdf" });
  },

  // Export brands to Excel

  exportToExcel: async (params: BrandPaginationParams): Promise<Blob> => {
    const response = await axiosInstance.get("/brands/export/excel", {
      params,
      responseType: "arraybuffer",
    });
    return new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  },
};

const getImageUrl = (base64?: string): string | undefined => {
  if (!base64) return undefined;

  if (base64.startsWith("data:image")) {
    return base64;
  }

  if (base64.startsWith("/9j/")) {
    return `data:image/jpeg;base64,${base64}`;
  } else if (base64.startsWith("iVBORw0KGgo")) {
    return `data:image/png;base64,${base64}`;
  } else {
    return `data:image/*;base64,${base64}`;
  }
};

const stripBase64Prefix = (dataUrl?: string): string | undefined => {
  if (!dataUrl) return undefined;
  const commaIndex = dataUrl.indexOf(",");
  return commaIndex !== -1 ? dataUrl.substring(commaIndex + 1) : dataUrl;
};
