import React, { useState } from 'react';
import { Space, message } from 'antd';
import { FilePdfOutlined, FileExcelOutlined } from '@ant-design/icons';
import { CommonButton } from '../../common/Button';

interface ExportButtonsProps {
  onExportExcel: () => Promise<void>;
  onExportPdf: () => Promise<void>;
  disabled?: boolean;
}

/**
 * Shared Excel/PDF export button pair. Both handlers are expected to fetch the
 * file (as a Blob, via a report service function) and trigger the download
 * themselves (see src/utils/downloadBlob.ts) — this component only manages the
 * independent loading state per button and surfaces failures.
 */
const ExportButtons: React.FC<ExportButtonsProps> = ({ onExportExcel, onExportPdf, disabled }) => {
  const [excelLoading, setExcelLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleExcel = async () => {
    setExcelLoading(true);
    try {
      await onExportExcel();
    } catch {
      message.error('Failed to export Excel');
    } finally {
      setExcelLoading(false);
    }
  };

  const handlePdf = async () => {
    setPdfLoading(true);
    try {
      await onExportPdf();
    } catch {
      message.error('Failed to export PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <Space>
      <CommonButton
        icon={<FilePdfOutlined style={{ color: '#FF0000' }} />}
        onClick={handlePdf}
        loading={pdfLoading}
        disabled={disabled}
        tooltip="Download PDF"
      >
        PDF
      </CommonButton>
      <CommonButton
        icon={<FileExcelOutlined style={{ color: '#107C41' }} />}
        onClick={handleExcel}
        loading={excelLoading}
        disabled={disabled}
        tooltip="Download Excel"
      >
        Excel
      </CommonButton>
    </Space>
  );
};

export default ExportButtons;
