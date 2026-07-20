import { useQueryClient } from "@tanstack/react-query";
import { GeneralModal } from "@/components/GeneralModal";
import { errorToast, successToast } from "@/lib/core.function";
import {
  JUSTIFICATION_META,
  JUSTIFICATION_QUERY_KEY,
} from "../lib/justification.interface";
import { useJustificationStore } from "../lib/justification.store";
import { JustificationForm } from "./JustificationForm";
import type { JustificationSchema } from "../lib/justification.schema";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function JustificationModal({ open, onClose }: Props) {
  const queryClient = useQueryClient();
  const { isSubmitting, createJustification } = useJustificationStore();

  const handleSubmit = async (data: JustificationSchema) => {
    await createJustification(data)
      .then(async () => {
        onClose();
        successToast(
          `${JUSTIFICATION_META.MODEL.name} registrada correctamente.`,
        );
        await queryClient.invalidateQueries({
          queryKey: [JUSTIFICATION_QUERY_KEY],
        });
      })
      .catch((error: any) => {
        errorToast(
          error?.response?.data?.message ??
            error?.response?.data?.error ??
            `Error al registrar la ${JUSTIFICATION_META.MODEL.name.toLowerCase()}.`,
        );
      });
  };

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={JUSTIFICATION_META.MODEL.name}
      maxWidth="!max-w-2xl"
    >
      <JustificationForm
        defaultValues={{
          person_id: "",
          date_from: "",
          date_until: "",
          type: "",
          reason: "",
        }}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        onCancel={onClose}
      />
    </GeneralModal>
  );
}
