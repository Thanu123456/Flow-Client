// src/components/Warehouses/DeleteWarehouseModal.tsx
import React, { useState, useEffect } from "react";
import { message } from "antd";
import { DeleteModal } from "../common/Modal";
import { useWarehouseStore } from "../../store/management/warehouseStore";
import type { Warehouse } from "../../types/entities/warehouse.types";

interface DeleteWarehouseModalProps {
  visible: boolean;
  warehouse: Warehouse | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const DeleteWarehouseModal: React.FC<DeleteWarehouseModalProps> = ({
  visible,
  warehouse,
  onCancel,
  onSuccess,
}) => {
  const { deleteWarehouse, checkStockExists } = useWarehouseStore();
  const [hasStock, setHasStock] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (visible && warehouse) {
      checkWarehouseStock();
    }
  }, [visible, warehouse]);

  const checkWarehouseStock = async () => {
    if (!warehouse) return;

    setChecking(true);
    try {
      const stockExists = await checkStockExists(warehouse.id);
      setHasStock(stockExists);

      if (stockExists) {
        message.warning(
          "This warehouse has existing stock and cannot be deleted. Please transfer or remove all stock first."
        );
      }
    } catch (error) {
      console.error("Failed to check stock:", error);
    } finally {
      setChecking(false);
    }
  };

  const handleDelete = async (warehouseData: Warehouse) => {
    // Double-check stock before deletion
    const stockExists = await checkStockExists(warehouseData.id);

    if (stockExists) {
      message.error(
        "Cannot delete warehouse with existing stock. Please remove all stock first."
      );
      throw new Error("Warehouse has existing stock");
    }

    await deleteWarehouse(warehouseData.id);
  };

  return (
    <DeleteModal<Warehouse>
      visible={visible}
      title="Confirm Delete"
      data={warehouse}
      onCancel={onCancel}
      onSuccess={onSuccess}
      onDelete={handleDelete}
      getName={(wh) => wh?.name}
      customMessage={
        warehouse && (
          <div>
            {checking ? (
              <p>Checking warehouse stock...</p>
            ) : hasStock ? (
              <>
                <p style={{ color: "#ff4d4f", fontWeight: 600 }}>
                  ⚠️ This warehouse has existing stock!
                </p>
                <p>
                  Cannot delete warehouse <strong>{warehouse.name}</strong> (
                  {warehouse.code}). Please transfer or remove all stock first.
                </p>
              </>
            ) : (
              <>
                <p>
                  Are you sure you want to delete the warehouse{" "}
                  <strong>{warehouse.name}</strong> ({warehouse.code})?
                </p>
                <p style={{ fontSize: 12, color: "#666" }}>
                  Location: {warehouse.city}, {warehouse.state}
                </p>
              </>
            )}
          </div>
        )
      }
    />
  );
};

export default DeleteWarehouseModal;
