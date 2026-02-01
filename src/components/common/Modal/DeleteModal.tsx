import { useState } from "react";
import { Modal, Space, Image, App } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { FaRegImages } from "react-icons/fa";
import type { DeleteModalProps } from "./Modal.types";

function DeleteModal<T = any>({
  visible,
  title = "Confirm Delete",
  data,
  onCancel,
  onSuccess,
  onDelete,
  loading: externalLoading,
  okText = "Yes",
  cancelText = "No",
  renderContent,
  getImageUrl,
  getName,
  customMessage,
  showImage = true,
  ...restProps
}: DeleteModalProps<T>) {
  const { message } = App.useApp();
  const [internalLoading, setInternalLoading] = useState(false);
  const loading = externalLoading ?? internalLoading;

  const handleDelete = async () => {
    if (!data) return;

    try {
      setInternalLoading(true);
      await onDelete(data);
      message.success("Deleted successfully");
      onSuccess?.();
      onCancel();
    } catch (err: any) {
      console.error(err);
      message.error(err?.response?.data?.message || "Failed to delete");
    } finally {
      setInternalLoading(false);
    }
  };

  const imageUrl = getImageUrl?.(data);
  const name = getName?.(data);

  return (
    <Modal
      title={
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "red" }}>
            <ExclamationCircleOutlined />
          </span>
          <span style={{ color: "black" }}>{title}</span>
        </span>
      }
      open={visible}
      onOk={handleDelete}
      onCancel={onCancel}
      okText={okText}
      cancelText={cancelText}
      centered
      confirmLoading={loading}
      okButtonProps={{
        style: { fontSize: 16, padding: "6px 20px" },
        danger: true,
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
          {showImage &&
            (imageUrl ? (
              <Image
                width={120}
                height={120}
                src={imageUrl}
                alt={name || "Item"}
                style={{ objectFit: "contain", borderRadius: 8 }}
                preview={false}
              />
            ) : (
              <div className="w-24 h-24 flex items-center justify-center rounded-md border-2 border-dashed border-red-400 bg-gray-50">
                <FaRegImages size={28} className="text-gray-400" />
              </div>
            ))}
          <p>
            {customMessage || (
              <>
                Are you sure you want to delete{" "}
                {name && <strong>{name}</strong>}?
              </>
            )}
          </p>
        </Space>
      )}
    </Modal>
  );
}

export default DeleteModal;
