import React from 'react';
import { Card, Col, Row, Statistic } from 'antd';

export interface KPIItem {
  label: string;
  value: number;
  precision?: number;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  valueStyle?: React.CSSProperties;
  highlight?: boolean;
  /** Column span override; defaults to a 4-per-row (xs=12,md=6) grid. */
  span?: { xs?: number; md?: number };
}

interface KPIStatRowProps {
  items: KPIItem[];
  style?: React.CSSProperties;
}

/** Shared KPI/summary-card row used across every report page's Analytics view. */
const KPIStatRow: React.FC<KPIStatRowProps> = ({ items, style }) => (
  <Row gutter={[16, 16]} style={{ marginBottom: 16, ...style }}>
    {items.map((item, i) => (
      <Col xs={item.span?.xs ?? 12} md={item.span?.md ?? 6} key={i}>
        <Card size="small" style={item.highlight ? { background: '#0b3d91' } : undefined}>
          <Statistic
            title={item.highlight ? <span style={{ color: 'rgba(255,255,255,0.85)' }}>{item.label}</span> : item.label}
            value={item.value}
            precision={item.precision ?? 2}
            prefix={item.prefix ?? 'LKR'}
            suffix={item.suffix}
            valueStyle={item.highlight ? { color: '#fff', ...item.valueStyle } : item.valueStyle}
          />
        </Card>
      </Col>
    ))}
  </Row>
);

export default KPIStatRow;
