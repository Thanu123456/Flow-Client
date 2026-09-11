import React, { useRef, useState } from 'react';
import { Modal, Descriptions, Tag, Table, Divider, Button, Space, Typography, Card, Row, Col, Popconfirm, Upload, Input, message } from 'antd';
import {
  RollbackOutlined, FileTextOutlined, ShopOutlined, UserOutlined, CalendarOutlined, AuditOutlined,
  PrinterOutlined, CheckOutlined, CloseOutlined, StopOutlined, PaperClipOutlined, UploadOutlined, DeleteOutlined,
} from '@ant-design/icons';
import type { PurchaseReturn, PurchaseReturnItem, PurchaseReturnStatus } from '../../types/entities/purchaseReturn.types';
import { purchaseReturnService } from '../../services/transactions/purchaseReturnService';
import { usePurchaseReturnStore } from '../../store/transactions/purchaseReturnStore';
import { usePermissions } from '../../hooks/auth/usePermissions';
import { PERMISSIONS } from '../../types/auth/permissions';
import GRNJournalModal from './GRNJournalModal';
import PrintPurchaseReturn from './PrintPurchaseReturn';
import dayjs from 'dayjs';

const { Text, Title } = Typography;
const { TextArea } = Input;

const fmt = (n: number) =>
  `Rs. ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const statusColor: Record<PurchaseReturnStatus, string> = {
  pending_approval: 'gold',
  completed: 'red',
  rejected: 'default',
  voided: 'volcano',
};

const readAsBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });

interface Props {
  visible: boolean;
  ret: PurchaseReturn | null;
  onClose: () => void;
  onChanged?: () => void;
}

const PurchaseReturnDetailsModal: React.FC<Props> = ({ visible, ret, onClose, onChanged }) => {
  const [journalOpen, setJournalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [voidModalOpen, setVoidModalOpen] = useState(false);
  const [voidReason, setVoidReason] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  const { approveReturn, rejectReturn, voidReturn } = usePurchaseReturnStore();
  const { hasPermission } = usePermissions();
  const canApprove = hasPermission(PERMISSIONS.PURCHASES_APPROVE);

  if (!ret) return null;

  const handlePrint = () => {
    if (!printRef.current) return;
    const content = printRef.current.innerHTML;
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Debit Note - ${ret?.debitNoteNumber || ret?.returnNumber}</title>
          <style>
             @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            body { margin: 0; padding: 20px; font-family: 'Inter', sans-serif; }
            @media print { body { margin: 0; padding: 0; } }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #eee; padding: 8px; text-align: left; }
            th { background-color: #f9f9f9; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 300);
  };

  const handleApprove = async () => {
    setBusy(true);
    try {
      await approveReturn(ret.id);
      message.success('Purchase return approved');
      onChanged?.();
    } catch (e: any) {
      message.error(e?.response?.data?.error?.message || 'Failed to approve return');
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async () => {
    setBusy(true);
    try {
      await rejectReturn(ret.id, rejectReason || undefined);
      message.success('Purchase return rejected');
      setRejectModalOpen(false);
      setRejectReason('');
      onChanged?.();
      onClose();
    } catch (e: any) {
      message.error(e?.response?.data?.error?.message || 'Failed to reject return');
    } finally {
      setBusy(false);
    }
  };

  const handleVoid = async () => {
    if (!voidReason.trim()) {
      message.error('A reason is required to void a return');
      return;
    }
    setBusy(true);
    try {
      await voidReturn(ret.id, voidReason);
      message.success('Purchase return voided');
      setVoidModalOpen(false);
      setVoidReason('');
      onChanged?.();
    } catch (e: any) {
      message.error(e?.response?.data?.error?.message || 'Failed to void return');
    } finally {
      setBusy(false);
    }
  };

  const handleUploadAttachment = async (file: File) => {
    const okType = /^(image\/|application\/pdf)/.test(file.type);
    if (!okType) { message.error('Only images and PDF files are allowed'); return Upload.LIST_IGNORE; }
    if (file.size > 10 * 1024 * 1024) { message.error('File must be under 10 MB'); return Upload.LIST_IGNORE; }
    setUploading(true);
    try {
      const data = await readAsBase64(file);
      await purchaseReturnService.addAttachment(ret.id, { fileName: file.name, contentType: file.type, data });
      message.success('Attachment added');
      onChanged?.();
    } catch (e: any) {
      message.error(e?.response?.data?.error?.message ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
    return Upload.LIST_IGNORE;
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      await purchaseReturnService.deleteAttachment(ret.id, attachmentId);
      message.success('Attachment removed');
      onChanged?.();
    } catch (e: any) {
      message.error(e?.response?.data?.error?.message ?? 'Failed to remove');
    }
  };

  const itemColumns = [
    {
      title: '#',
      key: 'idx',
      width: 50,
      align: 'center' as const,
      render: (_: any, __: PurchaseReturnItem, idx: number) => (
        <Text type="secondary">{idx + 1}</Text>
      ),
    },
    {
      title: 'Product',
      key: 'product',
      render: (_: any, record: PurchaseReturnItem) => (
        <div>
          <div style={{ fontWeight: 600 }}>{record.productName}</div>
          {record.variationType && (
            <Tag color="blue-inverse" style={{ fontSize: '10px', marginTop: 2 }}>
              {record.variationType.toUpperCase()}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Return Qty',
      dataIndex: 'returnQty',
      key: 'returnQty',
      align: 'right' as const,
      render: (v: number) => <Text strong>{v}</Text>,
    },
    {
      title: 'Cost Price',
      dataIndex: 'costPrice',
      key: 'costPrice',
      align: 'right' as const,
      render: (v: number) => (
        <Text style={{ fontFamily: 'monospace' }}>
          {v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right' as const,
      render: (v: number) => (
        <Text strong style={{ fontFamily: 'monospace', color: '#f5222d' }}>
          {v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      ),
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      render: (v?: string) => v ? <Text type="secondary">{v}</Text> : <Text type="secondary" disabled>-</Text>,
    },
    {
      title: 'S/N',
      key: 'serial',
      width: 70,
      align: 'center' as const,
      render: (_: any, r: PurchaseReturnItem) =>
        r.serialNumbers && r.serialNumbers.length > 0 ? (
          <Tag color="cyan" style={{ borderRadius: '12px' }}>{r.serialNumbers.length}</Tag>
        ) : (
          <Text type="secondary" disabled>-</Text>
        ),
    },
  ];

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      width={900}
      style={{ top: 20 }}
      title={
        <div style={{
          background: 'linear-gradient(90deg, #fff1f0 0%, #ffffff 100%)',
          padding: '20px 24px',
          margin: '-20px -24px 0 -24px',
          borderBottom: '1px solid #f0f0f0',
          borderRadius: '8px 8px 0 0',
        }}>
          <Row justify="space-between" align="middle" style={{ paddingRight: '40px' }}>
            <Col>
              <Space direction="vertical" size={0}>
                <Space>
                  <RollbackOutlined style={{ fontSize: '20px', color: '#f5222d' }} />
                  <Title level={4} style={{ margin: 0 }}>Purchase Return</Title>
                  <Tag color={statusColor[ret.status]} style={{ borderRadius: '12px', padding: '0 12px' }}>
                    {ret.status.replace('_', ' ').toUpperCase()}
                  </Tag>
                </Space>
                <Text type="secondary" style={{ fontSize: '13px' }}>
                  Ref # <Text strong style={{ color: '#000' }}>{ret.returnNumber}</Text>
                  {ret.debitNoteNumber && <> {' · '}Debit Note <Text strong style={{ color: '#000' }}>{ret.debitNoteNumber}</Text></>}
                  {' · '}GRN <Text strong style={{ color: '#1890ff' }}>{ret.originalGrnNumber}</Text>
                </Text>
              </Space>
            </Col>
            <Col style={{ textAlign: 'right' }}>
              <div style={{ color: '#8c8c8c', fontSize: '12px', marginBottom: 2 }}>Total Returned</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#f5222d' }}>
                {fmt(ret.totalReturnAmount)}
              </div>
            </Col>
          </Row>
        </div>
      }
      footer={[
        <Button key="journal" icon={<AuditOutlined />} onClick={() => setJournalOpen(true)}>View Journal</Button>,
        <Button key="print" icon={<PrinterOutlined />} onClick={handlePrint}>Print</Button>,
        ...(ret.status === 'pending_approval' && canApprove
          ? [
              <Popconfirm key="reject-pc" title="Reject this return?" onConfirm={() => setRejectModalOpen(true)}>
                <Button danger icon={<CloseOutlined />} loading={busy}>Reject</Button>
              </Popconfirm>,
              <Popconfirm key="approve-pc" title="Approve this return? Stock, supplier balance and GL will post." onConfirm={handleApprove}>
                <Button type="primary" icon={<CheckOutlined />} loading={busy}>Approve</Button>
              </Popconfirm>,
            ]
          : []),
        ...(ret.status === 'completed' && canApprove
          ? [<Button key="void" danger icon={<StopOutlined />} onClick={() => setVoidModalOpen(true)}>Void</Button>]
          : []),
        <Button key="close" type="primary" onClick={onClose}>Close</Button>,
      ]}
    >
      <Space direction="vertical" size={20} style={{ width: '100%' }}>
        {ret.status === 'rejected' && (
          <Card size="small" style={{ backgroundColor: '#fafafa', border: '1px solid #d9d9d9' }}>
            <Text strong>Rejected</Text> by {ret.rejectedByName} on {ret.rejectedAt ? dayjs(ret.rejectedAt).format('DD MMM YYYY HH:mm') : '-'}
            {ret.rejectionReason && <div style={{ marginTop: 4 }}>Reason: {ret.rejectionReason}</div>}
          </Card>
        )}
        {ret.status === 'voided' && (
          <Card size="small" style={{ backgroundColor: '#fff2e8', border: '1px solid #ffbb96' }}>
            <Text strong>Voided</Text> by {ret.voidedByName} on {ret.voidedAt ? dayjs(ret.voidedAt).format('DD MMM YYYY HH:mm') : '-'}
            {ret.voidReason && <div style={{ marginTop: 4 }}>Reason: {ret.voidReason}</div>}
          </Card>
        )}
        {ret.status === 'pending_approval' && (
          <Card size="small" style={{ backgroundColor: '#fffbe6', border: '1px solid #ffe58f' }}>
            <Text strong>Awaiting approval</Text> — stock, supplier balance and the GL entry have not moved yet.
          </Card>
        )}

        <Card size="small" title={<Space><ShopOutlined /> Details</Space>} styles={{ header: { backgroundColor: '#fafafa' } }}>
          <Descriptions size="small" column={{ xs: 1, sm: 2, md: 3 }} bordered>
            <Descriptions.Item label="Return Date">
              <Space><CalendarOutlined style={{ color: '#8c8c8c' }} />{dayjs(ret.returnDate).format('DD MMM YYYY')}</Space>
            </Descriptions.Item>
            <Descriptions.Item label="Supplier">
              <Text strong>{ret.supplierName}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Warehouse">{ret.warehouseName}</Descriptions.Item>
            <Descriptions.Item label="Original GRN">
              <Text style={{ fontFamily: 'monospace', color: '#1890ff' }}>{ret.originalGrnNumber}</Text>
            </Descriptions.Item>
            {ret.vendorBillNumber && (
              <Descriptions.Item label="Vendor Bill">
                <Text style={{ fontFamily: 'monospace' }}>{ret.vendorBillNumber}</Text>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Created By">
              <Space><UserOutlined style={{ color: '#8c8c8c' }} />{ret.createdByName}</Space>
            </Descriptions.Item>
            {ret.approvedByName && (
              <Descriptions.Item label="Approved By">
                <Space><UserOutlined style={{ color: '#8c8c8c' }} />{ret.approvedByName}</Space>
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        <div>
          <div style={{ padding: '0 0 12px 0', borderBottom: '1px solid #f0f0f0', marginBottom: 12 }}>
            <Title level={5} style={{ margin: 0 }}>
              <Space><FileTextOutlined style={{ color: '#f5222d' }} /> Returned Items ({ret.items.length})</Space>
            </Title>
          </div>
          <Table
            columns={itemColumns}
            dataSource={ret.items}
            rowKey="id"
            pagination={false}
            size="small"
            bordered
            scroll={{ x: 750 }}
            expandable={
              ret.items.some((i) => (i.serialNumbers?.length ?? 0) > 0)
                ? {
                    expandedRowRender: (record: PurchaseReturnItem) =>
                      record.serialNumbers && record.serialNumbers.length > 0 ? (
                        <div style={{ padding: '12px 24px', backgroundColor: '#fafafa', borderRadius: '4px' }}>
                          <div style={{ marginBottom: 8, fontWeight: 600 }}>Serial Numbers</div>
                          <Space wrap>
                            {record.serialNumbers.map((sn) => (
                              <Tag key={sn} color="blue" style={{ borderRadius: '4px' }}>{sn}</Tag>
                            ))}
                          </Space>
                        </div>
                      ) : null,
                    rowExpandable: (record: PurchaseReturnItem) => (record.serialNumbers?.length ?? 0) > 0,
                  }
                : undefined
            }
          />
        </div>

        <Card
          size="small"
          title={<Space><PaperClipOutlined /> Attachments ({ret.attachments?.length ?? 0})</Space>}
          styles={{ header: { backgroundColor: '#fafafa' } }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            {(ret.attachments ?? []).map((a) => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <a href={a.fileUrl} target="_blank" rel="noreferrer">{a.fileName}</a>
                <Popconfirm title="Remove this attachment?" onConfirm={() => handleDeleteAttachment(a.id)}>
                  <Button size="small" danger type="text" icon={<DeleteOutlined />} />
                </Popconfirm>
              </div>
            ))}
            <Upload beforeUpload={handleUploadAttachment} showUploadList={false} accept="image/*,application/pdf">
              <Button size="small" icon={<UploadOutlined />} loading={uploading}>
                Add photo / supporting document
              </Button>
            </Upload>
          </Space>
        </Card>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            {ret.notes && (
              <Card size="small" style={{ backgroundColor: '#fffbe6', border: '1px solid #ffe58f' }}>
                <Text strong>Notes: </Text>{ret.notes}
              </Card>
            )}
          </Col>
          <Col xs={24} md={12}>
            <Card size="small" title="Return Summary" styles={{ header: { backgroundColor: '#fff1f0' } }}>
              <Divider style={{ margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <Text strong style={{ fontSize: '16px' }}>Total Return Amount</Text>
                <Text strong style={{ fontSize: '18px', fontFamily: 'monospace', color: '#f5222d' }}>
                  {fmt(ret.totalReturnAmount)}
                </Text>
              </div>
              <div style={{ marginTop: 8, padding: '6px 8px', background: '#fff1f0', borderRadius: 4 }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {ret.status === 'completed'
                    ? "This amount has been debited from the supplier's outstanding balance."
                    : ret.status === 'pending_approval'
                    ? "This amount will be debited from the supplier's outstanding balance once approved."
                    : "This amount was not (or is no longer) debited from the supplier's outstanding balance."}
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      </Space>

      {/* Hidden print view */}
      <div style={{ display: 'none' }}>
        <PrintPurchaseReturn ref={printRef} ret={ret} />
      </div>

      <GRNJournalModal
        visible={journalOpen}
        grnId={ret.id}
        grnNumber={ret.returnNumber}
        title={`GL Journal — ${ret.returnNumber}`}
        fetchEntries={purchaseReturnService.getReturnJournal}
        onClose={() => setJournalOpen(false)}
      />

      <Modal
        open={rejectModalOpen}
        title="Reject Purchase Return"
        onCancel={() => setRejectModalOpen(false)}
        onOk={handleReject}
        okText="Reject Return"
        okButtonProps={{ danger: true, loading: busy }}
      >
        <Text type="secondary">Reason (optional)</Text>
        <TextArea
          rows={3}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Why is this return being rejected?"
          style={{ marginTop: 8 }}
        />
      </Modal>

      <Modal
        open={voidModalOpen}
        title="Void Purchase Return"
        onCancel={() => setVoidModalOpen(false)}
        onOk={handleVoid}
        okText="Void Return"
        okButtonProps={{ danger: true, loading: busy }}
      >
        <Text type="secondary">
          This reverses stock, the supplier balance and the GL entry raised for this return. A reason is required.
        </Text>
        <TextArea
          rows={3}
          value={voidReason}
          onChange={(e) => setVoidReason(e.target.value)}
          placeholder="Why is this return being voided?"
          style={{ marginTop: 8 }}
        />
      </Modal>
    </Modal>
  );
};

export default PurchaseReturnDetailsModal;
