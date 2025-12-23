import FormSkeleton from "@/components/FormSkeleton";
import { GeneralModal } from "@/components/GeneralModal";
import type { DebitNoteSchema } from "../lib/debit-note.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import {
  DEBIT_NOTE,
  type DebitNoteResource,
} from "../lib/debit-note.interface";
import { useDebitNote, useDebitNoteById } from "../lib/debit-note.hook";
import { useDebitNoteStore } from "../lib/debit-note.store";
import { DebitNoteForm } from "./DebitNoteForm";

interface Props {
  id?: number;
  open: boolean;
  title: string;
  mode: "create" | "update";
  onClose: () => void;
}

const { MODEL, EMPTY } = DEBIT_NOTE;

export default function DebitNoteModal({
  id,
  open,
  title,
  mode,
  onClose,
}: Props) {
  const { refetch } = useDebitNote();

  const {
    data: debitNote,
    isFinding: findingDebitNote,
    refetch: refetchDebitNote,
  } = mode === "create"
    ? {
        data: EMPTY,
        isFinding: false,
        refetch: refetch,
      }
    : useDebitNoteById(id!);

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

  const { isSubmitting, updateDebitNote, createDebitNote } =
    useDebitNoteStore();

  const handleSubmit = async (data: DebitNoteSchema) => {
    if (mode === "create") {
      await createDebitNote(data)
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
      await updateDebitNote(id!, data)
        .then(() => {
          onClose();
          successToast(SUCCESS_MESSAGE(MODEL, "update"));
          refetchDebitNote();
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

  const isLoadingAny = isSubmitting || findingDebitNote;

  return (
    <GeneralModal open={open} onClose={onClose} title={title} size="2xl">
      {!isLoadingAny && debitNote ? (
        <DebitNoteForm
          defaultValues={mapDebitNoteToForm(debitNote)}
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
