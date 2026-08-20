import React from 'react';
import { Segmented } from 'antd';

interface ReportViewToggleProps {
  value: string;
  onChange: (value: string) => void;
  options?: string[];
}

/** Shared List/Analytics view switch used by every report page that has both views. */
const ReportViewToggle: React.FC<ReportViewToggleProps> = ({ value, onChange, options = ['List', 'Analytics'] }) => (
  <Segmented options={options} value={value} onChange={(v) => onChange(v as string)} />
);

export default ReportViewToggle;
