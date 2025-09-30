import FormSkeleton from "@/components/FormSkeleton";
import { GeneralModal } from "@/components/GeneralModal";
import type { PersonSchema } from "../lib/person.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { createPersonWithRole } from "../lib/person.actions";
import { PersonForm } from "./PersonForm";

interface Props {
  personId?: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  roleId: number;
  title: string;
}


export default function PersonModal({
  personId,
  open,
  onOpenChange,
  onSuccess,
  roleId,
  title
}: Props) {
  const mode = personId ? "update" : "create";
  const modalTitle = personId ? `Editar ${title}` : `Crear ${title}`;

  // For now, we'll only support create mode since we're focusing on role-specific creation
  const initialData = null;
  const isLoading = false;

  const handleSubmit = async (data: PersonSchema) => {
    if (mode === "create") {
      try {
        // Transform PersonSchema to CreatePersonRequest
        const createPersonData = {
          type_document: data.type_document,
          type_person: data.type_person,
          number_document: data.number_document,
          names: data.names || "",
          gender: data.gender,
          birth_date: data.birth_date,
          father_surname: data.father_surname || "",
          mother_surname: data.mother_surname || "",
          business_name: data.business_name || "",
          commercial_name: data.commercial_name || "",
          address: data.address || "",
          phone: data.phone,
          email: data.email,
          ocupation: data.ocupation,
          status: data.status,
        };

        await createPersonWithRole(createPersonData, roleId);
        successToast(SUCCESS_MESSAGE({ name: title, gender: false }, "create"));
        onSuccess?.();
        onOpenChange(false);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error && 'response' in error &&
          typeof error.response === 'object' && error.response !== null &&
          'data' in error.response && typeof error.response.data === 'object' &&
          error.response.data !== null && 'message' in error.response.data ?
          error.response.data.message as string : `Error al crear ${title.toLowerCase()}`;

        errorToast(
          errorMessage,
          ERROR_MESSAGE({ name: title, gender: false }, "create")
        );
        throw error; // Re-throw to prevent form reset
      }
    } else {
      // Update functionality can be implemented later if needed
      throw new Error("Update mode not implemented yet");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title={modalTitle}
      maxWidth="!max-w-4xl"
    >
      {isLoading ? (
        <FormSkeleton />
      ) : (
        <PersonForm
          initialData={initialData}
          onSubmit={handleSubmit}
          isSubmitting={false}
          onCancel={handleClose}
          roleId={roleId}
        />
      )}
    </GeneralModal>
  );
}