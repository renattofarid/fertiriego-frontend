import { useNavigate, useParams } from "react-router-dom";
import TitleComponent from "@/components/TitleComponent";
import {
  DEBIT_NOTE,
  type DebitNoteResource,
} from "../lib/debit-note.interface";
import { DebitNoteForm } from "./DebitNoteForm";
import { useDebitNoteStore } from "../lib/debit-note.store";
import { useDebitNoteById } from "../lib/debit-note.hook";
import type { DebitNoteSchema } from "../lib/debit-note.schema";
import {
  errorToast,
  successToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import FormSkeleton from "@/components/FormSkeleton";

const { MODEL, ICON, TITLES } = DEBIT_NOTE;

export default function DebitNoteEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const debitNoteId = Number(id);

  const { data: debitNote, isFinding } = useDebitNoteById(debitNoteId);
  const { isSubmitting, updateDebitNote } = useDebitNoteStore();

  const mapDebitNoteToForm = (
    data: DebitNoteResource
  ): Partial<DebitNoteSchema> => ({
    sale_id: data?.sale_id.toString() || "",
    issue_date: data?.issue_date || new Date().toISOString().split("T")[0],
    debit_note_type: data?.debit_note_type || "",
    reason: data?.reason || "",
    affects_stock: data?.affects_stock ?? true,
    details:
      data?.details?.map((detail) => ({
        sale_detail_id: detail.sale_detail_id.toString(),
        product_id: detail.product_id,
        quantity: detail.quantity,
        unit_price: detail.unit_price,
      })) || [],
  });

  const handleSubmit = async (data: DebitNoteSchema) => {
    await updateDebitNote(debitNoteId, data)
      .then(() => {
        successToast(SUCCESS_MESSAGE(MODEL, "update"));
        navigate("/notas-debito");
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
    navigate("/notas-debito");
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

  if (!debitNote) {
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
        <DebitNoteForm
          defaultValues={mapDebitNoteToForm(debitNote)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode="update"
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
