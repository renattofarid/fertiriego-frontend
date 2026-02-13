"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TitleFormComponent from "@/components/TitleFormComponent";
import { PersonForm } from "@/pages/person/components/PersonForm";
import { type PersonSchema } from "@/pages/person/lib/person.schema";
import { createPersonWithRole } from "@/pages/person/lib/person.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { WORKER, WORKER_ROLE_ID } from "../lib/worker.interface";
import FormWrapper from "@/components/FormWrapper";

const { MODEL, ROUTE } = WORKER;

export default function WorkerAddPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: PersonSchema) => {
    setIsSubmitting(true);
    try {
      // Transform PersonSchema to CreatePersonRequest
      const createPersonData = {
        username: data.number_document, // Use document number as username
        password: data.number_document, // Use document number as password
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

      await createPersonWithRole(createPersonData, Number(data.role_id));
      successToast(
        SUCCESS_MESSAGE({ name: "Trabajador", gender: false }, "create"),
      );
      navigate("/trabajadores");
    } catch (error: any) {
      const errorMessage =
        ((error.response.data.message ??
          error.response.data.error) as string) ?? "Error al crear trabajador";

      errorToast(
        errorMessage,
        ERROR_MESSAGE({ name: "Trabajador", gender: false }, "create"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormWrapper>
      <TitleFormComponent title={MODEL.name} mode="create" backRoute={ROUTE} />

      <PersonForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        onCancel={() => navigate("/trabajadores")}
        roleId={WORKER_ROLE_ID}
        isWorker={true}
      />
    </FormWrapper>
  );
}
