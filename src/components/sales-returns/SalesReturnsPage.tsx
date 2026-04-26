import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DatePicker } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import { useSaleReturnStore } from '../../store/transactions/saleReturnStore';
import SalesReturnsTable from './SalesReturnsTable';
import RefundDetailsModal from './RefundDetailsModal';
import { PageLayout } from '../common/PageLayout';
import { CommonButton } from '../common/Button';
import { useDebounce } from '../../hooks/ui/useDebounce';
import type { SaleReturn } from '../../types/entities/saleReturn.types';

const { RangePicker } = DatePicker;

const PAYMENT_OPTIONS = [
  { value: '',       label: 'All Methods' },
  { value: 'cash',   label: 'Cash' },
  { value: 'card',   label: 'Card' },
  { value: 'credit', label: 'Credit' },
];

const SalesReturnsPage: React.FC = () => {
  const navigate = useNavigate();
  const { returns, loading, selectedReturn, fetchReturns, fetchReturnDetail } = useSaleReturnStore();

  const [search,        setSearch]        = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [dateRange,     setDateRange]     = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [detailOpen,    setDetailOpen]    = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const debouncedSearch = useDebounce(search, 500);

  const load = useCallback(() => {
    fetchReturns({
      search:         debouncedSearch || undefined,
      payment_method: paymentMethod || undefined,
      date_from:      dateRange?.[0]?.format('YYYY-MM-DD') ?? undefined,
      date_to:        dateRange?.[1]?.format('YYYY-MM-DD') ?? undefined,
    });
  }, [debouncedSearch, paymentMethod, dateRange, fetchReturns]);

  useEffect(() => { load(); }, [load]);

  const handleView = async (record: SaleReturn) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      await fetchReturnDetail(record.id);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleClose = () => {
    setDetailOpen(false);
  };

  return (
    <PageLayout
      title="Sale Returns"
      searchConfig={{
        placeholder: "Search by ref # or customer",
        value: search,
        onChange: setSearch,
      }}
      filterConfig={[
        {
          placeholder: "Payment Method",
          value: paymentMethod,
          onChange: setPaymentMethod,
          options: PAYMENT_OPTIONS,
        },
      ]}
      actions={
        <CommonButton
          type="primary"
          danger
          icon={<PlusOutlined />}
          onClick={() => navigate('/sales-returns/new')}
        >
          Process New Refund
        </CommonButton>
      }
      extra={
        <RangePicker
          style={{ width: '100%' }}
          value={dateRange}
          onChange={(v) => setDateRange(v as [Dayjs | null, Dayjs | null] | null)}
        />
      }
    >
      <SalesReturnsTable data={returns} loading={loading} onView={handleView} />

      <RefundDetailsModal
        open={detailOpen}
        record={selectedReturn}
        loading={detailLoading}
        onClose={handleClose}
      />
    </PageLayout>
  );
};

export default SalesReturnsPage;
