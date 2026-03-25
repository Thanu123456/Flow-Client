import { useState } from "react";
import { Modal, Space, Image, App, Typography } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { FaRegImages } from "react-icons/fa";
import type { DeleteModalProps } from "./Modal.types";

const { Title, Text } = Typography;

function DeleteModal<T = any>({
  visible,
  title = "Confirm Delete",
  data,
  onCancel,
  onSuccess,
  onDelete,
  loading: externalLoading,
  okText = "Delete",
  cancelText = "Cancel",
  renderContent,
  getImageUrl,
  getName,
  customMessage,
  showImage = true,
  icon,
  subtitle,
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
      open={visible}
      onOk={handleDelete}
      onCancel={onCancel}
      width={450}
      okText={okText}
      cancelText={cancelText}
      centered
      confirmLoading={loading}
      okButtonProps={{
        danger: true,
        style: { borderRadius: '6px' }
      }}
      cancelButtonProps={{ style: { borderRadius: '6px' } }}
      title={
        <div style={{
          background: 'linear-gradient(90deg, #fff1f0 0%, #ffffff 100%)',
          padding: '16px 24px',
          margin: '-20px -24px 0 -24px',
          borderBottom: '1px solid #f0f0f0',
          borderRadius: '8px 8px 0 0',
        }}>
          <Space align="start">
            <div style={{
              background: '#fff1f0',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f5222d',
              border: '1px solid #ffa39e'
            }}>
              {icon || <ExclamationCircleOutlined style={{ fontSize: '20px' }} />}
            </div>
            <Space direction="vertical" size={0}>
              <Title level={4} style={{ margin: 0 }}>{title}</Title>
              {subtitle && <Text type="secondary" style={{ fontSize: '13px' }}>{subtitle}</Text>}
            </Space>
          </Space>
        </div>
      }
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
