
import { Modal } from "antd";
import type { ReactNode } from "react";

export interface ViewModalProps<T = any> {
  visible: boolean;
  title?: string;
  data: T | null;
  width?: number;
  onCancel: () => void;
  children: ReactNode | ((data: T | null) => ReactNode);
}

const ViewModal = <T,>({
  visible,
  title = "View Details",
  data,
  width = 600,
  onCancel,
  children,
}: ViewModalProps<T>) => {
  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={width}
    >
      {typeof children === "function" ? children(data) : children}
    </Modal>
  );
};

export default ViewModal;
