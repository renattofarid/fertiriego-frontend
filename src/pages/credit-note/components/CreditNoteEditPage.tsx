import { useNavigate, useParams } from "react-router-dom";
import TitleComponent from "@/components/TitleComponent";
import {
  CREDIT_NOTE,
  type CreditNoteResource,
} from "../lib/credit-note.interface";
import { CreditNoteForm } from "./CreditNoteForm";
import { useCreditNoteStore } from "../lib/credit-note.store";
import {
  useCreditNoteById,
  useCreditNoteReasons,
} from "../lib/credit-note.hook";
import type { CreditNoteSchema } from "../lib/credit-note.schema";
import {
  errorToast,
  successToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import FormSkeleton from "@/components/FormSkeleton";
import FormWrapper from "@/components/FormWrapper";

const { MODEL, ICON, TITLES } = CREDIT_NOTE;

export default function CreditNoteEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const creditNoteId = Number(id);

  const { data: creditNote, isFinding } = useCreditNoteById(creditNoteId);
  const { isSubmitting, updateCreditNote } = useCreditNoteStore();
  const { data: creditNoteReasons = [], isLoading } = useCreditNoteReasons();

  const mapCreditNoteToForm = (
    data: CreditNoteResource
  ): Partial<CreditNoteSchema> => ({
    sale_id: data?.sale.id.toString() || "",
    credit_note_motive_id: data?.credit_note_motive_id.toString() || "",
    issue_date: data?.issue_date || new Date().toISOString().split("T")[0],
    reason: data?.reason || "",
    affects_stock: data?.affects_stock ?? true,
    details:
      data?.details?.map((detail) => ({
        sale_detail_id: detail.sale_detail_id.toString(),
        product_id: detail.product_id,
        quantity: Number(detail.quantity),
        unit_price: Number(detail.unit_price),
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

  return (
    <FormWrapper>
      <TitleComponent
        title={TITLES.update.title}
        subtitle={TITLES.update.subtitle}
        icon={ICON}
      />

      {isFinding || isLoading || !creditNote ? (
        <FormSkeleton />
      ) : (
        <CreditNoteForm
          defaultValues={mapCreditNoteToForm(creditNote)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode="update"
          creditNoteReasons={creditNoteReasons || []}
          onCancel={handleCancel}
        />
      )}
    </FormWrapper>
  );
}
