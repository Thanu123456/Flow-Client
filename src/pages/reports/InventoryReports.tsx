import React, { useCallback, useEffect, useState } from 'react';
import {
  Card, Table, Typography, Space, Input, Select, Switch, InputNumber,
  Spin, Empty, message, Tag, Modal, Descriptions, DatePicker,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import dayjs from 'dayjs';
import { ReloadOutlined, FileZipOutlined } from '@ant-design/icons';
import { CommonButton } from '../../components/common/Button';
import PeriodFilter from '../../components/reports/shared/PeriodFilter';
import type { PeriodFilterValue } from '../../components/reports/shared/PeriodFilter';
import KPIStatRow from '../../components/reports/shared/KPIStatRow';
import ReportViewToggle from '../../components/reports/shared/ReportViewToggle';
import ExportButtons from '../../components/reports/shared/ExportButtons';
import { stockReportService } from '../../services/reports/stockReportService';
import { categoryService } from '../../services/management/categoryService';
import { downloadBlob } from '../../utils/downloadBlob';
import type {
  StockListResponse, StockListItem, ProductStockDetail, StockAnalyticsResponse,
  StockAlertItem, BatchExportItem, BatchExportFilter,
} from '../../types/entities/report.types';
import type { Category } from '../../types/entities/category.types';

const { Title, Text } = Typography;

const fmt = (n: number) => `LKR ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Colour-codes a stock status string ("In Stock" / "Low Stock" / "Out of Stock") by substring match. */
const statusColor = (status: string): string => {
  const s = (status || '').toLowerCase();
  if (s.includes('out')) return 'red';
  if (s.includes('low')) return 'orange';
  return 'green';
};

const HEALTH_COLORS = { in_stock: '#52c41a', low_stock: '#faad14', out_of_stock: '#ff4d4f' };

const InventoryReports: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<StockListResponse | null>(null);
  const [analytics, setAnalytics] = useState<StockAnalyticsResponse | null>(null);
  const [view, setView] = useState('List');

  // List filters
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [zeroStockOnly, setZeroStockOnly] = useState(false);
  const [threshold, setThreshold] = useState(20);
  const [categories, setCategories] = useState<Category[]>([]);

  // Analytics: period only feeds the Top Selling Products chart
  const [topSellingPeriod, setTopSellingPeriod] = useState<PeriodFilterValue | null>(null);

  // Product detail popup
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState<ProductStockDetail | null>(null);

  // Batch / full stock export dialog
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchDateFilterType, setBatchDateFilterType] = useState<'none' | 'expiry' | 'received'>('none');
  const [batchDateFrom, setBatchDateFrom] = useState<string | undefined>(undefined);
  const [batchDateTo, setBatchDateTo] = useState<string | undefined>(undefined);
  const [batchStockFilter, setBatchStockFilter] = useState<'all' | 'exclude_zero' | 'only_zero'>('all');
  const [batchItems, setBatchItems] = useState<BatchExportItem[]>([]);

  useEffect(() => {
    categoryService.getAllCategories().then(setCategories).catch(() => {});
  }, []);

  const currentListFilter = {
    search: search || undefined,
    category_id: categoryId,
    zero_stock: zeroStockOnly,
    threshold,
  };

  const currentAnalyticsFilter = {
    date_from: topSellingPeriod?.dateFrom,
    date_to: topSellingPeriod?.dateTo,
    threshold,
  };

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const data = await stockReportService.getStockList(currentListFilter);
      setList(data);
    } catch {
      message.error('Failed to load stock report');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, categoryId, zeroStockOnly, threshold]);

  const loadAnalytics = useCallback(async () => {
    if (!topSellingPeriod) return;
    setLoading(true);
    try {
      const data = await stockReportService.getAnalytics(currentAnalyticsFilter);
      setAnalytics(data);
    } catch {
      message.error('Failed to load stock analytics');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topSellingPeriod, threshold]);

  useEffect(() => {
    if (view === 'List') loadList();
  }, [view, loadList]);

  useEffect(() => {
    if (view === 'Analytics') loadAnalytics();
  }, [view, loadAnalytics]);

  const handleExportExcel = async () => {
    const blob = await stockReportService.exportExcel({ ...currentListFilter, ...currentAnalyticsFilter });
    downloadBlob(blob, `Stock-Report-${dayjs().format('YYYY-MM-DD-HHmm')}.xlsx`);
  };

  const handleExportPdf = async () => {
    const blob = await stockReportService.exportPdf({ ...currentListFilter, ...currentAnalyticsFilter });
    downloadBlob(blob, `Stock-Report-${dayjs().format('YYYY-MM-DD-HHmm')}.pdf`);
  };

  const openDetail = async (productId: string) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const data = await stockReportService.getProductDetail(productId);
      setDetailData(data);
    } catch {
      message.error('Failed to load product detail');
    } finally {
      setDetailLoading(false);
    }
  };

  const batchFilter: BatchExportFilter = {
    date_filter_type: batchDateFilterType,
    date_from: batchDateFilterType !== 'none' ? batchDateFrom : undefined,
    date_to: batchDateFilterType !== 'none' ? batchDateTo : undefined,
    stock_filter: batchStockFilter,
    threshold,
  };

  const handleBatchPreview = async () => {
    setBatchLoading(true);
    try {
      const data = await stockReportService.getBatchExport(batchFilter);
      setBatchItems(data);
    } catch {
      message.error('Failed to load batch export preview');
    } finally {
      setBatchLoading(false);
    }
  };

  const handleBatchExportExcel = async () => {
    const blob = await stockReportService.exportBatchExcel(batchFilter);
    downloadBlob(blob, `Stock-Batch-Export-${dayjs().format('YYYY-MM-DD-HHmm')}.xlsx`);
  };

  const handleBatchExportPdf = async () => {
    const blob = await stockReportService.exportBatchPdf(batchFilter);
    downloadBlob(blob, `Stock-Batch-Export-${dayjs().format('YYYY-MM-DD-HHmm')}.pdf`);
  };

  const listColumns: ColumnsType<StockListItem> = [
    { title: 'Product Name', dataIndex: 'product_name', key: 'product_name', render: (v) => <strong>{v}</strong> },
    { title: 'Category', dataIndex: 'category', key: 'category' },
    { title: 'Brand', dataIndex: 'brand', key: 'brand' },
    { title: 'Variation Type', dataIndex: 'variation_type', key: 'variation_type', render: (v) => v || '—' },
    { title: 'Unit', dataIndex: 'unit', key: 'unit' },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      align: 'right',
      render: (v: number, record) => (
        <Space size={6}>
          <span>{v}</span>
          <Tag color={statusColor(record.status)}>{record.status}</Tag>
        </Space>
      ),
    },
  ];

  const alertColumns: ColumnsType<StockAlertItem> = [
    { title: 'Item Name', dataIndex: 'item_name', key: 'item_name', render: (v) => <strong>{v}</strong> },
    { title: 'Category', dataIndex: 'category', key: 'category' },
    { title: 'On Hand', dataIndex: 'on_hand', key: 'on_hand', align: 'right' },
    { title: 'Unit Cost', dataIndex: 'unit_cost', key: 'unit_cost', align: 'right', render: (v: number) => fmt(v) },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (v: string) => <Tag color={statusColor(v)}>{v}</Tag>,
    },
  ];

  const batchColumns: ColumnsType<BatchExportItem> = [
    { title: 'Item Name', dataIndex: 'item_name', key: 'item_name' },
    { title: 'Category', dataIndex: 'category', key: 'category' },
    { title: 'Batch ID', dataIndex: 'batch_id', key: 'batch_id' },
    { title: 'Expiry Date', dataIndex: 'expiry_date', key: 'expiry_date', render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD') : '—') },
    { title: 'Received Date', dataIndex: 'received_date', key: 'received_date', render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD') : '—') },
    { title: 'On Hand Qty', dataIndex: 'on_hand_qty', key: 'on_hand_qty', align: 'right' },
    { title: 'Unit Cost', dataIndex: 'unit_cost', key: 'unit_cost', align: 'right', render: (v: number) => fmt(v) },
    { title: 'Total Cost', dataIndex: 'total_cost', key: 'total_cost', align: 'right', render: (v: number) => fmt(v) },
    { title: 'Retail Price', dataIndex: 'retail_price', key: 'retail_price', align: 'right', render: (v: number) => fmt(v) },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (v: string) => <Tag color={statusColor(v)}>{v}</Tag>,
    },
  ];

  const healthData = analytics
    ? [
        { name: 'In Stock', value: analytics.health.in_stock, color: HEALTH_COLORS.in_stock },
        { name: 'Low Stock', value: analytics.health.low_stock, color: HEALTH_COLORS.low_stock },
        { name: 'Out of Stock', value: analytics.health.out_of_stock, color: HEALTH_COLORS.out_of_stock },
      ]
    : [];
  const hasHealthData = healthData.some((d) => d.value > 0);

  return (
    <div style={{ padding: '12px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <Title level={4} style={{ margin: 0 }}>Stock Report</Title>
        <Space wrap>
          {view === 'List' && (
            <>
              <Input.Search
                placeholder="Search product, brand, or variation..."
                allowClear
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: 240 }}
              />
              <Select
                placeholder="Category"
                allowClear
                showSearch
                optionFilterProp="label"
                value={categoryId}
                onChange={(v) => setCategoryId(v)}
                style={{ width: 180 }}
                options={categories.map((c) => ({ label: c.name, value: c.id }))}
              />
              <Space size={4}>
                <Text style={{ fontSize: 12 }}>Zero Stock Only</Text>
                <Switch checked={zeroStockOnly} onChange={setZeroStockOnly} />
              </Space>
            </>
          )}
          <Space size={4}>
            <Text style={{ fontSize: 12 }}>Low Stock Threshold</Text>
            <InputNumber min={0} value={threshold} onChange={(v) => setThreshold(v ?? 0)} style={{ width: 80 }} />
          </Space>
          <ReportViewToggle value={view} onChange={setView} />
          <ExportButtons onExportExcel={handleExportExcel} onExportPdf={handleExportPdf} disabled={view === 'List' ? !list : !analytics} />
          <CommonButton icon={<FileZipOutlined style={{ color: '#722ed1' }} />} onClick={() => setBatchOpen(true)}>
            Batch Export
          </CommonButton>
          <CommonButton
            icon={<ReloadOutlined style={{ color: 'blue' }} />}
            onClick={view === 'List' ? loadList : loadAnalytics}
            loading={loading}
          >
            Refresh
          </CommonButton>
        </Space>
      </div>

      <Spin spinning={loading} tip="Loading report...">
        {view === 'List' ? (
          list && list.items.length > 0 ? (
            <Card size="small">
              <Table
                columns={listColumns}
                dataSource={list.items}
                rowKey="product_id"
                size="small"
                pagination={{ pageSize: 15, showTotal: (t) => `${t} products` }}
                onRow={(record) => ({
                  onClick: () => openDetail(record.product_id),
                  style: { cursor: 'pointer' },
                })}
              />
            </Card>
          ) : (
            !loading && <Empty description="No stock data" />
          )
        ) : analytics ? (
          <>
            <KPIStatRow
              items={[
                { label: 'Combined Stock Value', value: analytics.kpis.combined_stock_value },
                { label: 'Total Batch Rows', value: analytics.kpis.total_batch_rows, precision: 0, prefix: '' },
                { label: 'Low Stock Items', value: analytics.kpis.low_stock_items, precision: 0, prefix: '' },
                { label: 'Out of Stock Items', value: analytics.kpis.out_of_stock_items, precision: 0, prefix: '' },
              ]}
            />

            <Card title="Stock Health" size="small" style={{ marginBottom: 16 }}>
              {hasHealthData ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={healthData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={(entry) => `${entry.name}: ${entry.value}`}>
                      {healthData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="No stock health data" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Card>

            <Card title="Top 10 Categories by Stock Value" size="small" style={{ marginBottom: 16 }}>
              {analytics.top_categories_by_value.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={analytics.top_categories_by_value} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="category" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v) => fmt(Number(v))} />
                    <Bar dataKey="value" name="Value" fill="#1677ff" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="No category value data" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Card>

            <Card title="Top 10 Items by Stock Value" size="small" style={{ marginBottom: 16 }}>
              {analytics.top_items_by_value.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={analytics.top_items_by_value} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="item_name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v) => fmt(Number(v))} />
                    <Bar dataKey="value" name="Value" fill="#1677ff" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="No item value data" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Card>

            <Card
              title="Top 10 Selling Products by Revenue"
              size="small"
              style={{ marginBottom: 16 }}
              extra={<PeriodFilter onChange={setTopSellingPeriod} defaultPreset="this_month" />}
            >
              {analytics.top_selling.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={analytics.top_selling} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="product_name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v) => fmt(Number(v))} />
                    <Bar dataKey="revenue" name="Revenue" fill="#1677ff" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="No top-selling data" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Card>

            <Card title="Low / Out-of-Stock Alerts" size="small">
              {analytics.alerts.length > 0 ? (
                <Table
                  columns={alertColumns}
                  dataSource={analytics.alerts}
                  rowKey={(r, i) => `${r.item_name}-${i}`}
                  size="small"
                  pagination={{ pageSize: 10 }}
                />
              ) : (
                <Empty description="No alerts" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Card>
          </>
        ) : (
          !loading && <Empty description="No analytics data" />
        )}
      </Spin>

      {/* Product stock detail popup */}
      <Modal
        title="Product Stock Detail"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
      >
        <Spin spinning={detailLoading}>
          {detailData ? (
            <Descriptions
              bordered
              size="small"
              column={1}
              items={[
                { key: 'product_name', label: 'Product Name', children: detailData.product_name },
                { key: 'category', label: 'Category', children: detailData.category },
                { key: 'brand', label: 'Brand', children: detailData.brand },
                { key: 'variation_type', label: 'Variation Type', children: detailData.variation_type || '—' },
                { key: 'unit', label: 'Unit', children: detailData.unit },
                { key: 'stock', label: 'Stock', children: detailData.stock },
              ]}
            />
          ) : (
            !detailLoading && <Empty description="No detail data" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </Spin>
      </Modal>

      {/* Batch / full stock export dialog */}
      <Modal
        title="Batch / Full Stock Export"
        open={batchOpen}
        onCancel={() => setBatchOpen(false)}
        footer={null}
        width={960}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Space wrap>
            <Select
              value={batchDateFilterType}
              onChange={(v: 'none' | 'expiry' | 'received') => {
                setBatchDateFilterType(v);
                setBatchDateFrom(undefined);
                setBatchDateTo(undefined);
              }}
              style={{ width: 170 }}
              options={[
                { label: 'No Date Filter', value: 'none' },
                { label: 'Expiry Date', value: 'expiry' },
                { label: 'Received Date', value: 'received' },
              ]}
            />
            {batchDateFilterType !== 'none' && (
              <DatePicker.RangePicker
                format="YYYY-MM-DD"
                onChange={(dates) => {
                  if (dates && dates[0] && dates[1]) {
                    setBatchDateFrom(dates[0].format('YYYY-MM-DD'));
                    setBatchDateTo(dates[1].format('YYYY-MM-DD'));
                  } else {
                    setBatchDateFrom(undefined);
                    setBatchDateTo(undefined);
                  }
                }}
              />
            )}
            <Select
              value={batchStockFilter}
              onChange={(v: 'all' | 'exclude_zero' | 'only_zero') => setBatchStockFilter(v)}
              style={{ width: 170 }}
              options={[
                { label: 'All Stock', value: 'all' },
                { label: 'Exclude Zero Stock', value: 'exclude_zero' },
                { label: 'Only Zero Stock', value: 'only_zero' },
              ]}
            />
            <CommonButton onClick={handleBatchPreview} loading={batchLoading}>
              Preview
            </CommonButton>
            <ExportButtons
              onExportExcel={handleBatchExportExcel}
              onExportPdf={handleBatchExportPdf}
              disabled={batchItems.length === 0}
            />
          </Space>

          {batchItems.length > 0 ? (
            <Table
              columns={batchColumns}
              dataSource={batchItems}
              rowKey={(r, i) => `${r.batch_id}-${i}`}
              size="small"
              pagination={{ pageSize: 8 }}
              scroll={{ x: true }}
            />
          ) : (
            !batchLoading && <Empty description="Click Preview to load export data" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </Space>
      </Modal>
    </div>
  );
};

export default InventoryReports;
