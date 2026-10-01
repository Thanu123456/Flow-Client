import React from "react";
import type { WarehouseFormData } from "../../types/entities/warehouse.types";
import { warehouseService } from "../../services/management/warehouseService";
import AddModal from "../common/Modal/AddModal";
import WarehouseFormFields from "./WarehouseFormFields";

interface AddWarehouseModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const AddWarehouseModal: React.FC<AddWarehouseModalProps> = ({
  visible,
  onCancel,
  onSuccess,
}) => {
  const handleSubmit = async (values: any) => {
    const warehouseData: WarehouseFormData = {
      name: values.name,
      code: values.code,
      warehouseType: values.warehouseType,
      managerUserId: values.managerUserId,
      capacity: values.capacity ?? undefined,
      isDefault: values.isDefault ? true : undefined,
      contactPerson: values.contactPerson,
      email: values.email,
      mobile: values.mobile,
      phone: values.phone,
      city: values.city,
      address: values.address,
      status: values.status ? "active" : "inactive",
    };

    await warehouseService.createWarehouse(warehouseData);
  };

  return (
    <AddModal
      visible={visible}
      title="Add Warehouse"
      onCancel={onCancel}
      onSuccess={onSuccess}
      onSubmit={handleSubmit}
      initialValues={{ status: true, warehouseType: "store", isDefault: false }}
      submitButtonText="Add Warehouse"
      width={700}
    >
      {() => <WarehouseFormFields />}
    </AddModal>
  );
};

export default AddWarehouseModal;
