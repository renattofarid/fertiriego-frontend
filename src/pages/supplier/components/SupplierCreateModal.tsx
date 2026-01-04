"use client";

import { useState } from "react";
import { GeneralModal } from "@/components/GeneralModal";
import { PersonForm } from "@/pages/person/components/PersonForm";
import { type PersonSchema } from "@/pages/person/lib/person.schema";
import { createPersonWithRole } from "@/pages/person/lib/person.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { SUPPLIER_ROLE_ID } from "../lib/supplier.interface";
import type { PersonResource } from "@/pages/person/lib/person.interface";

interface SupplierCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSupplierCreated?: (supplier: PersonResource) => void;
}

export const SupplierCreateModal = ({
  open,
  onClose,
  onSupplierCreated,
}: SupplierCreateModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: PersonSchema) => {
    setIsSubmitting(true);
    try {
      const createPersonData = {
        username: data.number_document,
        password: data.number_document,
        type_document: data.type_document,
        type_person: data.type_person,
        number_document: data.number_document,
        names: data.names || "",
        gender: data.type_person === "NATURAL" ? data.gender || "M" : undefined,
        birth_date:
          data.type_person === "NATURAL" ? data.birth_date || "" : undefined,
        father_surname: data.father_surname || "",
        mother_surname: data.mother_surname || "",
        business_name: data.business_name || "",
        commercial_name: data.commercial_name || "",
        address: data.address || "",
        phone: data.phone,
        email: data.email,
        status: "Activo",
        role_id: Number(data.role_id),
      };

      const response = await createPersonWithRole(
        createPersonData,
        Number(data.role_id)
      );

      successToast(
        SUCCESS_MESSAGE({ name: "Proveedor", gender: false }, "create")
      );

      if (onSupplierCreated && response?.data) {
        onSupplierCreated(response.data);
      }

      onClose();
    } catch (error: any) {
      const errorMessage =
        ((error.response?.data?.message ??
          error.response?.data?.error) as string) ?? "Error al crear proveedor";

      errorToast(
        errorMessage,
        ERROR_MESSAGE({ name: "Proveedor", gender: false }, "create")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title="Crear Proveedor"
      subtitle="Complete los campos para crear un nuevo proveedor"
      size="4xl"
      icon="UserPlus"
    >
      <PersonForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        onCancel={onClose}
        roleId={SUPPLIER_ROLE_ID}
      />
    </GeneralModal>
  );
};
