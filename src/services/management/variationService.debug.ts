import { axiosInstance } from "../api/axiosInstance";
import type {
    Variation,
    VariationFormData,
    VariationPaginationParams,
    VariationValue,
    VariationResponse,
} from "../../types/entities/variation.types";

// Helper to transform backend variation value to frontend type
const transformVariationValue = (v: any): VariationValue => {
    console.log("transformVariationValue input:", v);
    if (typeof v === "string") {
        return {
            id: v,
            value: v,
        };
    }
    const result = {
        id: String(v.id || v.ID || v.value || v.Value || Math.random().toString()),
        value: String(v.value || v.Value || v.name || v.Name || v.option_value || v.OptionValue || JSON.stringify(v)),
        createdAt: v.created_at || v.createdAt || v.CreatedAt,
    };
    console.log("transformVariationValue output:", result);
    return result;
};

// Helper to transform backend variation response to frontend Variation type
const transformVariation = (v: any): Variation => {
    console.log("=== transformVariation INPUT ===", JSON.stringify(v, null, 2));

    // If v is nested in a 'variation' or 'data' property (sometimes list response has items nested), unwrap it
    const data = v.variation || v.Variation || (v.id ? v : (v.data || v));
    console.log("Unwrapped data:", JSON.stringify(data, null, 2));

    // Find any array property that could represent variation values
    const valuesData = (Array.isArray(data.values) && data.values.length > 0) ? data.values :
        (Array.isArray(data.options) && data.options.length > 0) ? data.options :
            (Array.isArray(data.Values) && data.Values.length > 0) ? data.Values :
                (Array.isArray(data.Options) && data.Options.length > 0) ? data.Options :
                    (Array.isArray(data.variation_options) && data.variation_options.length > 0) ? data.variation_options :
                        (Array.isArray(data.variation_values) && data.variation_values.length > 0) ? data.variation_values :
                            (Array.isArray(data.items) && data.items.length > 0) ? data.items :
                                (Array.isArray(data.values) ? data.values :
                                    (Array.isArray(data.options) ? data.options : []));

    console.log("Found valuesData:", JSON.stringify(valuesData, null, 2));

    const result = {
        id: String(data.id || data.ID || ""),
        name: String(data.name || data.Name || "Unnamed Variation"),
        values: valuesData.map(transformVariationValue),
        valuesCount: Number(data.values_count || data.valuesCount || valuesData.length),
        status: (data.is_active === true || data.is_active === "true" || data.status === "active" || data.IsActive === true) ? "active" : "inactive",
        createdAt: data.created_at || data.createdAt || data.CreatedAt || data.created_at || "",
        updatedAt: data.updated_at || data.updatedAt || data.UpdatedAt || data.updated_at || "",
    };

    console.log("=== transformVariation OUTPUT ===", JSON.stringify(result, null, 2));
    return result;
};



export const variationServiceDebug = {
    // Get all variations with pagination
    getVariations: async (
        params: VariationPaginationParams
    ): Promise<VariationResponse> => {
        // Convert frontend params to backend params
        const backendParams: any = {
            page: params.page,
            per_page: params.limit,
            search: params.search || undefined,
            include_inactive: params.status !== "active",
        };

        const response = await axiosInstance.get("/admin/variations", {
            params: backendParams,
        });

        console.log("=== FULL API RESPONSE ===");
        console.log(JSON.stringify(response.data, null, 2));
        console.log("=========================");

        // Backend might return { variations: [...], total, ... } 
        // or { success: true, data: { variations: [...], total: ... } }
        // or { success: true, data: [...] }
        const rootData = response.data.data || response.data;
        console.log("rootData:", JSON.stringify(rootData, null, 2));

        let variationsData = [];

        if (Array.isArray(rootData)) {
            variationsData = rootData;
            console.log("Using rootData as array");
        } else if (rootData && Array.isArray(rootData.variations)) {
            variationsData = rootData.variations;
            console.log("Using rootData.variations");
        } else if (rootData && Array.isArray(rootData.data)) {
            variationsData = rootData.data;
            console.log("Using rootData.data");
        } else if (rootData && Array.isArray(rootData.items)) {
            variationsData = rootData.items;
            console.log("Using rootData.items");
        } else {
            variationsData = [];
            console.log("No variations data found!");
        }

        console.log("variationsData count:", variationsData.length);
        if (variationsData.length > 0) {
            console.log("First variation raw:", JSON.stringify(variationsData[0], null, 2));
        }

        const variations: Variation[] = variationsData.map(transformVariation);
        console.log("Transformed variations:", JSON.stringify(variations, null, 2));

        const total = rootData.total || rootData.totalItems || variations.length;
        const page = rootData.page || rootData.currentPage || params.page;
        const perPage = rootData.per_page || rootData.limit || params.limit;
        const totalPages = rootData.total_pages || rootData.totalPages || Math.ceil(total / perPage);

        return {
            data: variations,
            total,
            page,
            limit: perPage,
            totalPages,
            pagination: {
                total,
                page,
                limit: perPage,
                totalPages,
            }
        };
    },
};
