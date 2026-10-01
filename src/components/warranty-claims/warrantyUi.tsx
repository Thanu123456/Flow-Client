import React from 'react';
import { Tag } from 'antd';
import dayjs from 'dayjs';
import type {
  ClaimStatus,
  RegistrationState,
  SupplierClaimStatus,
  WarrantyRegistration,
} from '../../types/entities/warrantyClaim.types';

export const fmtDate = (d?: string) => (d ? dayjs(d).format('DD MMM YYYY') : '-');
export const fmtDateTime = (d?: string) => (d ? dayjs(d).format('DD MMM YYYY, HH:mm') : '-');

const STATE_META: Record<RegistrationState, { color: string; label: string }> = {
  active: { color: 'green', label: 'In warranty' },
  lifetime: { color: 'cyan', label: 'Lifetime' },
  expired: { color: 'red', label: 'Expired' },
  voided: { color: 'default', label: 'Void' },
};

export const StateTag: React.FC<{ reg: Pick<WarrantyRegistration, 'state' | 'daysLeft'> }> = ({ reg }) => {
  const m = STATE_META[reg.state] ?? STATE_META.active;
  const soon = reg.state === 'active' && reg.daysLeft !== undefined && reg.daysLeft <= 30;
  return (
    <Tag color={soon ? 'orange' : m.color}>
      {m.label}
      {reg.state === 'active' && reg.daysLeft !== undefined ? ` · ${reg.daysLeft}d left` : ''}
    </Tag>
  );
};

export const CLAIM_STATUS_META: Record<ClaimStatus, { color: string; label: string }> = {
  open: { color: 'blue', label: 'Open' },
  approved: { color: 'geekblue', label: 'Approved' },
  in_repair: { color: 'orange', label: 'In repair' },
  resolved: { color: 'green', label: 'Resolved' },
  rejected: { color: 'red', label: 'Rejected' },
  cancelled: { color: 'default', label: 'Cancelled' },
};

export const ClaimStatusTag: React.FC<{ status: ClaimStatus }> = ({ status }) => {
  const m = CLAIM_STATUS_META[status] ?? CLAIM_STATUS_META.open;
  return <Tag color={m.color}>{m.label}</Tag>;
};

export const SUPPLIER_STATUS_META: Record<SupplierClaimStatus, { color: string; label: string }> = {
  none: { color: 'default', label: 'No supplier claim' },
  submitted: { color: 'blue', label: 'Submitted' },
  accepted: { color: 'cyan', label: 'Accepted' },
  rejected: { color: 'red', label: 'Rejected' },
  credited: { color: 'green', label: 'Credited' },
};

export const SupplierStatusTag: React.FC<{ status: SupplierClaimStatus }> = ({ status }) => {
  const m = SUPPLIER_STATUS_META[status] ?? SUPPLIER_STATUS_META.none;
  return <Tag color={m.color}>{m.label}</Tag>;
};

export const RESOLUTION_LABELS: Record<string, string> = {
  repaired: 'Repaired',
  replaced: 'Replaced',
  refunded: 'Refunded',
  credited: 'Store credit',
  no_fault: 'No fault found',
};

/** Next statuses a claim can move to (mirrors claimTransitions in warranty_claim_service.go). */
export const NEXT_STATUSES: Record<ClaimStatus, Exclude<ClaimStatus, 'open'>[]> = {
  open: ['approved', 'rejected', 'cancelled'],
  approved: ['in_repair', 'resolved', 'cancelled'],
  in_repair: ['resolved', 'cancelled'],
  resolved: [],
  rejected: [],
  cancelled: [],
};

/** Allowed supplier-claim moves (mirrors supplierClaimTransitions). */
export const NEXT_SUPPLIER_STATUSES: Record<SupplierClaimStatus, SupplierClaimStatus[]> = {
  none: ['submitted'],
  submitted: ['accepted', 'rejected'],
  accepted: ['credited', 'rejected'],
  rejected: ['submitted'],
  credited: [],
};
