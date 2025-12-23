import FormSkeleton from "@/components/FormSkeleton";
import { GeneralModal } from "@/components/GeneralModal";
import type { CreditNoteSchema } from "../lib/credit-note.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { CREDIT_NOTE, type CreditNoteResource } from "../lib/credit-note.interface";
import { useCreditNote, useCreditNoteById } from "../lib/credit-note.hook";
import { useCreditNoteStore } from "../lib/credit-note.store";
import { CreditNoteForm } from "./CreditNoteForm";

interface Props {
  id?: number;
  open: boolean;
  title: string;
  mode: "create" | "update";
  onClose: () => void;
}

const { MODEL, EMPTY } = CREDIT_NOTE;

export default function CreditNoteModal({
  id,
  open,
  title,
  mode,
  onClose,
}: Props) {
  const { refetch } = useCreditNote();

  const {
    data: creditNote,
    isFinding: findingCreditNote,
    refetch: refetchCreditNote,
  } = mode === "create"
    ? {
        data: EMPTY,
        isFinding: false,
        refetch: refetch,
      }
    : useCreditNoteById(id!);

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

  const { isSubmitting, updateCreditNote, createCreditNote } =
    useCreditNoteStore();

  const handleSubmit = async (data: CreditNoteSchema) => {
    if (mode === "create") {
      await createCreditNote(data)
        .then(() => {
          onClose();
          successToast(SUCCESS_MESSAGE(MODEL, "create"));
          refetch();
        })
        .catch((error: any) => {
          errorToast(
            error.response.data.message ??
              error.response.data.error ??
              ERROR_MESSAGE(MODEL, "create")
          );
        });
    } else {
      await updateCreditNote(id!, data)
        .then(() => {
          onClose();
          successToast(SUCCESS_MESSAGE(MODEL, "update"));
          refetchCreditNote();
          refetch();
        })
        .catch((error: any) => {
          errorToast(
            error.response.data.message ??
              error.response.data.error ??
              ERROR_MESSAGE(MODEL, "update")
          );
        });
    }
  };

  const isLoadingAny = isSubmitting || findingCreditNote;

  return (
    <GeneralModal open={open} onClose={onClose} title={title} size="2xl">
      {!isLoadingAny && creditNote ? (
        <CreditNoteForm
          defaultValues={mapCreditNoteToForm(creditNote)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode={mode}
          onCancel={onClose}
        />
      ) : (
        <FormSkeleton />
      )}
    </GeneralModal>
  );
}
