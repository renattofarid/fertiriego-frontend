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
  workerOvertimeRateSchema,
  type WorkerOvertimeRateSchema,
} from "../lib/overtime.schema";
import { useOvertimeStore } from "../lib/overtime.store";
import { WORKER } from "@/pages/worker/lib/worker.interface";
import { errorToast, successToast } from "@/lib/core.function";

interface Props {
  personId: number;
  personName: string;
  currentRate?: number | null;
  open: boolean;
  onClose: () => void;
}

export default function WorkerOvertimeRateModal({
  personId,
  personName,
  currentRate,
  open,
  onClose,
}: Props) {
  const queryClient = useQueryClient();
  const { isSettingWorkerRate, setWorkerOvertimeRate } = useOvertimeStore();

  const form = useForm<WorkerOvertimeRateSchema>({
    resolver: zodResolver(workerOvertimeRateSchema),
    defaultValues: { overtime_rate_override: currentRate ?? undefined },
    mode: "onChange",
  });

  const handleSubmit = async (data: WorkerOvertimeRateSchema) => {
    await setWorkerOvertimeRate({
      person_id: personId,
      overtime_rate_override: data.overtime_rate_override ?? null,
    })
      .then(async () => {
        onClose();
        successToast(
          "Tasa de horas extras del trabajador actualizada correctamente.",
        );
        await queryClient.invalidateQueries({ queryKey: [WORKER.QUERY_KEY] });
      })
      .catch((error: any) => {
        errorToast(
          error?.response?.data?.message ??
            error?.response?.data?.error ??
            "Error al actualizar la tasa de horas extras del trabajador.",
        );
      });
  };

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title="Tasa de Horas Extras del Trabajador"
      subtitle={`Configure una tasa/multiplicador propia para "${personName}", distinta a la de su horario`}
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
              name="overtime_rate_override"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tasa / Multiplicador (Opcional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      min={1}
                      max={5}
                      placeholder="Dejar vacío para usar la tasa del horario"
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
                    Valor entre 1 y 5. Si se deja vacío, se usará la tasa configurada
                    en el horario del trabajador.
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
              disabled={isSettingWorkerRate || !form.formState.isValid}
            >
              <Loader
                className={`mr-2 h-4 w-4 ${!isSettingWorkerRate ? "hidden" : ""}`}
              />
              {isSettingWorkerRate ? "Guardando" : "Guardar"}
            </Button>
          </div>
        </form>
      </Form>
    </GeneralModal>
  );
}
