// Aggregate reference-data loader.
//
// One call to GET /admin/lookups replaces the 6-7 separate `/admin/<x>/all`
// requests that the product Add/Edit forms used to fire in parallel. Each slice
// is mapped with the exact same transform the individual services use, so the
// shapes handed to the stores/components are identical.
import api from '../utils/api';
import { transformCategory } from './management/categoryService';
import { transformSubcategory } from './management/subCategoryService';
import { transformBrand } from './management/brandService';
import { transformUnit } from './management/unitService';
import { transformWarehouse } from './management/warehouseService';
import { transformWarranty } from './management/warrantyService';
import { transformVariationListItem } from './management/variationService';
import { transformCustomerSummary } from './management/customerService';
import type { Category } from '../types/entities/category.types';
import type { Subcategory } from '../types/entities/subcategory.types';
import type { Brand } from '../types/entities/brand.types';
import type { Unit } from '../types/entities/unit.types';
import type { Warehouse } from '../types/entities/warehouse.types';
import type { Warranty } from '../types/entities/warranty.types';
import type { Variation } from '../types/entities/variation.types';
import type { CustomerSummary } from '../types/entities/customer.types';

export interface LookupsBundle {
  categories: Category[];
  subcategories: Subcategory[];
  brands: Brand[];
  units: Unit[];
  warehouses: Warehouse[];
  warranties: Warranty[];
  variations: Variation[];
}

export type LookupKey = keyof LookupsBundle;

const DEFAULT_INCLUDE: LookupKey[] = [
  'categories', 'subcategories', 'brands', 'units', 'warehouses', 'warranties', 'variations',
];

const arr = (v: any): any[] => (Array.isArray(v) ? v : []);

export interface POSBootstrap {
  categories: Category[];
  customers: CustomerSummary[];
}

export const lookupsService = {
  getLookups: async (include: LookupKey[] = DEFAULT_INCLUDE): Promise<LookupsBundle> => {
    const response = await api.get('/admin/lookups', { params: { include: include.join(',') } });
    const d = response.data?.data ?? {};
    return {
      categories: arr(d.categories).map(transformCategory),
      subcategories: arr(d.subcategories).map(transformSubcategory),
      brands: arr(d.brands).map(transformBrand),
      units: arr(d.units).map(transformUnit),
      warehouses: arr(d.warehouses).map(transformWarehouse),
      warranties: arr(d.warranties).map(transformWarranty),
      variations: arr(d.variations).map(transformVariationListItem),
    };
  },

  // POS screen bootstrap: category filter list + customer picker list in one call.
  getPOSBootstrap: async (): Promise<POSBootstrap> => {
    const response = await api.get('/admin/lookups', { params: { include: 'categories,customers' } });
    const d = response.data?.data ?? {};
    return {
      categories: arr(d.categories).map(transformCategory),
      customers: arr(d.customers).map(transformCustomerSummary),
    };
  },
};
