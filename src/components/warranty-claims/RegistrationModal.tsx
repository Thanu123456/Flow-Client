import React, { useCallback, useEffect, useState } from 'react';
import { Modal, Descriptions, Button, Input, Space, Tag, Alert, Divider, Spin, App, Table } from 'antd';
import { SafetyCertificateOutlined, ToolOutlined, CheckCircleFilled } from '@ant-design/icons';
import { warrantyClaimService } from '../../services/management/warrantyClaimService';
import { usePermission } from '../../contexts/PermissionContext';
import { PERMISSIONS } from '../../types/auth/permissions';
import { apiErrorMessage } from '../../utils/apiError';
import { formatTerm, typeColor, typeLabel } from '../../utils/warranty';
import type { WarrantyClaim, WarrantyRegistration } from '../../types/entities/warrantyClaim.types';
import { ClaimStatusTag, StateTag, fmtDate, fmtDateTime } from './warrantyUi';

const { TextArea } = Input;

interface Props {
  registrationId: string | null;
  onClose: () => void;
  /** Called after anything changed (serial saved, claim opened) so lists can refresh. */
  onChanged?: () => void;
  onOpenClaim?: (claim: WarrantyClaim) => void;
}

/** Full detail of one warranty registration: terms, serial, source GRN/supplier, claim history. */
const RegistrationModal: React.FC<Props> = ({ registrationId, onClose, onChanged, onOpenClaim }) => {
  const { message } = App.useApp();
  const { hasPermission } = usePermission();
  const canManage = hasPermission(PERMISSIONS.WARRANTIES_CLAIMS);

  const [reg, setReg] = useState<WarrantyRegistration | null>(null);
  const [claims, setClaims] = useState<WarrantyClaim[]>([]);
  const [loading, setLoading] = useState(false);
  const [serial, setSerial] = useState('');
  const [savingSerial, setSavingSerial] = useState(false);
  const [issue, setIssue] = useState('');
  const [claimOpen, setClaimOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    if (!registrationId) return;
    setLoading(true);
    try {
      const d = await warrantyClaimService.getRegistration(registrationId);
      setReg(d.registration);
      setClaims(d.claims);
      setSerial(d.registration.serialNumber ?? '');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to load warranty'));
      onClose();
    } finally {
      setLoading(false);
    }
  }, [registrationId, message, onClose]);

  useEffect(() => {
    if (registrationId) {
      setClaimOpen(false);
      setIssue('');
      load();
    } else {
      setReg(null);
      setClaims([]);
    }
  }, [registrationId, load]);

  const saveSerial = async () => {
    if (!reg || !serial.trim()) return;
    setSavingSerial(true);
    try {
      const updated = await warrantyClaimService.registerSerial(reg.id, serial.trim());
      setReg(updated);
      message.success(updated.serialVerified ? 'Serial number saved and matched to the purchase record' : 'Serial number saved');
      onChanged?.();
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to save serial number'));
    } finally {
      setSavingSerial(false);
    }
  };

  const createClaim = async () => {
    if (!reg) return;
    if (issue.trim().length < 3) {
      message.warning('Describe the problem first');
      return;
    }
    setCreating(true);
    try {
      const claim = await warrantyClaimService.createClaim(reg.id, issue.trim());
      message.success(`Claim ${claim.claimNumber} created`);
      setClaimOpen(false);
      setIssue('');
      await load();
      onChanged?.();
      onOpenClaim?.(claim);
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to create claim'));
    } finally {
      setCreating(false);
    }
  };

  const hasOpenClaim = claims.some((c) => ['open', 'approved', 'in_repair'].includes(c.status));

  return (
    <Modal
      open={!!registrationId}
      onCancel={onClose}
      footer={null}
      width={760}
      title={
        <span>
          <SafetyCertificateOutlined style={{ marginRight: 8 }} />
          Warranty Details
        </span>
      }
      destroyOnHidden
    >
      {loading || !reg ? (
        <div className="py-10 text-center"><Spin /></div>
      ) : (
        <>
          {reg.state === 'expired' && (
            <Alert
              type="warning"
              showIcon
              className="mb-3"
              message={`This warranty expired on ${fmtDate(reg.expiryDate)}.`}
              description={canManage ? 'A claim can still be logged as out-of-warranty (goodwill or paid repair).' : undefined}
            />
          )}
          {reg.state === 'voided' && <Alert type="error" showIcon className="mb-3" message="This warranty registration is void." />}

          <Descriptions bordered size="small" column={2}>
            <Descriptions.Item label="Product" span={2}>{reg.productName}</Descriptions.Item>
            <Descriptions.Item label="Invoice">{reg.invoiceNumber}</Descriptions.Item>
            <Descriptions.Item label="Sold on">{fmtDate(reg.startDate)}</Descriptions.Item>
            <Descriptions.Item label="Customer">{reg.customerName || 'Walk-in'}</Descriptions.Item>
            <Descriptions.Item label="Phone">{reg.customerPhone || '-'}</Descriptions.Item>
            <Descriptions.Item label="Warranty">
              {reg.warrantyName} <Tag color={typeColor(reg.warrantyType)}>{typeLabel(reg.warrantyType)}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Term">{formatTerm(reg.duration, reg.period)}</Descriptions.Item>
            <Descriptions.Item label="Status"><StateTag reg={reg} /></Descriptions.Item>
            <Descriptions.Item label="Expires">{reg.expiryDate ? fmtDate(reg.expiryDate) : 'Never (lifetime)'}</Descriptions.Item>
            <Descriptions.Item label="Terms & Coverage" span={2}>
              <span style={{ whiteSpace: 'pre-wrap' }}>{reg.terms || '-'}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Exclusions" span={2}>
              <span style={{ whiteSpace: 'pre-wrap' }}>{reg.exclusions || '-'}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Purchased via GRN">{reg.grnNumber || '-'}</Descriptions.Item>
            <Descriptions.Item label="Supplier">{reg.supplierName || '-'}</Descriptions.Item>
          </Descriptions>

          <Divider orientation="left" plain>Serial number</Divider>
          {canManage && reg.state !== 'voided' ? (
            <Space.Compact style={{ width: '100%' }}>
              <Input
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                onPressEnter={saveSerial}
                placeholder="Scan or type the serial / IMEI"
                maxLength={100}
              />
              <Button type="primary" loading={savingSerial} disabled={!serial.trim() || serial.trim() === reg.serialNumber} onClick={saveSerial}>
                Save
              </Button>
            </Space.Compact>
          ) : (
            <div>{reg.serialNumber || '-'}</div>
          )}
          {reg.serialNumber && (
            <div className="mt-1 text-xs text-gray-500">
              {reg.serialVerified ? (
                <span className="text-green-600"><CheckCircleFilled /> Matched to the purchase (GRN) record</span>
              ) : (
                'Not found in purchase serial records — stored as entered'
              )}
            </div>
          )}

          <Divider orientation="left" plain>Claims</Divider>
          {claims.length > 0 && (
            <Table<WarrantyClaim>
              size="small"
              rowKey="id"
              pagination={false}
              dataSource={claims}
              columns={[
                { title: 'Claim', dataIndex: 'claimNumber', render: (n, c) => <a onClick={() => onOpenClaim?.(c)}>{n}</a> },
                { title: 'Opened', dataIndex: 'createdAt', render: fmtDateTime },
                { title: 'Issue', dataIndex: 'issueDescription', ellipsis: true },
                { title: 'Status', dataIndex: 'status', render: (s) => <ClaimStatusTag status={s} /> },
              ]}
            />
          )}

          {canManage && reg.state !== 'voided' && (
            claimOpen ? (
              <div className="mt-3">
                <TextArea
                  rows={3}
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  placeholder="What is wrong with the item?"
                  maxLength={2000}
                  showCount
                  autoFocus
                />
                <Space className="mt-2">
                  <Button type="primary" icon={<ToolOutlined />} loading={creating} onClick={createClaim}>
                    Create claim
                  </Button>
                  <Button onClick={() => setClaimOpen(false)}>Cancel</Button>
                </Space>
              </div>
            ) : (
              <Button
                className="mt-3"
                type="primary"
                icon={<ToolOutlined />}
                disabled={hasOpenClaim}
                onClick={() => setClaimOpen(true)}
              >
                {hasOpenClaim ? 'A claim is already in progress' : reg.state === 'expired' ? 'Log out-of-warranty claim' : 'Start warranty claim'}
              </Button>
            )
          )}
        </>
      )}
    </Modal>
  );
};

export default RegistrationModal;
