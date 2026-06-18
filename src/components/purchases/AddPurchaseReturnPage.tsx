import React, { useState, useEffect } from 'react';
import {
  Card, Typography, Row, Col, Descriptions, Tag, Table, InputNumber,
  Input, Button, Space, message, Spin, Alert, Divider, Checkbox,
} from 'antd';
import {
  ArrowLeftOutlined, RollbackOutlined, ShopOutlined, CalendarOutlined,
  UserOutlined, WarningOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { purchaseService } from '../../services/transactions/purchaseService';
import { usePurchaseReturnStore } from '../../store/transactions/purchaseReturnStore';
import type { GRN, GRNItem } from '../../types/entities/purchase.types';
import type { CreatePurchaseReturnItemRequest } from '../../types/entities/purchaseReturn.types';
import PageLayout from '../common/PageLayout/PageLayout';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface ReturnLine {
  grnItemId: string;
  selected: boolean;
  returnQty: number;
  maxQty: number;
  reason: string;
}

const fmt = (n: number) =>
  `Rs. ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const AddPurchaseReturnPage: React.FC = () => {
  const { grnId } = useParams<{ grnId: string }>();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const { createReturn, submitting } = usePurchaseReturnStore();

  const [grn, setGrn] = useState<GRN | null>(null);
  const [loadingGrn, setLoadingGrn] = useState(true);
  const [lines, setLines] = useState<Record<string, ReturnLine>>({});
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!grnId) return;
    setLoadingGrn(true);
    purchaseService.getGRN(grnId)
      .then((data) => {
        setGrn(data);
        const initialLines: Record<string, ReturnLine> = {};
        data.items.forEach((item) => {
          const remaining = item.quantity - item.returnedQty;
          initialLines[item.id] = {
            grnItemId: item.id,
            selected: false,
            returnQty: Math.min(1, remaining),
            maxQty: remaining,
            reason: '',
          };
        });
        setLines(initialLines);
      })
      .catch(() => messageApi.error('Failed to load GRN details'))
      .finally(() => setLoadingGrn(false));
  }, [grnId]);

  const toggleSelect = (itemId: string, checked: boolean) => {
    setLines((prev) => ({ ...prev, [itemId]: { ...prev[itemId], selected: checked } }));
  };

  const setQty = (itemId: string, qty: number) => {
    setLines((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], returnQty: Math.max(1, Math.min(qty, prev[itemId].maxQty)) },
    }));
  };

  const setReason = (itemId: string, reason: string) => {
    setLines((prev) => ({ ...prev, [itemId]: { ...prev[itemId], reason } }));
  };

  const selectedLines = Object.values(lines).filter((l) => l.selected);

  const totalReturn = grn
    ? selectedLines.reduce((sum, l) => {
        const item = grn.items.find((i) => i.id === l.grnItemId);
        return sum + (item ? item.costPrice * l.returnQty : 0);
      }, 0)
    : 0;

  const handleSubmit = async () => {
    if (selectedLines.length === 0) {
      messageApi.warning('Please select at least one item to return.');
      return;
    }
    if (!grn) return;

    const items: CreatePurchaseReturnItemRequest[] = selectedLines.map((l) => ({
      grnItemId: l.grnItemId,
      returnQty: l.returnQty,
      reason: l.reason || undefined,
    }));

    try {
      const ret = await createReturn({ originalGrnId: grn.id, notes: notes || undefined, items });
      messageApi.success(`Return ${ret.returnNumber} created successfully`);
      setTimeout(() => navigate('/purchase-returns'), 800);
    } catch (err: any) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to create purchase return';
      messageApi.error(msg);
    }
  };

  const itemColumns = [
    {
      title: '',
      key: 'select',
      width: 40,
      render: (_: any, record: GRNItem) => {
        const fullyReturned = lines[record.id]?.maxQty <= 0;
        return (
          <Checkbox
            checked={lines[record.id]?.selected}
            disabled={fullyReturned}
            onChange={(e) => toggleSelect(record.id, e.target.checked)}
          />
        );
      },
    },
    {
      title: 'Product',
      key: 'product',
      render: (_: any, record: GRNItem) => (
        <div>
          <div style={{ fontWeight: 600 }}>{record.productName}</div>
          <Space size={4} style={{ marginTop: 2 }}>
            {record.productSKU && (
              <Text type="secondary" style={{ fontSize: 12 }}>SKU: {record.productSKU}</Text>
            )}
            {record.variationType && (
              <Tag color="blue-inverse" style={{ fontSize: 10 }}>{record.variationType.toUpperCase()}</Tag>
            )}
          </Space>
        </div>
      ),
    },
    {
      title: 'Original Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'right' as const,
      width: 110,
      render: (v: number, record: GRNItem) => (
        <div style={{ textAlign: 'right' }}>
          <Text>{v} {record.unitShortName || ''}</Text>
          {record.returnedQty > 0 && (
            <div>
              <Text type="danger" style={{ fontSize: 11 }}>Returned: {record.returnedQty}</Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Cost Price',
      dataIndex: 'costPrice',
      key: 'costPrice',
      align: 'right' as const,
      width: 110,
      render: (v: number) => (
        <Text style={{ fontFamily: 'monospace' }}>
          {v.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </Text>
      ),
    },
    {
      title: 'Return Qty',
      key: 'returnQty',
      width: 120,
      render: (_: any, record: GRNItem) => {
        const line = lines[record.id];
        if (line?.maxQty <= 0) {
          return <Tag color="default" style={{ fontSize: 11 }}>Fully Returned</Tag>;
        }
        return (
          <InputNumber
            min={1}
            max={line?.maxQty ?? record.quantity}
            value={line?.returnQty ?? 1}
            disabled={!line?.selected}
            onChange={(v) => setQty(record.id, v ?? 1)}
            style={{ width: 90 }}
            size="small"
          />
        );
      },
    },
    {
      title: 'Reason',
      key: 'reason',
      width: 200,
      render: (_: any, record: GRNItem) => (
        <Input
          placeholder="Optional reason"
          size="small"
          disabled={!lines[record.id]?.selected}
          value={lines[record.id]?.reason}
          onChange={(e) => setReason(record.id, e.target.value)}
        />
      ),
    },
    {
      title: 'Return Total',
      key: 'returnTotal',
      align: 'right' as const,
      width: 120,
      render: (_: any, record: GRNItem) => {
        const line = lines[record.id];
        if (!line?.selected) return <Text type="secondary">-</Text>;
        const total = record.costPrice * line.returnQty;
        return (
          <Text strong style={{ fontFamily: 'monospace', color: '#f5222d' }}>
            {total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
        );
      },
    },
  ];

  if (loadingGrn) {
    return (
      <PageLayout title="Create Purchase Return">
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <Spin size="large" />
        </div>
      </PageLayout>
    );
  }

  if (!grn) {
    return (
      <PageLayout title="Create Purchase Return">
        <Alert type="error" message="GRN not found" />
      </PageLayout>
    );
  }

  return (
    <>
      {contextHolder}
      <PageLayout
        title="Create Purchase Return"
        actions={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>Back</Button>
          </Space>
        }
      >
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          {/* Original GRN Summary */}
          <Card
            size="small"
            title={<Space><ShopOutlined /> Original GRN Details</Space>}
            styles={{ header: { backgroundColor: '#f0f5ff' } }}
          >
            <Descriptions size="small" column={{ xs: 1, sm: 2, md: 4 }} bordered>
              <Descriptions.Item label="GRN Number">
                <Text style={{ fontFamily: 'monospace', color: '#1890ff', fontWeight: 600 }}>
                  {grn.grnNumber}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Supplier">
                <Text strong>{grn.supplierName}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Warehouse">{grn.warehouseName}</Descriptions.Item>
              <Descriptions.Item label="GRN Date">
                <Space><CalendarOutlined />{dayjs(grn.grnDate).format('DD MMM YYYY')}</Space>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Alert
            type="info"
            icon={<WarningOutlined />}
            showIcon
            message="Select the items you want to return and enter the quantity. Stock will be reduced and the supplier's outstanding balance will be updated."
          />

          {/* Item Selection Table */}
          <Card
            size="small"
            title={
              <Space>
                <RollbackOutlined style={{ color: '#f5222d' }} />
                Select Items to Return
                {selectedLines.length > 0 && (
                  <Tag color="red">{selectedLines.length} selected</Tag>
                )}
              </Space>
            }
          >
            <Table
              columns={itemColumns}
              dataSource={grn.items}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ x: 800 }}
              rowClassName={(record: GRNItem) => {
                if (lines[record.id]?.maxQty <= 0) return 'ant-table-row-disabled';
                return lines[record.id]?.selected ? 'bg-red-50' : '';
              }}
            />
          </Card>

          {/* Notes + Summary */}
          <Row gutter={16}>
            <Col xs={24} md={14}>
              <Card size="small" title="Return Notes (optional)">
                <TextArea
                  rows={3}
                  placeholder="Add notes about this return..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Card>
            </Col>
            <Col xs={24} md={10}>
              <Card
                size="small"
                title="Return Summary"
                styles={{ header: { backgroundColor: '#fff1f0' } }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">Items Selected</Text>
                    <Text strong>{selectedLines.length}</Text>
                  </div>
                  <Divider style={{ margin: '4px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong style={{ fontSize: 16 }}>Total Return Amount</Text>
                    <Text strong style={{ fontSize: 18, color: '#f5222d', fontFamily: 'monospace' }}>
                      {fmt(totalReturn)}
                    </Text>
                  </div>
                  <div style={{ padding: '6px 8px', background: '#fff1f0', borderRadius: 4, marginTop: 4 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      This amount will be debited from <Text strong>{grn.supplierName}</Text>'s outstanding balance.
                    </Text>
                  </div>
                </div>

                <Button
                  type="primary"
                  danger
                  block
                  size="large"
                  icon={<RollbackOutlined />}
                  style={{ marginTop: 16 }}
                  loading={submitting}
                  disabled={selectedLines.length === 0}
                  onClick={handleSubmit}
                >
                  Process Return
                </Button>
              </Card>
            </Col>
          </Row>
        </Space>
      </PageLayout>
    </>
  );
};

export default AddPurchaseReturnPage;
