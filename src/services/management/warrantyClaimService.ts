import { axiosInstance } from "../api/axiosInstance";
import type {
  ClaimEvent,
  ClaimResolution,
  ClaimStats,
  ClaimStatus,
  Paged,
  SupplierClaimStatus,
  WarrantyClaim,
  WarrantyRegistration,
} from "../../types/entities/warrantyClaim.types";

const opt = (v: any) => (v === null || v === undefined || v === "" ? undefined : v);

export const transformRegistration = (r: any): WarrantyRegistration => ({
  id: r.id,
  saleId: r.sale_id,
  saleItemId: r.sale_item_id,
  invoiceNumber: r.invoice_number,
  productId: r.product_id,
  productName: r.product_name,
  customerId: opt(r.customer_id),
  customerName: opt(r.customer_name),
  customerPhone: opt(r.customer_phone),
  quantity: Number(r.quantity || 1),
  warrantyName: r.warranty_name,
  warrantyType: r.warranty_type || "manufacturer",
  duration: Number(r.duration || 0),
  period: r.period,
  terms: opt(r.terms),
  exclusions: opt(r.exclusions),
  startDate: r.start_date,
  expiryDate: opt(r.expiry_date),
  serialNumber: opt(r.serial_number),
  serialVerified: !!r.serial_verified,
  grnId: opt(r.grn_id),
  grnNumber: opt(r.grn_number),
  supplierId: opt(r.supplier_id),
  supplierName: opt(r.supplier_name),
  status: r.status,
  state: r.state,
  daysLeft: r.days_left ?? undefined,
  claimCount: Number(r.claim_count || 0),
  createdAt: r.created_at,
});

const transformEvent = (e: any): ClaimEvent => ({
  id: e.id,
  eventType: e.event_type,
  fromStatus: opt(e.from_status),
  toStatus: opt(e.to_status),
  note: opt(e.note),
  userName: opt(e.user_name),
  createdAt: e.created_at,
});

export const transformClaim = (c: any): WarrantyClaim => ({
  id: c.id,
  claimNumber: c.claim_number,
  registrationId: c.registration_id,
  issueDescription: c.issue_description,
  inWarranty: !!c.in_warranty,
  status: c.status,
  resolution: opt(c.resolution),
  resolutionNotes: opt(c.resolution_notes),
  resolvedAt: opt(c.resolved_at),
  supplierId: opt(c.supplier_id),
  supplierName: opt(c.supplier_name),
  supplierClaimStatus: c.supplier_claim_status || "none",
  supplierClaimRef: opt(c.supplier_claim_ref),
  supplierClaimDate: opt(c.supplier_claim_date),
  supplierCreditAmount: Number(c.supplier_credit_amount || 0),
  supplierNotes: opt(c.supplier_notes),
  invoiceNumber: c.invoice_number,
  productName: c.product_name,
  serialNumber: opt(c.serial_number),
  customerName: opt(c.customer_name),
  customerPhone: opt(c.customer_phone),
  warrantyName: c.warranty_name,
  expiryDate: opt(c.expiry_date),
  grnNumber: opt(c.grn_number),
  createdAt: c.created_at,
  updatedAt: c.updated_at,
  events: Array.isArray(c.events) ? c.events.map(transformEvent) : undefined,
});

const unwrap = (res: any) => res.data?.data ?? res.data;

function paged<T>(res: any, map: (x: any) => T, page: number, limit: number): Paged<T> {
  const rd = res.data;
  const raw = Array.isArray(rd?.data) ? rd.data : [];
  return {
    data: raw.map(map),
    total: rd?.meta?.total ?? raw.length,
    page: rd?.meta?.page ?? page,
    limit: rd?.meta?.per_page ?? limit,
  };
}

export interface RegistrationQuery {
  page: number;
  limit: number;
  search?: string;
  state?: string;
  expiringInDays?: number;
}

export interface ClaimQuery {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  supplierStatus?: string;
}

export const warrantyClaimService = {
  /** Quick search used at the counter: invoice no, serial, phone, customer or product. */
  lookup: async (q: string): Promise<WarrantyRegistration[]> => {
    const res = await axiosInstance.get("/admin/warranty-registrations/lookup", { params: { q } });
    const raw = unwrap(res);
    return Array.isArray(raw) ? raw.map(transformRegistration) : [];
  },

  listRegistrations: async (p: RegistrationQuery): Promise<Paged<WarrantyRegistration>> => {
    const res = await axiosInstance.get("/admin/warranty-registrations", {
      params: {
        page: p.page,
        per_page: p.limit,
        search: p.search || undefined,
        state: p.state || undefined,
        expiring_in_days: p.expiringInDays || undefined,
      },
    });
    return paged(res, transformRegistration, p.page, p.limit);
  },

  getRegistration: async (id: string): Promise<{ registration: WarrantyRegistration; claims: WarrantyClaim[] }> => {
    const d = unwrap(await axiosInstance.get(`/admin/warranty-registrations/${id}`));
    return {
      registration: transformRegistration(d.registration),
      claims: (d.claims || []).map(transformClaim),
    };
  },

  registerSerial: async (id: string, serialNumber: string): Promise<WarrantyRegistration> => {
    const res = await axiosInstance.put(`/admin/warranty-registrations/${id}/serial`, { serial_number: serialNumber });
    return transformRegistration(unwrap(res));
  },

  stats: async (): Promise<ClaimStats> => {
    const d = unwrap(await axiosInstance.get("/admin/warranty-claims/stats"));
    return {
      open: Number(d.open || 0),
      inRepair: Number(d.in_repair || 0),
      awaitingSupplier: Number(d.awaiting_supplier || 0),
      expiringSoon: Number(d.expiring_soon || 0),
    };
  },

  listClaims: async (p: ClaimQuery): Promise<Paged<WarrantyClaim>> => {
    const res = await axiosInstance.get("/admin/warranty-claims", {
      params: {
        page: p.page,
        per_page: p.limit,
        search: p.search || undefined,
        status: p.status || undefined,
        supplier_status: p.supplierStatus || undefined,
      },
    });
    return paged(res, transformClaim, p.page, p.limit);
  },

  getClaim: async (id: string): Promise<WarrantyClaim> =>
    transformClaim(unwrap(await axiosInstance.get(`/admin/warranty-claims/${id}`))),

  createClaim: async (registrationId: string, issueDescription: string): Promise<WarrantyClaim> =>
    transformClaim(
      unwrap(await axiosInstance.post("/admin/warranty-claims", { registration_id: registrationId, issue_description: issueDescription }))
    ),

  changeStatus: async (
    id: string,
    status: Exclude<ClaimStatus, "open">,
    opts: { resolution?: ClaimResolution; notes?: string } = {}
  ): Promise<WarrantyClaim> =>
    transformClaim(
      unwrap(
        await axiosInstance.post(`/admin/warranty-claims/${id}/status`, {
          status,
          resolution: opts.resolution,
          notes: opts.notes || undefined,
        })
      )
    ),

  updateSupplierClaim: async (
    id: string,
    data: {
      supplierId?: string;
      status: SupplierClaimStatus;
      ref?: string;
      claimDate?: string;
      creditAmount?: number;
      notes?: string;
    }
  ): Promise<WarrantyClaim> =>
    transformClaim(
      unwrap(
        await axiosInstance.put(`/admin/warranty-claims/${id}/supplier`, {
          supplier_id: data.supplierId || undefined,
          status: data.status,
          ref: data.ref || undefined,
          claim_date: data.claimDate || undefined,
          credit_amount: data.creditAmount ?? 0,
          notes: data.notes || undefined,
        })
      )
    ),
};
