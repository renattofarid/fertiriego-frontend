import { useQueryClient } from "@tanstack/react-query";
import { GeneralModal } from "@/components/GeneralModal";
import { errorToast, successToast } from "@/lib/core.function";
import {
  VACATION_META,
  VACATION_QUERY_KEY,
} from "../lib/vacation.interface";
import { useVacationStore } from "../lib/vacation.store";
import { VacationForm } from "./VacationForm";
import type { VacationSchema } from "../lib/vacation.schema";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function VacationModal({ open, onClose }: Props) {
  const queryClient = useQueryClient();
  const { isSubmitting, createVacation } = useVacationStore();

  const handleSubmit = async (data: VacationSchema) => {
    await createVacation(data)
      .then(async () => {
        onClose();
        successToast(
          `${VACATION_META.MODEL.name} registrada correctamente.`,
        );
        await queryClient.invalidateQueries({
          queryKey: [VACATION_QUERY_KEY],
        });
      })
      .catch((error: any) => {
        errorToast(
          error?.response?.data?.message ??
            error?.response?.data?.error ??
            `Error al registrar la ${VACATION_META.MODEL.name.toLowerCase()}.`,
        );
      });
  };

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={VACATION_META.MODEL.name}
      maxWidth="!max-w-2xl"
    >
      <VacationForm
        defaultValues={{
          person_id: "",
          start_date: "",
          end_date: "",
          reason: "",
        }}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        onCancel={onClose}
      />
    </GeneralModal>
  );
}
