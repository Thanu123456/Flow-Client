import { useState } from "react";
import { Modal, Space, App } from "antd";
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import type { ConfirmModalProps } from "./Modal.types";

function ConfirmModal<T = any>({
  visible,
  title = "Confirm Action",
  data,
  onCancel,
  onSuccess,
  onConfirm,
  loading: externalLoading,
  okText = "Confirm",
  cancelText = "Cancel",
  renderContent,
  customMessage,
  confirmType = "warning",
  ...restProps
}: ConfirmModalProps<T>) {
  const { message } = App.useApp();
  const [internalLoading, setInternalLoading] = useState(false);
  const loading = externalLoading ?? internalLoading;

  const handleConfirm = async () => {
    if (!data) return;

    try {
      setInternalLoading(true);
      await onConfirm(data);
      message.success("Action completed successfully");
      onSuccess?.();
      onCancel();
    } catch (err: any) {
      console.error(err);
      message.error(err?.response?.data?.message || "Action failed");
    } finally {
      setInternalLoading(false);
    }
  };

  const icon =
    confirmType === "success" ? (
      <CheckCircleOutlined style={{ color: "green" }} />
    ) : (
      <ExclamationCircleOutlined style={{ color: "orange" }} />
    );

  return (
    <Modal
      title={
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>{icon}</span>
          <span style={{ color: "black" }}>{title}</span>
        </span>
      }
      open={visible}
      onOk={handleConfirm}
      onCancel={onCancel}
      okText={okText}
      cancelText={cancelText}
      centered
      confirmLoading={loading}
      okButtonProps={{
        style: { fontSize: 16, padding: "6px 20px" },
        type: confirmType === "success" ? "primary" : "default",
      }}
      cancelButtonProps={{ style: { fontSize: 16, padding: "6px 20px" } }}
      {...restProps}
    >
      {renderContent ? (
        renderContent(data)
      ) : (
        <Space
          direction="vertical"
          align="center"
          size={16}
          style={{ width: "100%" }}
        >
          <p style={{ textAlign: "center", fontSize: 16 }}>
            {customMessage ||
              "Are you sure you want to proceed with this action?"}
          </p>
        </Space>
      )}
    </Modal>
  );
}

export default ConfirmModal;
