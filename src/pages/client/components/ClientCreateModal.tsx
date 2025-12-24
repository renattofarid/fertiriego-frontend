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
import { CLIENT_ROLE_ID } from "../lib/client.interface";
import type { PersonResource } from "@/pages/person/lib/person.interface";

interface ClientCreateModalProps {
  open: boolean;
  onClose: () => void;
  onClientCreated?: (client: PersonResource) => void;
}

export const ClientCreateModal = ({
  open,
  onClose,
  onClientCreated,
}: ClientCreateModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: PersonSchema) => {
    setIsSubmitting(true);
    try {
      // Transform PersonSchema to CreatePersonRequest
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
        SUCCESS_MESSAGE({ name: "Cliente", gender: false }, "create")
      );

      // Call the callback with the created client
      if (onClientCreated && response?.data) {
        onClientCreated(response.data);
      }

      onClose();
    } catch (error: any) {
      const errorMessage =
        ((error.response?.data?.message ??
          error.response?.data?.error) as string) ?? "Error al crear cliente";

      errorToast(
        errorMessage,
        ERROR_MESSAGE({ name: "Cliente", gender: false }, "create")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title="Crear Cliente"
      subtitle="Complete los campos para crear un nuevo cliente"
      size="4xl"
      icon="UserPlus"
    >
      <PersonForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        onCancel={onClose}
        roleId={CLIENT_ROLE_ID}
      />
    </GeneralModal>
  );
};
