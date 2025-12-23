import { useNavigate } from "react-router-dom";
import TitleComponent from "@/components/TitleComponent";
import { CREDIT_NOTE } from "../lib/credit-note.interface";
import { CreditNoteForm } from "./CreditNoteForm";
import { useCreditNoteStore } from "../lib/credit-note.store";
import type { CreditNoteSchema } from "../lib/credit-note.schema";
import {
  errorToast,
  successToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import FormWrapper from "@/components/FormWrapper";
import { useCreditNoteReasons } from "../lib/credit-note.hook";
import FormSkeleton from "@/components/FormSkeleton";

const { MODEL, ICON, TITLES } = CREDIT_NOTE;

export default function CreditNoteAddPage() {
  const navigate = useNavigate();
  const { isSubmitting, createCreditNote } = useCreditNoteStore();
  const { data: creditNoteReasons = [], isLoading } = useCreditNoteReasons();

  const handleSubmit = async (data: CreditNoteSchema) => {
    await createCreditNote(data)
      .then(() => {
        successToast(SUCCESS_MESSAGE(MODEL, "create"));
        navigate("/notas-credito");
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
    navigate("/notas-credito");
  };

  return (
    <FormWrapper>
      <TitleComponent
        title={TITLES.create.title}
        subtitle={TITLES.create.subtitle}
        icon={ICON}
      />

      {isSubmitting || isLoading ? (
        <FormSkeleton />
      ) : (
        <CreditNoteForm
          defaultValues={{
            sale_id: "",
            issue_date: "",
            credit_note_type: "",
            reason: "",
            affects_stock: true,
            details: [],
          }}
          creditNoteReasons={creditNoteReasons}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode="create"
          onCancel={handleCancel}
        />
      )}
    </FormWrapper>
  );
}
