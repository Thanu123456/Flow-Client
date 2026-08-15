import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Card, Col, Row, Statistic, Table, Typography, Space, DatePicker, Input, Select,
  Spin, Empty, message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import dayjs from 'dayjs';
import { ReloadOutlined, FilePdfOutlined, FileExcelOutlined } from '@ant-design/icons';
import { CommonButton } from '../../components/common/Button';
import SalesReport from '../../components/reports/SalesReport';
import { reportService } from '../../services/reports/reportService';
import { exportElementToPdf } from '../../utils/pdf/exportElementToPdf';
import type {
  SalesReportResponse, SalesReportItem, ProductPerformanceItem, CategoryBreakdownItem,
} from '../../types/entities/report.types';

const { Title, Text } = Typography;

const fmt = (n: number) => `LKR ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const SalesReports: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [report, setReport] = useState<SalesReportResponse | null>(null);
  const [searchText, setSearchText] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(29, 'days').startOf('day'),
    dayjs().endOf('day'),
  ]);
  const printRef = useRef<HTMLDivElement>(null);

  const currentFilter = {
    search: searchText || undefined,
    payment_method: paymentFilter,
    date_from: dateRange[0]?.format('YYYY-MM-DD'),
    date_to: dateRange[1]?.format('YYYY-MM-DD'),
  };

  const loadReport = useCallback(async () => {
    setLoading(true);
    try {
      const data = await reportService.getSalesReport(currentFilter);
      setReport(data);
    } catch {
      message.error('Failed to load sales report');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, paymentFilter, dateRange]);

  useEffect(() => { loadReport(); }, [loadReport]);

  const handleExportPDF = async () => {
    if (!report) return;
    setExportingPdf(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 100));
      if (printRef.current) {
        await exportElementToPdf(printRef.current, `Sales-Report-${dayjs().format('YYYY-MM-DD-HHmm')}.pdf`);
      }
    } catch {
      message.error('Failed to generate PDF');
    } finally {
      setExportingPdf(false);
    }
  };

  const handleExportExcel = async () => {
    setExportingExcel(true);
    try {
      const blob = await reportService.exportSalesReportExcel(currentFilter);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Sales-Report-${dayjs().format('YYYY-MM-DD-HHmm')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      message.error('Failed to export Excel');
    } finally {
      setExportingExcel(false);
    }
  };

  const itemColumns: ColumnsType<SalesReportItem> = [
    { title: 'Bill Number', dataIndex: 'invoice_number', key: 'invoice_number', render: (v) => <strong>{v}</strong> },
    { title: 'Customer', dataIndex: 'customer_name', key: 'customer_name' },
    { title: 'Payment', dataIndex: 'payment_method', key: 'payment_method', render: (v: string) => v?.toUpperCase() },
    { title: 'Qty', dataIndex: 'quantity', key: 'quantity', align: 'right', width: 90 },
    { title: 'Unit Price', dataIndex: 'unit_price', key: 'unit_price', align: 'right', render: (v: number) => fmt(v) },
    { title: 'Total', dataIndex: 'total', key: 'total', align: 'right', render: (v: number) => <strong>{fmt(v)}</strong> },
    { title: 'Date', dataIndex: 'created_at', key: 'created_at', render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm') },
  ];

  const productColumns: ColumnsType<ProductPerformanceItem> = [
    { title: 'SKU', dataIndex: 'sku', key: 'sku', render: (v) => v || '—' },
    { title: 'Product', dataIndex: 'product_name', key: 'product_name' },
    { title: 'Qty Sold', dataIndex: 'quantity_sold', key: 'quantity_sold', align: 'right' },
    { title: 'Unit Cost', dataIndex: 'unit_cost', key: 'unit_cost', align: 'right', render: (v: number) => fmt(v) },
    { title: 'Unit Retail', dataIndex: 'unit_retail', key: 'unit_retail', align: 'right', render: (v: number) => fmt(v) },
    { title: 'Margin %', dataIndex: 'net_margin_pct', key: 'net_margin_pct', align: 'right', render: (v: number) => `${v.toFixed(1)}%` },
    { title: 'Revenue', dataIndex: 'revenue', key: 'revenue', align: 'right', render: (v: number) => <strong>{fmt(v)}</strong> },
  ];

  const categoryColumns: ColumnsType<CategoryBreakdownItem> = [
    { title: 'Category', dataIndex: 'category_name', key: 'category_name' },
    { title: 'Qty Sold', dataIndex: 'quantity_sold', key: 'quantity_sold', align: 'right' },
    { title: 'Revenue', dataIndex: 'revenue', key: 'revenue', align: 'right', render: (v: number) => <strong>{fmt(v)}</strong> },
  ];

  const hourlyChartData = (report?.hourly_density ?? []).map((h) => ({
    hour: `${String(h.hour).padStart(2, '0')}:00`,
    revenue: h.revenue,
  }));

  return (
    <div style={{ padding: '12px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <Title level={4} style={{ margin: 0 }}>Sales Report</Title>
        <Space wrap>
          <Input.Search
            placeholder="Search bill # or customer..."
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 220 }}
          />
          <Select
            placeholder="Payment Method"
            allowClear
            value={paymentFilter}
            onChange={setPaymentFilter}
            style={{ width: 150 }}
            options={[
              { label: 'Cash', value: 'cash' },
              { label: 'Card', value: 'card' },
              { label: 'COD', value: 'cod' },
              { label: 'Credit', value: 'credit' },
            ]}
          />
          <DatePicker.RangePicker
            value={dateRange}
            onChange={(dates: any) => dates && setDateRange(dates)}
            format="YYYY-MM-DD"
            allowClear={false}
            presets={[
              { label: 'Today', value: [dayjs().startOf('day'), dayjs().endOf('day')] },
              { label: 'Last 7 Days', value: [dayjs().subtract(7, 'days'), dayjs()] },
              { label: 'Last 30 Days', value: [dayjs().subtract(30, 'days'), dayjs()] },
              { label: 'This Month', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
            ]}
          />
          <CommonButton icon={<FilePdfOutlined style={{ color: '#FF0000' }} />} onClick={handleExportPDF} loading={exportingPdf} tooltip="Download PDF">PDF</CommonButton>
          <CommonButton icon={<FileExcelOutlined style={{ color: '#107C41' }} />} onClick={handleExportExcel} loading={exportingExcel} tooltip="Download Excel">Excel</CommonButton>
          <CommonButton icon={<ReloadOutlined style={{ color: 'blue' }} />} onClick={loadReport} loading={loading}>Refresh</CommonButton>
        </Space>
      </div>

      <Spin spinning={loading} tip="Loading report...">
        {report ? (
          <>
            {/* Tier 1: Summary */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col xs={12} md={6}><Card size="small"><Statistic title="Gross Sales" value={report.summary.gross_sales} precision={2} prefix="LKR" /></Card></Col>
              <Col xs={12} md={6}><Card size="small"><Statistic title="Total Discounts" value={report.summary.total_discounts} precision={2} prefix="LKR" /></Card></Col>
              <Col xs={12} md={6}><Card size="small"><Statistic title="Delivery Charges" value={report.summary.delivery_charges} precision={2} prefix="LKR" /></Card></Col>
              <Col xs={12} md={6}><Card size="small"><Statistic title="Total Refunds" value={report.summary.total_refunds} precision={2} prefix="LKR" /></Card></Col>
              <Col xs={12} md={6}><Card size="small"><Statistic title="Invoice Count" value={report.summary.invoice_count} /></Card></Col>
              <Col xs={12} md={6}><Card size="small"><Statistic title="Average Ticket Value" value={report.summary.average_ticket_value} precision={2} prefix="LKR" /></Card></Col>
              <Col xs={24} md={12}>
                <Card size="small" style={{ background: '#0b3d91' }}>
                  <Statistic
                    title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>Net Sales (Gross − Discounts − Refunds)</span>}
                    value={report.summary.net_sales}
                    precision={2}
                    prefix="LKR"
                    valueStyle={{ color: '#fff' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Tier 2: Payment Reconciliation */}
            <Card title="Payment Reconciliation" size="small" style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]}>
                <Col xs={12} md={4}><Statistic title="Cash Collected" value={report.payment_breakdown.cash_collected} precision={2} prefix="LKR" /></Col>
                <Col xs={12} md={4}><Statistic title="Card Transactions" value={report.payment_breakdown.card_transactions} precision={2} prefix="LKR" /></Col>
                <Col xs={12} md={4}><Statistic title="QR / Mobile Wallets" value={report.payment_breakdown.qr_mobile_wallets} precision={2} prefix="LKR" /></Col>
                <Col xs={12} md={4}><Statistic title="Store Credit / On-Account" value={report.payment_breakdown.store_credit_on_account} precision={2} prefix="LKR" /></Col>
                {!!report.payment_breakdown.other && (
                  <Col xs={12} md={4}><Statistic title="Other" value={report.payment_breakdown.other} precision={2} prefix="LKR" /></Col>
                )}
                <Col xs={12} md={4}>
                  <Statistic title="Total Settlement Checksum" value={report.payment_breakdown.total_settlement_checksum} precision={2} prefix="LKR" valueStyle={{ fontWeight: 700 }} />
                </Col>
              </Row>
            </Card>

            {/* Tier 3: Hourly Density */}
            <Card title="Hourly Sales Density" size="small" style={{ marginBottom: 16 }}>
              {hourlyChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={hourlyChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="hour" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v: any) => fmt(Number(v))} />
                    <Bar dataKey="revenue" name="Revenue" fill="#1677ff" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="No hourly data" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Card>

            {/* Tier 3: Product Performance */}
            <Card title="Product Performance" size="small" style={{ marginBottom: 16 }}>
              <Table
                columns={productColumns}
                dataSource={report.product_performance}
                rowKey="product_id"
                size="small"
                pagination={{ pageSize: 10 }}
              />
              <Text type="secondary" style={{ fontSize: 11 }}>
                Unit Cost is the product's current cost snapshot, not the historical cost at time of sale.
              </Text>
            </Card>

            {/* Tier 3: Category Breakdown */}
            <Card title="Category / Department Breakdown" size="small" style={{ marginBottom: 16 }}>
              <Table
                columns={categoryColumns}
                dataSource={report.category_breakdown}
                rowKey="category_id"
                size="small"
                pagination={{ pageSize: 10 }}
              />
            </Card>

            {/* Transactions */}
            <Card title="Transaction Detail" size="small">
              <Table
                columns={itemColumns}
                dataSource={report.items}
                rowKey="id"
                size="small"
                pagination={{ pageSize: 15, showTotal: (t) => `${t} records` }}
              />
            </Card>

            {/* Off-screen render target for PDF capture */}
            <div style={{ position: 'fixed', top: 0, left: '-10000px', zIndex: -1 }}>
              <SalesReport ref={printRef} report={report} />
            </div>
          </>
        ) : (
          !loading && <Empty description="No report data" />
        )}
      </Spin>
    </div>
  );
};

export default SalesReports;
