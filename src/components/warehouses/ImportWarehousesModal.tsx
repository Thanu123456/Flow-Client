import React, { useState } from "react";
import { Modal, Upload, Button, Alert, Table, Space, App, Typography } from "antd";
import { InboxOutlined, DownloadOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd";
import { warehouseService } from "../../services/management/warehouseService";
import { apiErrorMessage } from "../../utils/apiError";
import type { WarehouseImportResult } from "../../types/entities/warehouse.types";

const { Text } = Typography;

interface Props {
  visible: boolean;
  onCancel: () => void;
  /** Called after an import that created at least one warehouse. */
  onDone: () => void;
}

/** Bulk-create warehouses from an .xlsx / .csv file (template available). */
const ImportWarehousesModal: React.FC<Props> = ({ visible, onCancel, onDone }) => {
  const { message } = App.useApp();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<WarehouseImportResult | null>(null);

  const reset = () => {
    setFileList([]);
    setResult(null);
  };

  const close = () => {
    reset();
    onCancel();
  };

  const downloadTemplate = async () => {
    try {
      const blob = await warehouseService.downloadImportTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Warehouse-import-template.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      message.error(apiErrorMessage(e, "Failed to download the template"));
    }
  };

  const runImport = async () => {
    const file = fileList[0]?.originFileObj as File | undefined;
    if (!file) {
      message.warning("Choose a file first");
      return;
    }
    setImporting(true);
    try {
      const r = await warehouseService.importWarehouses(file);
      setResult(r);
      if (r.created > 0) {
        message.success(`${r.created} warehouse(s) imported`);
        onDone();
      } else {
        message.warning("Nothing was imported");
      }
    } catch (e) {
      message.error(apiErrorMessage(e, "Import failed"));
    } finally {
      setImporting(false);
    }
  };

  return (
    <Modal
      open={visible}
      title="Import Warehouses"
      onCancel={close}
      width={720}
      destroyOnHidden
      footer={
        result ? (
          <Space>
            <Button onClick={reset}>Import another file</Button>
            <Button type="primary" onClick={close}>Done</Button>
          </Space>
        ) : (
          <Space>
            <Button onClick={close}>Cancel</Button>
            <Button type="primary" loading={importing} disabled={fileList.length === 0} onClick={runImport}>
              Import
            </Button>
          </Space>
        )
      }
    >
      {!result ? (
        <>
          <Alert
            type="info"
            showIcon
            className="mb-3"
            message="Use the template: Code, Name*, Type, Contact Person, Email, Mobile, Phone, City, Address, Capacity, Manager Email, Active"
            description={
              <span>
                Type is store, distribution, returns, damaged or in transit (blank = store). Blank codes are generated.
                Names and codes that already exist are skipped and listed afterwards. Up to 500 rows.
              </span>
            }
          />
          <Button icon={<DownloadOutlined />} onClick={downloadTemplate} className="mb-3">
            Download template
          </Button>
          <Upload.Dragger
            accept=".xlsx,.csv"
            maxCount={1}
            fileList={fileList}
            beforeUpload={() => false}
            onChange={(info) => setFileList(info.fileList.slice(-1))}
            onRemove={() => setFileList([])}
          >
            <p className="ant-upload-drag-icon"><InboxOutlined /></p>
            <p className="ant-upload-text">Click or drag an .xlsx / .csv file here</p>
          </Upload.Dragger>
        </>
      ) : (
        <>
          <Alert
            type={result.created > 0 ? "success" : "warning"}
            showIcon
            className="mb-3"
            message={`${result.created} created, ${result.skipped} skipped (of ${result.totalRows} rows)`}
          />
          {result.errors.length > 0 && (
            <Table
              size="small"
              rowKey={(e) => `${e.row}-${e.message}`}
              pagination={result.errors.length > 8 ? { pageSize: 8, size: "small" } : false}
              dataSource={result.errors}
              columns={[
                { title: "Row", dataIndex: "row", width: 60 },
                { title: "Name", dataIndex: "name", render: (n?: string) => n || <Text type="secondary">-</Text> },
                { title: "Why it was skipped", dataIndex: "message" },
              ]}
            />
          )}
        </>
      )}
    </Modal>
  );
};

export default ImportWarehousesModal;
