import React, { useEffect } from "react";
import { message } from "antd";
import type { Warehouse, WarehouseFormData } from "../../types/entities/warehouse.types";
import { useWarehouseStore } from "../../store/management/warehouseStore";
import EditModal from "../common/Modal/EditModal";
import WarehouseFormFields from "./WarehouseFormFields";

interface EditWarehouseModalProps {
  visible: boolean;
  warehouse: Warehouse | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const EditWarehouseModal: React.FC<EditWarehouseModalProps> = ({
  visible,
  warehouse,
  onCancel,
  onSuccess,
}) => {
  const { updateWarehouse, error, clearError } = useWarehouseStore();

  useEffect(() => {
    if (visible && warehouse) {
      clearError();
    }
  }, [visible, warehouse, clearError]);

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  const handleSubmit = async (values: any, originalData: Warehouse) => {
    const warehouseData: Partial<WarehouseFormData> = {
      name: values.name,
      code: values.code,
      warehouseType: values.warehouseType,
      // "" clears the manager; null clears the capacity
      managerUserId: values.managerUserId ?? "",
      capacity: values.capacity ?? null,
      isDefault: values.isDefault && !originalData.isDefault ? true : undefined,
      contactPerson: values.contactPerson,
      email: values.email,
      mobile: values.mobile,
      phone: values.phone,
      city: values.city,
      address: values.address,
      status: values.status ? "active" : "inactive",
      updatedAt: originalData.updatedAt,
    };

    await updateWarehouse(originalData.id, warehouseData);
  };

  const mapDataToForm = (w: Warehouse) => ({
    name: w.name,
    code: w.code,
    warehouseType: w.warehouseType,
    managerUserId: w.managerUserId,
    capacity: w.capacity,
    isDefault: w.isDefault,
    contactPerson: w.contactPerson,
    email: w.email,
    mobile: w.mobile,
    phone: w.phone,
    city: w.city,
    address: w.address,
    status: w.status === "active",
  });

  return (
    <EditModal<Warehouse>
      visible={visible}
      title="Edit Warehouse"
      data={warehouse}
      onCancel={onCancel}
      onSuccess={onSuccess}
      onSubmit={handleSubmit}
      mapDataToForm={mapDataToForm}
      submitButtonText="Update Warehouse"
      width={700}
    >
      {() => (
        <WarehouseFormFields
          isEdit
          isCurrentDefault={warehouse?.isDefault}
          currentManager={
            warehouse?.managerUserId && warehouse.managerName
              ? { id: warehouse.managerUserId, name: warehouse.managerName }
              : undefined
          }
        />
      )}
    </EditModal>
  );
};

export default EditWarehouseModal;
