import React, { useState, useEffect, useCallback } from 'react';
import {
  Input, Select, DatePicker, Space, Row, Col, message,
  Modal, Form, InputNumber, Typography, Divider, Descriptions, Tag, Button,
} from 'antd';
import {
  PlusOutlined, ReloadOutlined, FileExcelOutlined, FilePdfOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { usePurchaseStore } from '../../store/transactions/purchaseStore';
import { purchaseService } from '../../services/transactions/purchaseService';
import { useWarehouseStore } from '../../store/management/warehouseStore';
import PurchasesTable from './PurchasesTable';
import PurchaseDetailsModal from './PurchaseDetailsModal';
import type { GRN, GRNListItem } from '../../types/entities/purchase.types';
import PageLayout from '../common/PageLayout/PageLayout';
import { CommonButton } from '../common/Button';

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Text } = Typography;

const fmt = (n: number) =>
  `Rs. ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const PurchasesPage: React.FC = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const { grns, loading, error, pagination, listGRNs, getGRN, completeGRN } = usePurchaseStore();
  const { getAllWarehouses } = useWarehouseStore();

  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);
  const [searchText, setSearchText] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedGRN, setSelectedGRN] = useState<GRN | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // ── Complete Draft GRN modal state ───────────────────────
  const [completeDraftVisible, setCompleteDraftVisible] = useState(false);
  const [completingGRN, setCompletingGRN] = useState<GRN | null>(null);
  const [completeDiscount, setCompleteDiscount] = useState(0);
  const [completePaid, setCompletePaid] = useState(0);
  const [completeDebit, setCompleteDebit] = useState(0);
  const [completeChequeNumber, setCompleteChequeNumber] = useState('');
  const [completeChequeDate, setCompleteChequeDate] = useState('');
  const [completeChequeNote, setCompleteChequeNote] = useState('');
  const [completing, setCompleting] = useState(false);

  const fetchGRNs = useCallback(
    (page = 1, perPage = 10) => listGRNs({
      page,
      perPage,
      search: searchText,
      paymentMethod: paymentFilter || undefined,
      status: statusFilter || undefined,
      warehouseId: warehouseFilter || undefined,
      dateFrom: dateRange?.[0],
      dateTo: dateRange?.[1],
    }),
    [listGRNs, searchText, paymentFilter, statusFilter, warehouseFilter, dateRange]
  );

  useEffect(() => {
    fetchGRNs();
  }, [fetchGRNs]);

  useEffect(() => {
    getAllWarehouses().then((data) => {
      if (data) setWarehouses(data.map((w: any) => ({ id: w.id, name: w.name })));
    });
  }, [getAllWarehouses]);

  useEffect(() => {
    if (error) {
      messageApi.error(error);
    }
  }, [error]);

  const handleRefresh = () => fetchGRNs(pagination.page, pagination.perPage);

  const handleView = async (record: GRNListItem) => {
    setLoadingDetail(true);
    try {
      const data = await getGRN(record.id);
      if (data) setSelectedGRN(data);
      setViewModalVisible(true);
    } catch {
      messageApi.error('Failed to load GRN details');
    } finally {
      setLoadingDetail(false);
    }
  };

  // ── Open complete-draft modal ────────────────────────────
  const handleEdit = async (record: GRNListItem) => {
    setLoadingDetail(true);
    try {
      const data = await getGRN(record.id);
      setCompletingGRN(data);
      setCompleteDiscount(data.discountAmount || 0);
      setCompletePaid(data.paidAmount || 0);
      setCompleteDebit(data.debitBalanceUsed || 0);
      setCompleteChequeNumber(data.chequeNumber || '');
      setCompleteChequeDate(data.chequeDate || '');
      setCompleteChequeNote(data.chequeNote || '');
      setCompleteDraftVisible(true);
    } catch {
      messageApi.error('Failed to load GRN details');
    } finally {
      setLoadingDetail(false);
    }
  };

  // ── Complete the draft GRN ───────────────────────────────
  const handleCompleteFromList = async () => {
    if (!completingGRN) return;

    if (completingGRN.paymentMethod === 'cheque' && !completeChequeNumber.trim()) {
      messageApi.error('Cheque number is required');
      return;
    }

    setCompleting(true);
    try {
      await completeGRN(completingGRN.id, {
        discountAmount: completeDiscount || 0,
        paidAmount: completePaid,
        debitBalanceUsed: completeDebit || 0,
        chequeNumber: completeChequeNumber.trim() || undefined,
        chequeDate: completeChequeDate || undefined,
        chequeNote: completeChequeNote.trim() || undefined,
      });
      messageApi.success('GRN completed successfully!');
      setCompleteDraftVisible(false);
      setCompletingGRN(null);
      handleRefresh();
    } catch (err: any) {
      const errMsg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to complete GRN';
      messageApi.error(errMsg);
    } finally {
      setCompleting(false);
    }
  };

  const buildExportParams = () => ({
    page: 1,
    perPage: 1000,
    search: searchText,
    paymentMethod: paymentFilter || undefined,
    status: statusFilter || undefined,
    warehouseId: warehouseFilter || undefined,
    dateFrom: dateRange?.[0],
    dateTo: dateRange?.[1],
  });

  const handleExportPDF = async () => {
    try {
      const blob = await purchaseService.exportToPDF(buildExportParams());
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `purchases-${dayjs().format('YYYY-MM-DD')}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      messageApi.error('Failed to export PDF');
    }
  };

  const handleExportExcel = async () => {
    try {
      const blob = await purchaseService.exportToExcel(buildExportParams());
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `purchases-${dayjs().format('YYYY-MM-DD')}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      messageApi.error('Failed to export Excel');
    }
  };

  // Derived for complete-draft modal
  const completeNetAmount = Math.max(0, (completingGRN?.totalAmount || 0) - completeDiscount);

  return (
    <>
    {contextHolder}
    <PageLayout
      title="Purchases (GRN)"
      actions={
        <Space>
          <CommonButton icon={<FilePdfOutlined style={{ color: '#FF0000' }} />} onClick={handleExportPDF} tooltip="Download PDF">PDF</CommonButton>
          <CommonButton icon={<FileExcelOutlined style={{ color: '#107C41' }} />} onClick={handleExportExcel} tooltip="Download Excel">Excel</CommonButton>
          <CommonButton icon={<ReloadOutlined style={{ color: 'blue' }} />} onClick={handleRefresh}>Refresh</CommonButton>
          <CommonButton type="primary" icon={<PlusOutlined />} onClick={() => navigate('/purchases/add')}>
            Add Purchase
          </CommonButton>
        </Space>
      }
    >
      <div style={{ marginBottom: 16 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="Search GRN number, supplier..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Payment"
              value={paymentFilter || undefined}
              onChange={setPaymentFilter}
              allowClear
              options={[
                { value: 'cash', label: 'Cash' },
                { value: 'cheque', label: 'Cheque' },
                { value: 'credit', label: 'Credit' },
              ]}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Status"
              value={statusFilter || undefined}
              onChange={setStatusFilter}
              allowClear
              options={[
                { value: 'draft', label: 'Draft' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Warehouse"
              value={warehouseFilter || undefined}
              onChange={setWarehouseFilter}
              allowClear
              options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <RangePicker
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
              value={dateRange ? [dayjs(dateRange[0]), dayjs(dateRange[1])] : null}
              onChange={(_, strings) => {
                const [from, to] = strings as [string, string];
                setDateRange(from && to ? [from, to] : null);
              }}
              allowClear
            />
          </Col>
        </Row>
      </div>

      <PurchasesTable
        data={grns}
        loading={loading || loadingDetail}
        onView={handleView}
        onEdit={handleEdit}
        pagination={{
          page: pagination.page,
          perPage: pagination.perPage,
          total: pagination.total,
          totalPages: pagination.totalPages,
        }}
        onPageChange={(page, pageSize) => fetchGRNs(page, pageSize)}
      />

      {/* View Details Modal */}
      <PurchaseDetailsModal
        visible={viewModalVisible}
        grn={selectedGRN}
        onClose={() => {
          setViewModalVisible(false);
          setSelectedGRN(null);
        }}
      />

      {/* Complete Draft GRN Modal */}
      <Modal
        open={completeDraftVisible}
        title={`Complete GRN — ${completingGRN?.grnNumber ?? ''}`}
        onCancel={() => {
          if (!completing) {
            setCompleteDraftVisible(false);
            setCompletingGRN(null);
          }
        }}
        footer={[
          <Button key="cancel" onClick={() => { setCompleteDraftVisible(false); setCompletingGRN(null); }} disabled={completing}>
            Cancel
          </Button>,
          <Button
            key="complete"
            type="primary"
            icon={<CheckCircleOutlined />}
            loading={completing}
            onClick={handleCompleteFromList}
          >
            Complete GRN
          </Button>,
        ]}
        width={540}
        maskClosable={false}
      >
        {completingGRN && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* GRN Info */}
            <Descriptions size="small" bordered column={2}>
              <Descriptions.Item label="Warehouse">{completingGRN.warehouseName}</Descriptions.Item>
              <Descriptions.Item label="Supplier">
                {completingGRN.supplierName || <Text type="secondary">Walk-in</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="Items">{completingGRN.itemCount}</Descriptions.Item>
              <Descriptions.Item label="Payment">
                <Tag color={completingGRN.paymentMethod === 'cash' ? 'blue' : completingGRN.paymentMethod === 'cheque' ? 'purple' : 'orange'}>
                  {completingGRN.paymentMethod.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Total Amount" span={2}>
                <Text strong style={{ fontFamily: 'monospace', color: '#1890ff' }}>
                  {fmt(completingGRN.totalAmount)}
                </Text>
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '0' }} />

            {/* Payment form */}
            <Row gutter={[16, 12]}>
              <Col xs={24} sm={12}>
                <Form.Item label="Discount" style={{ marginBottom: 0 }}>
                  <InputNumber
                    min={0}
                    max={completingGRN.totalAmount}
                    value={completeDiscount}
                    onChange={(v) => setCompleteDiscount(v ?? 0)}
                    prefix="Rs."
                    precision={2}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', marginTop: 4 }}>
                  <Text style={{ fontWeight: 700 }}>Net Amount:</Text>
                  <Text strong style={{ fontFamily: 'monospace', color: '#1890ff' }}>
                    {fmt(completeNetAmount)}
                  </Text>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Paid Amount" style={{ marginBottom: 0 }}>
                  <InputNumber
                    min={0}
                    value={completePaid}
                    onChange={(v) => setCompletePaid(v ?? 0)}
                    prefix="Rs."
                    precision={2}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              {completingGRN.paymentMethod === 'cheque' && (
                <>
                  <Col xs={24}>
                    <Divider orientation="left" style={{ margin: '4px 0' }}>Cheque Details</Divider>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Cheque Number *" style={{ marginBottom: 0 }}>
                      <Input
                        value={completeChequeNumber}
                        onChange={(e) => setCompleteChequeNumber(e.target.value)}
                        placeholder="Enter cheque number"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Due Date" style={{ marginBottom: 0 }}>
                      <DatePicker
                        style={{ width: '100%' }}
                        value={completeChequeDate ? dayjs(completeChequeDate) : null}
                        onChange={(_, dateStr) => setCompleteChequeDate(dateStr as string)}
                        format="YYYY-MM-DD"
                        placeholder="Optional due date"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item label="Note" style={{ marginBottom: 0 }}>
                      <Input
                        value={completeChequeNote}
                        onChange={(e) => setCompleteChequeNote(e.target.value)}
                        placeholder="Optional note"
                      />
                    </Form.Item>
                  </Col>
                </>
              )}
            </Row>
          </div>
        )}
      </Modal>
    </PageLayout>
    </>
  );
};

export default PurchasesPage;
