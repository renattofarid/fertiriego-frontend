"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { GeneralModal } from "@/components/GeneralModal";
import { Form, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import {
  detectOvertimeSchema,
  type DetectOvertimeSchema,
} from "../lib/overtime.schema";
import { useOvertimeStore } from "../lib/overtime.store";
import { OVERTIME_QUERY_KEY } from "../lib/overtime.interface";
import { useWorkers } from "@/pages/worker/lib/worker.hook";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import { errorToast, successToast } from "@/lib/core.function";

function getPersonDisplayName(person: PersonResource) {
  return person.type_document === "RUC"
    ? person.business_name
    : `${person.names} ${person.father_surname} ${person.mother_surname}`.trim();
}

interface Props {
  open: boolean;
  onClose: () => void;
  presetPersonId?: number;
  presetPersonName?: string;
}

export default function OvertimeDetectModal({
  open,
  onClose,
  presetPersonId,
  presetPersonName,
}: Props) {
  const queryClient = useQueryClient();
  const { isDetecting, detectOvertime } = useOvertimeStore();

  const lastMonth = subMonths(new Date(), 1);

  const form = useForm<DetectOvertimeSchema>({
    resolver: zodResolver(detectOvertimeSchema),
    defaultValues: {
      date_from: format(startOfMonth(lastMonth), "yyyy-MM-dd"),
      date_until: format(endOfMonth(lastMonth), "yyyy-MM-dd"),
      person_id: presetPersonId ? presetPersonId.toString() : "",
    },
    mode: "onChange",
  });

  const handleSubmit = async (data: DetectOvertimeSchema) => {
    await detectOvertime({
      date_from: data.date_from,
      date_until: data.date_until,
      person_id: data.person_id ? Number(data.person_id) : null,
    })
      .then(async (response) => {
        onClose();
        successToast(
          response.message ?? "Horas extras calculadas correctamente.",
        );
        await queryClient.invalidateQueries({
          queryKey: [OVERTIME_QUERY_KEY],
        });
      })
      .catch((error: any) => {
        errorToast(
          error?.response?.data?.message ??
            error?.response?.data?.error ??
            "Error al calcular las horas extras.",
        );
      });
  };

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title="Calcular Horas Extras"
      subtitle="Detecte las horas extras trabajadas dentro de un periodo. Por defecto se calcula el mes anterior."
      maxWidth="!max-w-lg"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4 w-full"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted p-4 rounded-lg">
            <DatePickerFormField
              control={form.control}
              name="date_from"
              label="Desde"
            />
            <DatePickerFormField
              control={form.control}
              name="date_until"
              label="Hasta"
            />

            <div className="sm:col-span-2">
              {presetPersonId ? (
                <div className="text-sm">
                  <span className="text-muted-foreground">Trabajador: </span>
                  <span className="font-semibold">{presetPersonName}</span>
                </div>
              ) : (
                <FormSelectAsync
                  control={form.control}
                  name="person_id"
                  label="Trabajador (Opcional)"
                  placeholder="Todos los trabajadores"
                  useQueryHook={useWorkers}
                  mapOptionFn={(person: PersonResource) => ({
                    value: person.id.toString(),
                    label: getPersonDisplayName(person),
                    description: person.number_document,
                  })}
                />
              )}
            </div>
          </div>

          <div className="flex gap-4 w-full justify-end">
            <Button type="button" variant="neutral" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isDetecting || !form.formState.isValid}
            >
              <Loader
                className={`mr-2 h-4 w-4 ${!isDetecting ? "hidden" : ""}`}
              />
              {isDetecting ? "Calculando" : "Calcular"}
            </Button>
          </div>
          <FormMessage />
        </form>
      </Form>
    </GeneralModal>
  );
}
