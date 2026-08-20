import React, { useCallback, useEffect, useState } from 'react';
import {
  Card, Table, Typography, Space, Select,
  Spin, Empty, message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { ReloadOutlined } from '@ant-design/icons';
import { CommonButton } from '../../components/common/Button';
import PeriodFilter from '../../components/reports/shared/PeriodFilter';
import type { PeriodFilterValue } from '../../components/reports/shared/PeriodFilter';
import KPIStatRow from '../../components/reports/shared/KPIStatRow';
import ExportButtons from '../../components/reports/shared/ExportButtons';
import { topSellingService } from '../../services/reports/topSellingService';
import { downloadBlob } from '../../utils/downloadBlob';
import type { TopSellingProductResponse, TopSellingProductItem } from '../../types/entities/report.types';

const { Title } = Typography;

const fmt = (n: number) => `LKR ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Medal-style badge for the top 3 ranks, a lighter highlight for ranks 4-10. */
const rankBadgeStyle = (rank: number): React.CSSProperties => {
  if (rank === 1) return { background: '#f5c518', color: '#5c3d00' };
  if (rank === 2) return { background: '#c9c9c9', color: '#333333' };
  if (rank === 3) return { background: '#cd7f32', color: '#ffffff' };
  if (rank <= 10) return { background: '#e6f4ff', color: '#1677ff' };
  return { background: 'transparent', color: 'inherit' };
};

const TopSellingReports: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<TopSellingProductResponse | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<string | undefined>(undefined);
  const [period, setPeriod] = useState<PeriodFilterValue | null>(null);

  const currentFilter = {
    payment_method: paymentFilter,
    date_from: period?.dateFrom,
    date_to: period?.dateTo,
  };

  const loadReport = useCallback(async () => {
    if (!period) return;
    setLoading(true);
    try {
      const data = await topSellingService.getReport(currentFilter);
      setReport(data);
    } catch {
      message.error('Failed to load top selling product report');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentFilter, period]);

  useEffect(() => { loadReport(); }, [loadReport]);

  const handleExportExcel = async () => {
    const blob = await topSellingService.exportExcel(currentFilter);
    downloadBlob(blob, `Top-Selling-Products-${dayjs().format('YYYY-MM-DD-HHmm')}.xlsx`);
  };

  const handleExportPdf = async () => {
    const blob = await topSellingService.exportPdf(currentFilter);
    downloadBlob(blob, `Top-Selling-Products-${dayjs().format('YYYY-MM-DD-HHmm')}.pdf`);
  };

  const columns: ColumnsType<TopSellingProductItem> = [
    {
      title: 'Rank',
      dataIndex: 'rank',
      key: 'rank',
      width: 70,
      render: (v: number) => (
        <span
          style={{
            ...rankBadgeStyle(v),
            display: 'inline-block',
            minWidth: 28,
            textAlign: 'center',
            borderRadius: 4,
            padding: '2px 8px',
            fontWeight: 600,
          }}
        >
          {v}
        </span>
      ),
    },
    { title: 'Product', dataIndex: 'product_name', key: 'product_name', render: (v) => <strong>{v}</strong> },
    { title: 'Category', dataIndex: 'category', key: 'category', render: (v) => v || '—' },
    { title: 'Revenue', dataIndex: 'revenue', key: 'revenue', align: 'right', render: (v: number) => <strong>{fmt(v)}</strong> },
    { title: 'Qty Sold', dataIndex: 'qty_sold', key: 'qty_sold', align: 'right' },
    {
      title: 'Peak Hour',
      dataIndex: 'peak_hour',
      key: 'peak_hour',
      align: 'right',
      render: (v: number) => (v === -1 ? '—' : `${String(v).padStart(2, '0')}:00`),
    },
    { title: 'Peak Day', dataIndex: 'peak_day', key: 'peak_day', render: (v?: string) => v || '—' },
  ];

  return (
    <div style={{ padding: '12px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <Title level={4} style={{ margin: 0 }}>Top Selling Product Report</Title>
        <Space wrap>
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
          <PeriodFilter onChange={setPeriod} defaultPreset="this_month" />
          <ExportButtons onExportExcel={handleExportExcel} onExportPdf={handleExportPdf} disabled={!report} />
          <CommonButton icon={<ReloadOutlined style={{ color: 'blue' }} />} onClick={loadReport} loading={loading}>Refresh</CommonButton>
        </Space>
      </div>

      <Spin spinning={loading} tip="Loading report...">
        {report && report.items.length > 0 ? (
          <>
            <KPIStatRow
              items={[
                { label: 'Total Products', value: report.summary.total_products, precision: 0, prefix: '' },
                { label: 'Total Revenue', value: report.summary.total_revenue },
                { label: 'Total Qty Sold', value: report.summary.total_qty, precision: 0, prefix: '' },
              ]}
            />

            <Card size="small">
              <Table
                columns={columns}
                dataSource={report.items}
                rowKey="product_id"
                size="small"
                pagination={{ pageSize: 20, showTotal: (t) => `${t} products` }}
              />
            </Card>
          </>
        ) : (
          !loading && <Empty description="No top selling product data" />
        )}
      </Spin>
    </div>
  );
};

export default TopSellingReports;
