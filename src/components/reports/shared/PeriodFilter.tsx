import React, { useEffect, useMemo, useState } from 'react';
import { Select, DatePicker, Space } from 'antd';
import dayjs from 'dayjs';

export type PeriodPreset =
  | 'today'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'quarterly'
  | 'yearly'
  | 'custom';

export interface PeriodFilterValue {
  preset: PeriodPreset;
  dateFrom: string;
  dateTo: string;
}

interface PeriodFilterProps {
  onChange: (value: PeriodFilterValue) => void;
  defaultPreset?: PeriodPreset;
  style?: React.CSSProperties;
}

const PRESET_OPTIONS: { label: string; value: PeriodPreset }[] = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'this_week' },
  { label: 'Last Week', value: 'last_week' },
  { label: 'This Month', value: 'this_month' },
  { label: 'Last Month', value: 'last_month' },
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Yearly', value: 'yearly' },
  { label: 'Custom Range', value: 'custom' },
];

/** Monday of the week containing d, regardless of locale week-start settings. */
function mondayOf(d: dayjs.Dayjs): dayjs.Dayjs {
  const day = d.day(); // 0 (Sun) .. 6 (Sat)
  const diff = day === 0 ? 6 : day - 1;
  return d.subtract(diff, 'day').startOf('day');
}

const CURRENT_YEAR = dayjs().year();
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i).map((y) => ({ label: String(y), value: y }));
const QUARTER_OPTIONS = [
  { label: 'Q1 (Jan - Mar)', value: 1 },
  { label: 'Q2 (Apr - Jun)', value: 2 },
  { label: 'Q3 (Jul - Sep)', value: 3 },
  { label: 'Q4 (Oct - Dec)', value: 4 },
];

/** Resolves a preset (+ year/quarter/custom range) into concrete [from, to] dayjs bounds. */
function resolveRange(
  preset: PeriodPreset,
  year: number,
  quarter: number,
  customRange: [dayjs.Dayjs, dayjs.Dayjs] | null,
): [dayjs.Dayjs, dayjs.Dayjs] {
  const today = dayjs().startOf('day');
  switch (preset) {
    case 'today':
      return [today, today];
    case 'this_week': {
      const monday = mondayOf(today);
      return [monday, monday.add(6, 'day')];
    }
    case 'last_week': {
      const monday = mondayOf(today);
      return [monday.subtract(7, 'day'), monday.subtract(1, 'day')];
    }
    case 'this_month':
      return [today.startOf('month'), today.endOf('month')];
    case 'last_month': {
      const lastMonth = today.startOf('month').subtract(1, 'month');
      return [lastMonth.startOf('month'), lastMonth.endOf('month')];
    }
    case 'quarterly': {
      const startMonth = (quarter - 1) * 3;
      const from = dayjs(`${year}-${startMonth + 1}-01`, 'YYYY-M-DD');
      return [from.startOf('month'), from.add(2, 'month').endOf('month')];
    }
    case 'yearly':
      return [dayjs(`${year}-01-01`, 'YYYY-MM-DD'), dayjs(`${year}-12-31`, 'YYYY-MM-DD')];
    case 'custom':
      return customRange ?? [today, today];
    default:
      return [today, today];
  }
}

/**
 * Shared period/date-range filter used across all report pages: preset selector
 * (Today/This Week/Last Week/This Month/Last Month/Quarterly/Yearly/Custom Range),
 * revealing a Year+Quarter picker for Quarterly, a Year picker for Yearly, or a plain
 * RangePicker for Custom. Resolution happens entirely client-side (Monday-start weeks,
 * matching the backend's date-range convention) into concrete date_from/date_to
 * strings, so every report endpoint — including ones that only understand
 * date_from/date_to — gets the same two params regardless of preset.
 */
const PeriodFilter: React.FC<PeriodFilterProps> = ({ onChange, defaultPreset = 'this_month', style }) => {
  const [preset, setPreset] = useState<PeriodPreset>(defaultPreset);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [quarter, setQuarter] = useState(Math.floor(dayjs().month() / 3) + 1);
  const [customRange, setCustomRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>([
    dayjs().subtract(29, 'day').startOf('day'),
    dayjs().endOf('day'),
  ]);

  const resolved = useMemo(() => resolveRange(preset, year, quarter, customRange), [preset, year, quarter, customRange]);

  useEffect(() => {
    onChange({
      preset,
      dateFrom: resolved[0].format('YYYY-MM-DD'),
      dateTo: resolved[1].format('YYYY-MM-DD'),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolved[0].valueOf(), resolved[1].valueOf(), preset]);

  return (
    <Space wrap style={style}>
      <Select
        value={preset}
        onChange={setPreset}
        options={PRESET_OPTIONS}
        style={{ width: 160 }}
      />
      {preset === 'quarterly' && (
        <>
          <Select value={year} onChange={setYear} options={YEAR_OPTIONS} style={{ width: 100 }} />
          <Select value={quarter} onChange={setQuarter} options={QUARTER_OPTIONS} style={{ width: 150 }} />
        </>
      )}
      {preset === 'yearly' && (
        <Select value={year} onChange={setYear} options={YEAR_OPTIONS} style={{ width: 100 }} />
      )}
      {preset === 'custom' && (
        <DatePicker.RangePicker
          value={customRange as any}
          onChange={(dates: any) => dates && setCustomRange(dates)}
          format="YYYY-MM-DD"
          allowClear={false}
        />
      )}
    </Space>
  );
};

export default PeriodFilter;
