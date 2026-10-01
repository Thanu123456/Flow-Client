import React, { useCallback, useEffect, useState } from 'react';
import {
  Drawer, Descriptions, Button, Space, Tag, Timeline, Spin, Modal, Select, Input, InputNumber,
  DatePicker, Form, Divider, App, Alert,
} from 'antd';
import dayjs from 'dayjs';
import { warrantyClaimService } from '../../services/management/warrantyClaimService';
import { useSupplierStore } from '../../store/management/supplierStore';
import { usePermission } from '../../contexts/PermissionContext';
import { PERMISSIONS } from '../../types/auth/permissions';
import { apiErrorMessage } from '../../utils/apiError';
import type {
  ClaimResolution, ClaimStatus, SupplierClaimStatus, WarrantyClaim,
} from '../../types/entities/warrantyClaim.types';
import {
  CLAIM_STATUS_META, ClaimStatusTag, NEXT_STATUSES, NEXT_SUPPLIER_STATUSES, RESOLUTION_LABELS,
  SUPPLIER_STATUS_META, SupplierStatusTag, fmtDate, fmtDateTime,
} from './warrantyUi';

const { TextArea } = Input;

interface Props {
  claimId: string | null;
  onClose: () => void;
  onChanged?: () => void;
}

const ACTION_LABEL: Record<Exclude<ClaimStatus, 'open'>, string> = {
  approved: 'Approve',
  in_repair: 'Send for repair',
  resolved: 'Resolve',
  rejected: 'Reject',
  cancelled: 'Cancel claim',
};

