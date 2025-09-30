"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
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

const { MODEL } = WORKER;

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
        rol_id: WORKER_ROLE_ID,
      };

      await createPersonWithRole(createPersonData, WORKER_ROLE_ID);
      successToast(
        SUCCESS_MESSAGE({ name: "Trabajador", gender: false }, "create")
      );
      navigate("/trabajadores");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "data" in error.response &&
        typeof error.response.data === "object" &&
        error.response.data !== null &&
        "message" in error.response.data
          ? (error.response.data.message as string)
          : "Error al crear trabajador";

      errorToast(
        errorMessage,
        ERROR_MESSAGE({ name: "Trabajador", gender: false }, "create")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormWrapper>
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <BackButton to="/trabajadores" />
          <TitleFormComponent title={MODEL.name} mode="create" />
        </div>
      </div>

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
