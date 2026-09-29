import { useQueryClient } from "@tanstack/react-query";
import { GeneralModal } from "@/components/GeneralModal";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { SCHEDULE, type ScheduleResource } from "../lib/schedule.interface";
import { useScheduleStore } from "../lib/schedule.store";
import { ScheduleForm } from "./ScheduleForm";
import type { ScheduleSchema } from "../lib/schedule.schema";
import type { Action } from "@/lib/core.interface";

interface Props {
  open: boolean;
  onClose: () => void;
  schedule?: ScheduleResource | null;
}

const { MODEL, EMPTY } = SCHEDULE;

export default function ScheduleModal({ open, onClose, schedule }: Props) {
  const queryClient = useQueryClient();
  const { isSubmitting, createSchedule, updateSchedule } = useScheduleStore();
  const isEdit = !!schedule;
  const action: Action = isEdit ? "edit" : "create";

  const handleSubmit = async (data: ScheduleSchema) => {
    await (isEdit ? updateSchedule(schedule!.id, data) : createSchedule(data))
      .then(async () => {
        onClose();
        successToast(SUCCESS_MESSAGE(MODEL, action));
        await queryClient.invalidateQueries({ queryKey: [SCHEDULE.QUERY_KEY] });
      })
      .catch((error: any) => {
        errorToast(
          error?.response?.data?.message ??
            error?.response?.data?.error ??
            ERROR_MESSAGE(MODEL, action),
        );
      });
  };

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={isEdit ? `Editar ${MODEL.name}` : MODEL.name}
      maxWidth="!max-w-2xl"
    >
      <ScheduleForm
        defaultValues={{
          name: schedule?.name ?? EMPTY.name,
          check_in_time:
            schedule?.check_in_time?.slice(0, 5) ?? EMPTY.check_in_time,
          check_out_time:
            schedule?.check_out_time?.slice(0, 5) ?? EMPTY.check_out_time,
          tolerance_minutes: Number(
            schedule?.tolerance_minutes ?? EMPTY.tolerance_minutes,
          ),
          min_hours: Number(schedule?.min_hours ?? EMPTY.min_hours),
          is_active: schedule?.is_active ?? EMPTY.is_active,
        }}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        onCancel={onClose}
      />
    </GeneralModal>
  );
}
