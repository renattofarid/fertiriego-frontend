import { useNavigate, useParams } from "react-router-dom";
import TitleComponent from "@/components/TitleComponent";
import { CREDIT_NOTE, type CreditNoteResource } from "../lib/credit-note.interface";
import { CreditNoteForm } from "./CreditNoteForm";
import { useCreditNoteStore } from "../lib/credit-note.store";
import { useCreditNoteById } from "../lib/credit-note.hook";
import type { CreditNoteSchema } from "../lib/credit-note.schema";
import {
  errorToast,
  successToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import FormSkeleton from "@/components/FormSkeleton";

const { MODEL, ICON, TITLES } = CREDIT_NOTE;

export default function CreditNoteEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const creditNoteId = Number(id);

  const { data: creditNote, isFinding } = useCreditNoteById(creditNoteId);
  const { isSubmitting, updateCreditNote } = useCreditNoteStore();

  const mapCreditNoteToForm = (
    data: CreditNoteResource
  ): Partial<CreditNoteSchema> => ({
    sale_id: data?.sale_id || 0,
    issue_date: data?.issue_date || new Date().toISOString().split("T")[0],
    credit_note_type: data?.credit_note_type || "",
    reason: data?.reason || "",
    affects_stock: data?.affects_stock ?? true,
    details:
      data?.details?.map((detail) => ({
        sale_detail_id: detail.sale_detail_id,
        product_id: detail.product_id,
        quantity: detail.quantity,
        unit_price: detail.unit_price,
      })) || [],
  });

  const handleSubmit = async (data: CreditNoteSchema) => {
    await updateCreditNote(creditNoteId, data)
      .then(() => {
        successToast(SUCCESS_MESSAGE(MODEL, "update"));
        navigate("/notas-credito");
      })
      .catch((error: any) => {
        errorToast(
          error.response?.data?.message ??
            error.response?.data?.error ??
            ERROR_MESSAGE(MODEL, "update")
        );
      });
  };

  const handleCancel = () => {
    navigate("/notas-credito");
  };

  if (isFinding) {
    return (
      <div className="space-y-4">
        <TitleComponent
          title={TITLES.update.title}
          subtitle={TITLES.update.subtitle}
          icon={ICON}
        />
        <div className="bg-card rounded-lg border p-6">
          <FormSkeleton />
        </div>
      </div>
    );
  }

  if (!creditNote) {
    return (
      <div className="space-y-4">
        <TitleComponent
          title="Error"
          subtitle="No se encontró la nota de crédito"
          icon={ICON}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <TitleComponent
        title={TITLES.update.title}
        subtitle={TITLES.update.subtitle}
        icon={ICON}
      />

      <div className="bg-card rounded-lg border">
        <CreditNoteForm
          defaultValues={mapCreditNoteToForm(creditNote)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode="update"
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
