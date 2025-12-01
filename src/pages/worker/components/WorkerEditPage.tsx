"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import { type PersonSchema } from "@/pages/person/lib/person.schema";
import { PersonForm } from "@/pages/person/components/PersonForm";
import {
  findPersonById,
  updatePerson,
} from "@/pages/person/lib/person.actions";
import {
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
  successToast,
  errorToast,
} from "@/lib/core.function";
import { WORKER, WORKER_ROLE_ID } from "../lib/worker.interface";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import TitleFormComponent from "@/components/TitleFormComponent";
import FormWrapper from "@/components/FormWrapper";

const { MODEL } = WORKER;

export default function WorkerEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [personData, setPersonData] = useState<PersonResource | null>(null);

  useEffect(() => {
    const loadPersonData = async () => {
      if (!id) {
        navigate("/trabajadores");
        return;
      }

      try {
        setIsLoading(true);
        const response = await findPersonById(Number(id));
        const person = response.data;
        setPersonData(person);
      } catch {
        errorToast("Error al cargar los datos del trabajador");
        navigate("/trabajadores");
      } finally {
        setIsLoading(false);
      }
    };

    loadPersonData();
  }, [id, navigate]);

  const handleSubmit = async (data: PersonSchema) => {
    if (!personData) return;

    setIsSubmitting(true);
    try {
      // Transform PersonSchema to UpdatePersonRequest
      const updatePersonData = {
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
      };

      await updatePerson(personData.id, updatePersonData);
      successToast(
        SUCCESS_MESSAGE({ name: "Trabajador", gender: false }, "update")
      );
      navigate("/trabajadores");
    } catch (error: any) {
      const errorMessage =
        error instanceof Error &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "data" in error.response &&
        typeof error.response.data === "object" &&
        error.response.data !== null &&
        "message" in error.response.data
          ? ((error.response.data.message ?? error.response.data.error) as string)
          : "Error al actualizar trabajador";

      errorToast(
        errorMessage,
        ERROR_MESSAGE({ name: "Trabajador", gender: false }, "update")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <FormWrapper>
      <div className="flex items-center gap-4 mb-6">
        <BackButton to="/trabajadores" />
        <TitleFormComponent title={MODEL.name} mode="edit" />
      </div>

      <PersonForm
        initialData={personData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        onCancel={() => navigate("/trabajadores")}
        roleId={WORKER_ROLE_ID}
        isWorker={true}
      />
    </FormWrapper>
  );
}
