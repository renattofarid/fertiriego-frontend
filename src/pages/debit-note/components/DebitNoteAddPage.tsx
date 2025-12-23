import { useNavigate } from "react-router-dom";
import TitleComponent from "@/components/TitleComponent";
import { useDebitNoteStore } from "../lib/debit-note.store";
import type { DebitNoteSchema } from "../lib/debit-note.schema";
import {
  errorToast,
  successToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import FormWrapper from "@/components/FormWrapper";
import { DEBIT_NOTE } from "../lib/debit-note.interface";
import { DebitNoteForm } from "./DebitNoteForm";

const { MODEL, ICON, TITLES } = DEBIT_NOTE;

export default function DebitNoteAddPage() {
  const navigate = useNavigate();
  const { isSubmitting, createDebitNote } = useDebitNoteStore();

  const handleSubmit = async (data: DebitNoteSchema) => {
    await createDebitNote(data)
      .then(() => {
        successToast(SUCCESS_MESSAGE(MODEL, "create"));
        navigate("/notas-debito");
      })
      .catch((error: any) => {
        errorToast(
          error.response?.data?.message ??
            error.response?.data?.error ??
            ERROR_MESSAGE(MODEL, "create")
        );
      });
  };

  const handleCancel = () => {
    navigate("/notas-debito");
  };

  return (
    <FormWrapper>
      <TitleComponent
        title={TITLES.create.title}
        subtitle={TITLES.create.subtitle}
        icon={ICON}
      />

      <DebitNoteForm
        defaultValues={{
          sale_id: "",
          issue_date: "",
          debit_note_type: "",
          reason: "",
          affects_stock: true,
          details: [],
        }}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        mode="create"
        onCancel={handleCancel}
      />
    </FormWrapper>
  );
}
