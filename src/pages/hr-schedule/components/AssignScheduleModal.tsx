"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GeneralModal } from "@/components/GeneralModal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import {
  assignScheduleSchema,
  type AssignScheduleSchema,
} from "../lib/schedule.schema";
import { useScheduleStore } from "../lib/schedule.store";
import { useSchedules } from "../lib/schedule.hook";
import type { ScheduleResource } from "../lib/schedule.interface";
import { useWorkers } from "@/pages/worker/lib/worker.hook";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import {
  errorToast,
  successToast,
} from "@/lib/core.function";
import { format } from "date-fns";

interface AssignScheduleModalProps {
  open: boolean;
  onClose: () => void;
  presetScheduleId?: number;
  presetScheduleName?: string;
  presetPersonId?: number;
  presetPersonName?: string;
}

function getPersonDisplayName(person: PersonResource) {
  return person.type_document === "RUC"
    ? person.business_name
    : `${person.names} ${person.father_surname} ${person.mother_surname}`.trim();
}

export default function AssignScheduleModal({
  open,
  onClose,
  presetScheduleId,
  presetScheduleName,
  presetPersonId,
  presetPersonName,
}: AssignScheduleModalProps) {
  const { isAssigning, assignSchedule } = useScheduleStore();

  const form = useForm<AssignScheduleSchema>({
    resolver: zodResolver(assignScheduleSchema),
    defaultValues: {
      person_id: presetPersonId ? presetPersonId.toString() : "",
      work_schedule_id: presetScheduleId ? presetScheduleId.toString() : "",
      valid_from: format(new Date(), "yyyy-MM-dd"),
      no_end_date: true,
      valid_until: "",
    },
    mode: "onChange",
  });

  const noEndDate = form.watch("no_end_date");

  const handleSubmit = async (data: AssignScheduleSchema) => {
    await assignSchedule({
      person_id: Number(data.person_id),
      work_schedule_id: Number(data.work_schedule_id),
      valid_from: data.valid_from,
      valid_until: data.no_end_date ? null : data.valid_until || null,
    })
      .then(() => {
        onClose();
        successToast("Horario asignado correctamente.");
        form.reset();
      })
      .catch((error: any) => {
        errorToast(
          error?.response?.data?.message ??
            error?.response?.data?.error ??
            "Error al asignar el horario.",
        );
      });
  };

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title="Asignar Horario"
      subtitle="Asigne un horario de trabajo a un trabajador"
      maxWidth="!max-w-xl"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4 w-full"
        >
          <div className="grid grid-cols-1 gap-4 bg-muted p-4 rounded-lg">
            {presetScheduleId ? (
              <div className="text-sm">
                <span className="text-muted-foreground">Horario: </span>
                <span className="font-semibold">{presetScheduleName}</span>
              </div>
            ) : (
              <FormSelectAsync
                control={form.control}
                name="work_schedule_id"
                label="Horario"
                placeholder="Seleccione un horario"
                required
                useQueryHook={useSchedules}
                mapOptionFn={(schedule: ScheduleResource) => ({
                  value: schedule.id.toString(),
                  label: schedule.name,
                  description: `${schedule.check_in_time?.slice(0, 5)} - ${schedule.check_out_time?.slice(0, 5)}`,
                })}
              />
            )}

            {presetPersonId ? (
              <div className="text-sm">
                <span className="text-muted-foreground">Trabajador: </span>
                <span className="font-semibold">{presetPersonName}</span>
              </div>
            ) : (
              <FormSelectAsync
                control={form.control}
                name="person_id"
                label="Trabajador"
                placeholder="Seleccione un trabajador"
                required
                useQueryHook={useWorkers}
                mapOptionFn={(person: PersonResource) => ({
                  value: person.id.toString(),
                  label: getPersonDisplayName(person),
                  description: person.number_document,
                })}
              />
            )}

            <DatePickerFormField
              control={form.control}
              name="valid_from"
              label="Vigente desde"
            />

            <FormField
              control={form.control}
              name="no_end_date"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="!mb-0 font-normal">
                    Sin fecha de fin
                  </FormLabel>
                </FormItem>
              )}
            />

            {!noEndDate && (
              <DatePickerFormField
                control={form.control}
                name="valid_until"
                label="Vigente hasta"
              />
            )}
          </div>

          <div className="flex gap-4 w-full justify-end">
            <Button type="button" variant="neutral" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isAssigning || !form.formState.isValid}
            >
              <Loader
                className={`mr-2 h-4 w-4 ${!isAssigning ? "hidden" : ""}`}
              />
              {isAssigning ? "Guardando" : "Guardar"}
            </Button>
          </div>
          <FormMessage />
        </form>
      </Form>
    </GeneralModal>
  );
}
