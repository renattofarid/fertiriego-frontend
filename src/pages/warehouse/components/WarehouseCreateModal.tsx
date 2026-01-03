"use client";

import { useState } from "react";
import { GeneralModal } from "@/components/GeneralModal";
import { WarehouseForm } from "./WarehouseForm";
import { type WarehouseSchema } from "../lib/warehouse.schema";
import { storeWarehouse } from "../lib/warehouse.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import type { WarehouseResource } from "../lib/warehouse.interface";

interface WarehouseCreateModalProps {
  open: boolean;
  onClose: () => void;
  onWarehouseCreated?: (warehouse: WarehouseResource) => void;
}

export const WarehouseCreateModal = ({
  open,
  onClose,
  onWarehouseCreated,
}: WarehouseCreateModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: WarehouseSchema) => {
    setIsSubmitting(true);
    try {
      const response = await storeWarehouse(data);

      successToast(
        SUCCESS_MESSAGE({ name: "Almacén", gender: false }, "create")
      );

      // Call the callback with the created warehouse
      if (onWarehouseCreated && response?.data) {
        onWarehouseCreated(response.data);
      }

      onClose();
    } catch (error: any) {
      const errorMessage =
        ((error.response?.data?.message ??
          error.response?.data?.error) as string) ?? "Error al crear almacén";

      errorToast(
        errorMessage,
        ERROR_MESSAGE({ name: "Almacén", gender: false }, "create")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title="Crear Almacén"
      subtitle="Complete los campos para crear un nuevo almacén"
      size="3xl"
      icon="Warehouse"
    >
      <WarehouseForm
        defaultValues={{}}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        onCancel={onClose}
        mode="create"
      />
    </GeneralModal>
  );
};
