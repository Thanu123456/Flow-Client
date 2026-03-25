import React, { useRef } from 'react';
import { Modal, Descriptions, Tag, Table, Divider, Button, Space, Typography, Card, Row, Col, Tooltip } from 'antd';
import { PrinterOutlined, FileTextOutlined, ShopOutlined, UserOutlined, CalendarOutlined, BankOutlined } from '@ant-design/icons';
import type { GRN, GRNItem, GRNStatus, PaymentMethod } from '../../types/entities/purchase.types';
import dayjs from 'dayjs';
import PrintGRN from './PrintGRN';

const { Text, Title } = Typography;

interface Props {
  visible: boolean;
  grn: GRN | null;
  onClose: () => void;
}

const statusColor: Record<GRNStatus, string> = {
  draft: 'default',
  completed: 'green',
  cancelled: 'red',
};

const paymentColor: Record<PaymentMethod, string> = {
  cash: 'blue',
  cheque: 'purple',
  credit: 'orange',
};

const fmt = (n: number) =>
  `Rs. ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const PurchaseDetailsModal: React.FC<Props> = ({ visible, grn, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!grn) return null;

  const handlePrint = () => {
    if (!printRef.current) return;
    const content = printRef.current.innerHTML;
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>GRN - ${grn?.grnNumber}</title>
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

  const itemColumns = [
    {
      title: '#',
      key: 'idx',
      width: 50,
      align: 'center' as const,
      render: (_: any, __: GRNItem, idx: number) => <Text type="secondary">{idx + 1}</Text>,
    },
    {
      title: 'Product Information',
      key: 'product',
      width: 280, // Set a base width to control wrapping
      render: (_: any, record: GRNItem) => (
        <div style={{ maxWidth: '280px' }}>
          <Typography.Paragraph 
            ellipsis={{ rows: 2, tooltip: { title: record.productName, placement: 'topLeft' } }} 
            style={{ fontWeight: 600, fontSize: '14.5px', marginBottom: 4, lineHeight: '1.3' }}
          >
            {record.productName}
          </Typography.Paragraph>
          <Space split={<Divider type="vertical" />} style={{ fontSize: '12px', color: '#8c8c8c' }}>
            {record.productSKU && (
              <span title="Product SKU" style={{ display: 'inline-flex', alignItems: 'center' }}>
                <Text type="secondary">SKU: </Text>
                <Text strong style={{ marginLeft: 4 }}>{record.productSKU}</Text>
              </span>
            )}
            {record.variationType && (
              <Tag color="blue-inverse" style={{ margin: 0, fontSize: '10px', fontWeight: 700, borderRadius: '4px' }}>
                {record.variationType.toUpperCase()}
              </Tag>
            )}
          </Space>
        </div>
      ),
    },
    {
      title: 'Qty',
      key: 'quantity',
      align: 'right' as const,
      width: 100,
      render: (_: any, record: GRNItem) => (
        <Space direction="vertical" size={0} align="end">
          <Text strong>{record.quantity}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.unitShortName || record.unitName || '-'}</Text>
        </Space>
      ),
    },
    {
      title: 'Unit Cost',
      dataIndex: 'costPrice',
      key: 'costPrice',
      align: 'right' as const,
      width: 120,
      render: (v: number) => (
        <Text style={{ fontFamily: 'monospace' }}>
          {v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      ),
    },
    {
      title: 'Net Amount',
      dataIndex: 'netPrice',
      key: 'netPrice',
      align: 'right' as const,
      width: 130,
      render: (v: number) => (
        <Text strong style={{ fontFamily: 'monospace', color: '#1890ff' }}>
          {v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      ),
    },
    {
      title: 'Expiry',
      key: 'expiry',
      width: 120,
      align: 'center' as const,
      render: (_: any, r: GRNItem) => {
        if (!r.expiryDate) return <Text type="secondary" disabled>-</Text>;
        const diff = dayjs(r.expiryDate).diff(dayjs(), 'month');
        const color = diff < 0 ? 'volcano' : diff < 6 ? 'red' : diff < 12 ? 'orange' : 'green';
        return <Tag color={color} style={{ borderRadius: '12px' }}>{dayjs(r.expiryDate).format('DD MMM YYYY')}</Tag>;
      },
    },
    {
      title: 'S/N',
      key: 'serial',
      width: 70,
      align: 'center' as const,
      render: (_: any, r: GRNItem) =>
        r.hasSerialNumbers ? (
          <Tooltip title={`${r.serialNumbers?.length || 0} Serial Numbers`}>
            <Tag color="cyan" style={{ borderRadius: '12px', cursor: 'pointer' }}>
              {r.serialNumbers?.length || 0}
            </Tag>
          </Tooltip>
        ) : (
          <Text type="secondary" disabled>-</Text>
        ),
    },
  ];

  return (
    <>
      <Modal
        open={visible}
        onCancel={onClose}
        width={1000}
        style={{ top: 20 }}
        closable={true}
        title={
          <div style={{
            background: 'linear-gradient(90deg, #f0f5ff 0%, #ffffff 100%)',
            padding: '20px 24px',
            margin: '-20px -24px 0 -24px',
            borderBottom: '1px solid #f0f0f0',
            borderRadius: '8px 8px 0 0',
          }}>
            <Row justify="space-between" align="middle" style={{ paddingRight: '40px' }}>
              <Col>
                <Space direction="vertical" size={0}>
                  <Space>
                    <FileTextOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
                    <Title level={4} style={{ margin: 0 }}>Goods Received Note</Title>
                    <Tag color={statusColor[grn.status]} style={{ borderRadius: '12px', padding: '0 12px' }}>
                      {grn.status.toUpperCase()}
                    </Tag>
                  </Space>
                  <Text type="secondary" style={{ fontSize: '13px' }}>
                    GRN # <Text strong style={{ color: '#000' }}>{grn.grnNumber}</Text>
                  </Text>
                </Space>
              </Col>
              <Col style={{ textAlign: 'right' }}>
                <div style={{ color: '#8c8c8c', fontSize: '12px', marginBottom: 2 }}>Net Amount</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#1890ff' }}>
                  {fmt(grn.netAmount)}
                </div>
              </Col>
            </Row>
          </div>
        }
        footer={[
          <div key="footer-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>Generated on {dayjs(grn.createdAt).format('DD MMM YYYY HH:mm')}</Text>
            <Space>
              <Button icon={<PrinterOutlined />} onClick={handlePrint}>
                Print GRN
              </Button>
              <Button onClick={onClose} type="primary">
                Close
              </Button>
            </Space>
          </div>
        ]}
      >
        {/* Info Stack */}
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          {/* Section 1: General Details */}
          <Card size="small" title={<Space><ShopOutlined /> General Details</Space>} headStyle={{ backgroundColor: '#fafafa' }}>
            <Descriptions size="small" column={{ xs: 1, sm: 2, md: 3 }} bordered>
              <Descriptions.Item label="GRN Date">
                <Space><CalendarOutlined style={{ color: '#8c8c8c' }} /> {dayjs(grn.grnDate).format('DD MMM YYYY')}</Space>
              </Descriptions.Item>
              <Descriptions.Item label="Warehouse">{grn.warehouseName}</Descriptions.Item>
              <Descriptions.Item label="Supplier">
                {grn.supplierName ? (
                  <Text strong>{grn.supplierName}</Text>
                ) : (
                  <Tag color="default">Walk-in Purchase</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Created By">
                <Space><UserOutlined style={{ color: '#8c8c8c' }} /> {grn.createdByName}</Space>
              </Descriptions.Item>
              <Descriptions.Item label="Payment Method">
                <Tag color={paymentColor[grn.paymentMethod]} style={{ margin: 0, borderRadius: '4px' }}>
                  {grn.paymentMethod.toUpperCase()}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Section 2: Purchase Items */}
          <div style={{ background: '#fff', borderRadius: '8px' }}>
            <div style={{ padding: '0 0 16px 0', borderBottom: '1px solid #f0f0f0', marginBottom: 16 }}>
              <Title level={5} style={{ margin: 0 }}>
                <Space><FileTextOutlined style={{ color: '#1890ff' }} /> Purchase Items ({grn.itemCount})</Space>
              </Title>
            </div>
            <Table
              columns={itemColumns}
              dataSource={grn.items}
              rowKey="id"
              pagination={false}
              size="small"
              bordered
              scroll={{ x: 800 }}
              expandable={{
                expandedRowRender: (record: GRNItem) =>
                  record.hasSerialNumbers && record.serialNumbers && record.serialNumbers.length > 0 ? (
                    <div style={{ padding: '12px 24px', backgroundColor: '#fafafa', borderRadius: '4px' }}>
                      <div style={{ marginBottom: 8, fontWeight: 600 }}>Serial Numbers</div>
                      <Space wrap>
                        {record.serialNumbers.map((sn) => (
                          <Tag key={sn} color="blue" style={{ borderRadius: '4px' }}>
                            {sn}
                          </Tag>
                        ))}
                      </Space>
                    </div>
                  ) : null,
                rowExpandable: (record: GRNItem) =>
                  record.hasSerialNumbers && (record.serialNumbers?.length ?? 0) > 0,
              }}
            />
          </div>

          {/* Section 3: Summary & Notes */}
          <Row gutter={24}>
            <Col xs={24} md={12}>
              {grn.notes && (
                <div style={{ height: '100%' }}>
                  <Text strong>Notes: </Text>
                  <Card size="small" style={{ marginTop: 8, backgroundColor: '#fffbe6', border: '1px solid #ffe58f', height: 'calc(100% - 30px)' }}>
                    {grn.notes}
                  </Card>
                </div>
              )}
            </Col>
            <Col xs={24} md={12}>
              <Card size="small" title={<Space><BankOutlined /> Payment Summary</Space>} headStyle={{ backgroundColor: '#f6f6f6' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifySelf: 'flex-end', justifyContent: 'space-between' }}>
                    <Text type="secondary">Sub Total</Text>
                    <Text style={{ fontFamily: 'monospace' }}>{fmt(grn.totalAmount)}</Text>
                  </div>

                  {grn.discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text type="secondary">Discount</Text>
                      <Text type="success" style={{ fontFamily: 'monospace' }}>- {fmt(grn.discountAmount)}</Text>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '2px solid #f0f0f0', borderBottom: '2px solid #f0f0f0', margin: '4px 0' }}>
                    <Text strong style={{ fontSize: '16px' }}>Net Total</Text>
                    <Text strong style={{ fontSize: '18px', fontFamily: 'monospace', color: '#1890ff' }}>{fmt(grn.netAmount)}</Text>
                  </div>

                  {grn.debitBalanceUsed > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text type="secondary">Debit Balance Used</Text>
                      <Text style={{ fontFamily: 'monospace' }}>{fmt(grn.debitBalanceUsed)}</Text>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong>Paid Amount</Text>
                    <Text strong style={{ color: '#52c41a', fontFamily: 'monospace' }}>{fmt(grn.paidAmount)}</Text>
                  </div>

                  {grn.creditAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: '#fff1f0', borderRadius: '4px', marginTop: 4 }}>
                      <Text type="danger" strong>Balance Due</Text>
                      <Text type="danger" strong style={{ fontFamily: 'monospace', fontSize: '16px' }}>{fmt(grn.creditAmount)}</Text>
                    </div>
                  )}
                </div>
              </Card>

              {grn.paymentMethod === 'cheque' && grn.chequeNumber && (
                <Card size="small" title={<Space><BankOutlined /> Cheque Details</Space>} headStyle={{ backgroundColor: '#f6f6f6' }} style={{ marginTop: 16 }}>
                  <Descriptions size="small" column={1}>
                    <Descriptions.Item label="Number"><Text strong>{grn.chequeNumber}</Text></Descriptions.Item>
                    <Descriptions.Item label="Date">{dayjs(grn.chequeDate).format('DD MMM YYYY')}</Descriptions.Item>
                    {grn.isPostDated && <Descriptions.Item label=""><Tag color="orange">Post-dated</Tag></Descriptions.Item>}
                    {grn.pendingChequeAmount > 0 && (
                      <Descriptions.Item label="Pending">
                        <Text type="warning" strong>{fmt(grn.pendingChequeAmount)}</Text>
                      </Descriptions.Item>
                    )}
                    {grn.chequeNote && (
                      <Descriptions.Item label="Note" span={1}>{grn.chequeNote}</Descriptions.Item>
                    )}
                  </Descriptions>
                </Card>
              )}
            </Col>
          </Row>
        </Space>
      </Modal>

      {/* Hidden print view */}
      <div style={{ display: 'none' }}>
        <PrintGRN ref={printRef} grn={grn} />
      </div>
    </>
  );
};

export default PurchaseDetailsModal;
