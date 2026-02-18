import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { DRIVER, DRIVER_ROLE_ID } from "../lib/driver.interface";

interface Props {
  open: boolean;
  onClose: () => void;
}

const { MODEL, ICON } = DRIVER;

export default function DriverCreateModal({ open, onClose }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

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
        driver_license: (data as any).driver_license || "",
        status: "Activo",
        role_id: Number(data.role_id),
      };

      await createPersonWithRole(createPersonData, DRIVER_ROLE_ID);
      await queryClient.invalidateQueries({ queryKey: [DRIVER.QUERY_KEY] });
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      onClose();
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ??
          error?.response?.data?.error ??
          ERROR_MESSAGE(MODEL, "create"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={`Crear ${MODEL.name}`}
      subtitle="Complete el formulario para registrar un nuevo conductor"
      size="3xl"
      icon={ICON}
    >
      <PersonForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        onCancel={onClose}
        roleId={DRIVER_ROLE_ID}
        isWorker={true}
        showDriverLicense={true}
      />
    </GeneralModal>
  );
}