/** Claim detail: workflow actions, timeline and the supplier back-claim. */
const ClaimDrawer: React.FC<Props> = ({ claimId, onClose, onChanged }) => {
  const { message } = App.useApp();
  const { hasPermission } = usePermission();
  const canManage = hasPermission(PERMISSIONS.WARRANTIES_CLAIMS);
  const { allSuppliers, getAllSuppliers } = useSupplierStore();

  const [claim, setClaim] = useState<WarrantyClaim | null>(null);
  const [loading, setLoading] = useState(false);

  // status change dialog
  const [target, setTarget] = useState<Exclude<ClaimStatus, 'open'> | null>(null);
  const [resolution, setResolution] = useState<ClaimResolution | undefined>();
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // supplier claim form
  const [supForm] = Form.useForm();
  const [supSaving, setSupSaving] = useState(false);

  const load = useCallback(async () => {
    if (!claimId) return;
    setLoading(true);
    try {
      setClaim(await warrantyClaimService.getClaim(claimId));
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to load claim'));
      onClose();
    } finally {
      setLoading(false);
    }
  }, [claimId, message, onClose]);

  useEffect(() => {
    if (claimId) {
      load();
      if (allSuppliers.length === 0) getAllSuppliers();
    } else {
      setClaim(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claimId, load]);

  // keep the supplier form in sync with the loaded claim
  useEffect(() => {
    if (!claim) return;
    supForm.setFieldsValue({
      supplierId: claim.supplierId,
      status: claim.supplierClaimStatus,
      ref: claim.supplierClaimRef,
      claimDate: claim.supplierClaimDate ? dayjs(claim.supplierClaimDate) : undefined,
      creditAmount: claim.supplierCreditAmount || undefined,
      notes: claim.supplierNotes,
    });
  }, [claim, supForm]);

  const openAction = (s: Exclude<ClaimStatus, 'open'>) => {
    setTarget(s);
    setResolution(undefined);
    setNotes('');
  };

  const submitAction = async () => {
    if (!claim || !target) return;
    if (target === 'resolved' && !resolution) {
      message.warning('Choose how the claim was resolved');
      return;
    }
    if (target === 'rejected' && !notes.trim()) {
      message.warning('Give a reason for rejecting the claim');
      return;
    }
    setSaving(true);
    try {
      setClaim(await warrantyClaimService.changeStatus(claim.id, target, { resolution, notes: notes.trim() || undefined }));
      message.success('Claim updated');
      setTarget(null);
      onChanged?.();
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to update claim'));
    } finally {
      setSaving(false);
    }
  };

  const saveSupplier = async () => {
    if (!claim) return;
    try {
      const v = await supForm.validateFields();
      setSupSaving(true);
      setClaim(
        await warrantyClaimService.updateSupplierClaim(claim.id, {
          supplierId: v.supplierId,
          status: v.status,
          ref: v.ref,
          claimDate: v.claimDate ? v.claimDate.format('YYYY-MM-DD') : undefined,
          creditAmount: v.creditAmount ?? 0,
          notes: v.notes,
        })
      );
      message.success('Supplier claim saved');
      onChanged?.();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(apiErrorMessage(e, 'Failed to save supplier claim'));
    } finally {
      setSupSaving(false);
    }
  };

  const next = claim ? NEXT_STATUSES[claim.status] : [];
  const supplierOptions: SupplierClaimStatus[] = claim
    ? [claim.supplierClaimStatus, ...NEXT_SUPPLIER_STATUSES[claim.supplierClaimStatus]]
    : [];
  const supplierStatus = Form.useWatch('status', supForm) as SupplierClaimStatus | undefined;
  const supplierLocked = claim ? NEXT_SUPPLIER_STATUSES[claim.supplierClaimStatus].length === 0 && claim.supplierClaimStatus !== 'none' : false;

  return (
    <Drawer
      open={!!claimId}
      onClose={onClose}
      width={620}
      title={claim ? `Claim ${claim.claimNumber}` : 'Warranty Claim'}
      extra={claim && <ClaimStatusTag status={claim.status} />}
      destroyOnHidden
    >
      {loading || !claim ? (
        <div className="py-10 text-center"><Spin /></div>
      ) : (
        <>
          {!claim.inWarranty && (
            <Alert type="warning" showIcon className="mb-3" message="Out of warranty when this claim was opened (goodwill or paid repair)." />
          )}

          <Descriptions bordered size="small" column={2}>
            <Descriptions.Item label="Product" span={2}>{claim.productName}</Descriptions.Item>
            <Descriptions.Item label="Invoice">{claim.invoiceNumber}</Descriptions.Item>
            <Descriptions.Item label="Serial">{claim.serialNumber || '-'}</Descriptions.Item>
            <Descriptions.Item label="Customer">{claim.customerName || 'Walk-in'}</Descriptions.Item>
            <Descriptions.Item label="Phone">{claim.customerPhone || '-'}</Descriptions.Item>
            <Descriptions.Item label="Warranty">{claim.warrantyName}</Descriptions.Item>
            <Descriptions.Item label="Expires">{claim.expiryDate ? fmtDate(claim.expiryDate) : 'Lifetime'}</Descriptions.Item>
            <Descriptions.Item label="Problem" span={2}>
              <span style={{ whiteSpace: 'pre-wrap' }}>{claim.issueDescription}</span>
            </Descriptions.Item>
            {claim.resolution && (
              <Descriptions.Item label="Resolution" span={2}>
                <Tag color="green">{RESOLUTION_LABELS[claim.resolution]}</Tag>
                {claim.resolutionNotes}
              </Descriptions.Item>
            )}
          </Descriptions>

          {canManage && next.length > 0 && (
            <Space wrap className="mt-3">
              {next.map((s) => (
                <Button
                  key={s}
                  type={s === 'resolved' || s === 'approved' ? 'primary' : 'default'}
                  danger={s === 'rejected' || s === 'cancelled'}
                  onClick={() => openAction(s)}
                >
                  {ACTION_LABEL[s]}
                </Button>
              ))}
            </Space>
          )}

          <Divider orientation="left" plain>Supplier claim</Divider>
          <div className="mb-2 text-xs text-gray-500">
            Claim the cost back from the supplier this unit was bought from
            {claim.grnNumber ? ` (GRN ${claim.grnNumber})` : ''}. Tracking only — it does not post to the supplier ledger.
          </div>
          <Form form={supForm} layout="vertical" disabled={!canManage || supplierLocked} requiredMark={false}>
            <Form.Item name="supplierId" label="Supplier">
              <Select
                showSearch
                allowClear
                optionFilterProp="label"
                placeholder="Select supplier"
                options={allSuppliers.map((s) => ({ value: s.id, label: s.displayName }))}
              />
            </Form.Item>
            <Space size="middle" align="start" wrap>
              <Form.Item name="status" label="Status" style={{ minWidth: 190 }}>
                <Select
                  options={supplierOptions.map((s) => ({ value: s, label: SUPPLIER_STATUS_META[s].label }))}
                />
              </Form.Item>
              <Form.Item name="ref" label="Supplier RMA / ref" style={{ minWidth: 190 }}>
                <Input maxLength={100} />
              </Form.Item>
              <Form.Item name="claimDate" label="Claim date">
                <DatePicker format="DD MMM YYYY" />
              </Form.Item>
            </Space>
            {(supplierStatus === 'credited' || (claim.supplierCreditAmount ?? 0) > 0) && (
              <Form.Item name="creditAmount" label="Credit received">
                <InputNumber min={0} precision={2} style={{ width: 200 }} />
              </Form.Item>
            )}
            <Form.Item name="notes" label="Notes">
              <TextArea rows={2} maxLength={2000} />
            </Form.Item>
          </Form>
          <div className="flex items-center justify-between">
            <SupplierStatusTag status={claim.supplierClaimStatus} />
            {canManage && !supplierLocked && (
              <Button type="primary" loading={supSaving} onClick={saveSupplier}>Save supplier claim</Button>
            )}
          </div>

          <Divider orientation="left" plain>Timeline</Divider>
          <Timeline
            items={(claim.events ?? []).map((e) => ({
              color: e.eventType === 'created' ? 'blue' : e.toStatus === 'resolved' || e.toStatus === 'credited' ? 'green' : e.toStatus === 'rejected' || e.toStatus === 'cancelled' ? 'red' : 'gray',
              children: (
                <div>
                  <div className="text-sm font-medium">
                    {e.eventType === 'created' && 'Claim opened'}
                    {e.eventType === 'status_changed' && `Claim ${CLAIM_STATUS_META[e.toStatus as ClaimStatus]?.label ?? e.toStatus}`}
                    {e.eventType === 'supplier_updated' && `Supplier claim: ${SUPPLIER_STATUS_META[e.toStatus as SupplierClaimStatus]?.label ?? e.toStatus}`}
                  </div>
                  {e.note && <div className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{e.note}</div>}
                  <div className="text-xs text-gray-500">{fmtDateTime(e.createdAt)}{e.userName ? ` · ${e.userName}` : ''}</div>
                </div>
              ),
            }))}
          />
        </>
      )}

      <Modal
        open={!!target}
        title={target ? ACTION_LABEL[target] : ''}
        onCancel={() => setTarget(null)}
        onOk={submitAction}
        okText="Confirm"
        okButtonProps={{ danger: target === 'rejected' || target === 'cancelled' }}
        confirmLoading={saving}
        destroyOnHidden
      >
        {target === 'resolved' && (
          <div className="mb-3">
            <div className="mb-1 font-medium">How was it resolved?</div>
            <Select
              style={{ width: '100%' }}
              value={resolution}
              onChange={setResolution}
              placeholder="Select resolution"
              options={Object.entries(RESOLUTION_LABELS).map(([value, label]) => ({ value, label }))}
            />
          </div>
        )}
        <div className="mb-1 font-medium">{target === 'rejected' ? 'Reason (required)' : 'Notes (optional)'}</div>
        <TextArea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={2000} />
      </Modal>
    </Drawer>
  );
};

export default ClaimDrawer;
