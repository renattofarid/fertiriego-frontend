import { useQueryClient } from "@tanstack/react-query";
import { GeneralModal } from "@/components/GeneralModal";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { SCHEDULE } from "../lib/schedule.interface";
import { useScheduleStore } from "../lib/schedule.store";
import { ScheduleForm } from "./ScheduleForm";
import type { ScheduleSchema } from "../lib/schedule.schema";

interface Props {
  open: boolean;
  onClose: () => void;
}

const { MODEL, EMPTY } = SCHEDULE;

export default function ScheduleModal({ open, onClose }: Props) {
  const queryClient = useQueryClient();
  const { isSubmitting, createSchedule } = useScheduleStore();

  const handleSubmit = async (data: ScheduleSchema) => {
    await createSchedule(data)
      .then(async () => {
        onClose();
        successToast(SUCCESS_MESSAGE(MODEL, "create"));
        await queryClient.invalidateQueries({ queryKey: [SCHEDULE.QUERY_KEY] });
      })
      .catch((error: any) => {
        errorToast(
          error?.response?.data?.message ??
            error?.response?.data?.error ??
            ERROR_MESSAGE(MODEL, "create"),
        );
      });
  };

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={MODEL.name}
      maxWidth="!max-w-2xl"
    >
      <ScheduleForm
        defaultValues={{
          name: EMPTY.name,
          check_in_time: EMPTY.check_in_time,
          check_out_time: EMPTY.check_out_time,
          tolerance_minutes: EMPTY.tolerance_minutes,
          min_hours: EMPTY.min_hours,
          is_active: EMPTY.is_active,
        }}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        onCancel={onClose}
      />
    </GeneralModal>
  );
}
