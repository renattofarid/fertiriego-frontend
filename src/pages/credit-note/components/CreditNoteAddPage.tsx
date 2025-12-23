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

const { MODEL, ICON, TITLES } = CREDIT_NOTE;

export default function CreditNoteAddPage() {
  const navigate = useNavigate();
  const { isSubmitting, createCreditNote } = useCreditNoteStore();

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
    <div className="space-y-4">
      <TitleComponent
        title={TITLES.create.title}
        subtitle={TITLES.create.subtitle}
        icon={ICON}
      />

      <div className="bg-card rounded-lg border">
        <CreditNoteForm
          defaultValues={{
            sale_id: 0,
            issue_date: new Date().toISOString().split("T")[0],
            credit_note_type: "",
            reason: "",
            affects_stock: true,
            details: [],
          }}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode="create"
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
