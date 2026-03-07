import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Input, Button, Select, DatePicker, Space, Row, Col, message, Tooltip,
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
import { useDebounce } from '../../hooks/ui/useDebounce';

const { Search } = Input;
const { RangePicker } = DatePicker;

const PurchasesPage: React.FC = () => {
  const navigate = useNavigate();
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

  const debouncedSearch = useDebounce(searchText, 300);

  const fetchGRNs = useCallback(
    async (page = 1, perPage = 10) => {
      await listGRNs({
        page,
        perPage,
        search: debouncedSearch || undefined,
        paymentMethod: paymentFilter || undefined,
        status: statusFilter || undefined,
        warehouseId: warehouseFilter || undefined,
        dateFrom: dateRange ? dateRange[0] : undefined,
        dateTo: dateRange ? dateRange[1] : undefined,
      });
    },
    [listGRNs, debouncedSearch, paymentFilter, statusFilter, warehouseFilter, dateRange]
  );

  // Load warehouses once on mount
  useEffect(() => {
    getAllWarehouses().then((whs) => setWarehouses(whs));
  }, []);

  // Fetch GRNs on mount and whenever filters change (same pattern as SuppliersPage/CustomersPage)
  useEffect(() => {
    fetchGRNs(1, pagination.perPage);
  }, [debouncedSearch, paymentFilter, statusFilter, warehouseFilter, dateRange]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const handleRefresh = () => {
    setSearchText('');
    setPaymentFilter('');
    setStatusFilter('');
    setWarehouseFilter('');
    setDateRange(null);
    listGRNs({ page: 1, perPage: 10 });
  };

  const handleView = async (grn: GRNListItem) => {
    setLoadingDetail(true);
    try {
      const full = await getGRN(grn.id);
      setSelectedGRN(full);
      setViewModalVisible(true);
    } catch {
      message.error('Failed to load GRN details');
    } finally {
      setLoadingDetail(false);
    }
  };

  const buildExportParams = () => ({
    page: 1,
    perPage: 1000,
    search: searchText || undefined,
    paymentMethod: paymentFilter || undefined,
    status: statusFilter || undefined,
    warehouseId: warehouseFilter || undefined,
    dateFrom: dateRange ? dateRange[0] : undefined,
    dateTo: dateRange ? dateRange[1] : undefined,
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
      message.error('Failed to export PDF');
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
      message.error('Failed to export Excel');
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Row gutter={[12, 12]} style={{ marginBottom: 16 }} align="middle">
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
          <Col xs={24} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Space wrap>
              <Tooltip title="Export PDF">
                <Button icon={<FilePdfOutlined />} onClick={handleExportPDF}>PDF</Button>
              </Tooltip>
              <Tooltip title="Export Excel">
                <Button icon={<FileExcelOutlined />} onClick={handleExportExcel}>Excel</Button>
              </Tooltip>
              <Button icon={<ReloadOutlined />} onClick={handleRefresh}>Refresh</Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/purchases/add')}>
                Add Purchase
              </Button>
            </Space>
          </Col>
        </Row>

        <PurchasesTable
          data={grns}
          loading={loading || loadingDetail}
          onView={handleView}
          pagination={{
            current: pagination.page,
            pageSize: pagination.perPage,
            total: pagination.total,
            onChange: (page, pageSize) => fetchGRNs(page, pageSize),
          }}
        />
      </Card>

      <PurchaseDetailsModal
        visible={viewModalVisible}
        grn={selectedGRN}
        onClose={() => {
          setViewModalVisible(false);
          setSelectedGRN(null);
        }}
      />
    </div>
  );
};

export default PurchasesPage;
