"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { GeneralModal } from "@/components/GeneralModal";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import {
  scheduleOvertimeRateSchema,
  type ScheduleOvertimeRateSchema,
} from "../lib/overtime.schema";
import { useOvertimeStore } from "../lib/overtime.store";
import { SCHEDULE } from "@/pages/hr-schedule/lib/schedule.interface";
import { errorToast, successToast } from "@/lib/core.function";

interface Props {
  scheduleId: number;
  scheduleName: string;
  currentRate?: number;
  open: boolean;
  onClose: () => void;
}

export default function ScheduleOvertimeRateModal({
  scheduleId,
  scheduleName,
  currentRate,
  open,
  onClose,
}: Props) {
  const queryClient = useQueryClient();
  const { isSettingScheduleRate, setScheduleOvertimeRate } = useOvertimeStore();

  const form = useForm<ScheduleOvertimeRateSchema>({
    resolver: zodResolver(scheduleOvertimeRateSchema),
    defaultValues: { overtime_rate: currentRate ?? 1.5 },
    mode: "onChange",
  });

  const handleSubmit = async (data: ScheduleOvertimeRateSchema) => {
    await setScheduleOvertimeRate(scheduleId, data)
      .then(async () => {
        onClose();
        successToast("Tasa de horas extras del horario actualizada correctamente.");
        await queryClient.invalidateQueries({ queryKey: [SCHEDULE.QUERY_KEY] });
      })
      .catch((error: any) => {
        errorToast(
          error?.response?.data?.message ??
            error?.response?.data?.error ??
            "Error al actualizar la tasa de horas extras del horario.",
        );
      });
  };

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title="Tasa de Horas Extras"
      subtitle={`Configure la tasa/multiplicador aplicado al horario "${scheduleName}"`}
      maxWidth="!max-w-lg"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4 w-full"
        >
          <div className="grid grid-cols-1 gap-4 bg-muted p-4 rounded-lg">
            <FormField
              control={form.control}
              name="overtime_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tasa / Multiplicador</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min={1}
                      max={5}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? undefined : Number(e.target.value),
                        )
                      }
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormDescription>
                    Valor entre 1 y 5. Ej: 1.5 = 50% adicional por hora extra.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-4 w-full justify-end">
            <Button type="button" variant="neutral" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSettingScheduleRate || !form.formState.isValid}
            >
              <Loader
                className={`mr-2 h-4 w-4 ${!isSettingScheduleRate ? "hidden" : ""}`}
              />
              {isSettingScheduleRate ? "Guardando" : "Guardar"}
            </Button>
          </div>
        </form>
      </Form>
    </GeneralModal>
  );
}
