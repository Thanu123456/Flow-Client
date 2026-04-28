import React, { useState, useEffect, useCallback } from 'react';
import {
  Input, Select, DatePicker, Space, Row, Col, message,
} from 'antd';
import {
  PlusOutlined, ReloadOutlined, FileExcelOutlined, FilePdfOutlined,
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

const PurchasesPage: React.FC = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const { grns, loading, error, pagination, listGRNs, getGRN } = usePurchaseStore();
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

  return (
    <>
    {contextHolder}
    <PageLayout
      title="Purchases (GRN)"
      actions={
        <Space>
          <CommonButton icon={<FilePdfOutlined style={{ color: "#FF0000" }} />} onClick={handleExportPDF} tooltip="Download PDF">PDF</CommonButton>
          <CommonButton icon={<FileExcelOutlined style={{ color: "#107C41" }} />} onClick={handleExportExcel} tooltip="Download Excel">Excel</CommonButton>
          <CommonButton icon={<ReloadOutlined style={{ color: "blue" }} />} onClick={handleRefresh}>Refresh</CommonButton>
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
        pagination={{
          page: pagination.page,
          perPage: pagination.perPage,
          total: pagination.total,
          totalPages: pagination.totalPages,
        }}
        onPageChange={(page, pageSize) => fetchGRNs(page, pageSize)}
      />

      <PurchaseDetailsModal
        visible={viewModalVisible}
        grn={selectedGRN}
        onClose={() => {
          setViewModalVisible(false);
          setSelectedGRN(null);
        }}
      />
    </PageLayout>
    </>
  );
};

export default PurchasesPage;
