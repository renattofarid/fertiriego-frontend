import { useQueryClient } from "@tanstack/react-query";
import { GeneralModal } from "@/components/GeneralModal";
import { errorToast, successToast } from "@/lib/core.function";
import { VACATION_CONTROL_QUERY_KEY } from "../lib/vacation.interface";
import { useVacationStore } from "../lib/vacation.store";
import { VacationControlForm } from "./VacationControlForm";
import type { VacationControlSchema } from "../lib/vacation.schema";

interface Props {
  personId: number;
  open: boolean;
  onClose: () => void;
}

export default function VacationControlModal({
  personId,
  open,
  onClose,
}: Props) {
  const queryClient = useQueryClient();
  const { isConfiguringControl, configureVacationControl } = useVacationStore();

  const handleSubmit = async (data: VacationControlSchema) => {
    await configureVacationControl(personId, data)
      .then(async (response) => {
        onClose();
        successToast(
          response.message ?? "Períodos vacacionales generados exitosamente",
        );
        await queryClient.invalidateQueries({
          queryKey: [VACATION_CONTROL_QUERY_KEY, personId],
        });
      })
      .catch((error: any) => {
        errorToast(
          error?.response?.data?.message ??
            error?.response?.data?.error ??
            "Error al configurar el control de vacaciones.",
        );
      });
  };

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title="Configurar Control de Vacaciones"
      subtitle="Actualice la fecha de ingreso y/o los días de vacaciones por año"
      maxWidth="!max-w-lg"
    >
      <VacationControlForm
        defaultValues={{ hire_date: "", vacation_days_per_year: 30 }}
        onSubmit={handleSubmit}
        isSubmitting={isConfiguringControl}
        onCancel={onClose}
      />
    </GeneralModal>
  );
}
