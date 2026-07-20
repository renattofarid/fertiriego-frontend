"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { GeneralModal } from "@/components/GeneralModal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { useWorkers } from "@/pages/worker/lib/worker.hook";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import { storeSalary } from "../lib/salary.actions";
import { errorToast, successToast } from "@/lib/core.function";
import { requiredNumberId, dateStringSchemaRequired } from "@/lib/core.schema";

const salaryFormSchema = z.object({
  person_id: requiredNumberId("Seleccione un trabajador"),
  base_salary: z.coerce.number().min(0, "El salario debe ser mayor o igual a 0"),
  valid_from: dateStringSchemaRequired("Vigente desde"),
  no_end_date: z.boolean(),
  valid_until: z.string().optional(),
});

type SalaryFormValues = z.infer<typeof salaryFormSchema>;

function getPersonDisplayName(person: PersonResource) {
  return person.type_document === "RUC"
    ? person.business_name
    : `${person.names} ${person.father_surname} ${person.mother_surname}`.trim();
}

interface SalaryAddModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SalaryAddModal({
  open,
  onClose,
  onSuccess,
}: SalaryAddModalProps) {
  const form = useForm<SalaryFormValues>({
    resolver: zodResolver(salaryFormSchema) as any,
    defaultValues: {
      person_id: undefined,
      base_salary: 0,
      valid_from: format(new Date(), "yyyy-MM-dd"),
      no_end_date: true,
      valid_until: "",
    },
  });

  const noEndDate = form.watch("no_end_date");
  const isSubmitting = form.formState.isSubmitting;

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = async (values: SalaryFormValues) => {
    try {
      await storeSalary({
        person_id: Number(values.person_id),
        base_salary: values.base_salary,
        valid_from: values.valid_from,
        valid_until: values.no_end_date ? null : values.valid_until || null,
      });
      successToast("Salario base registrado exitosamente");
      form.reset();
      onSuccess();
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ??
          error?.response?.data?.error ??
          "Error al registrar el salario base",
      );
    }
  };

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Registrar Salario Base"
      subtitle="Complete los campos para registrar un nuevo salario base"
      icon="Wallet"
      size="lg"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 w-full"
        >
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

          <FormField
            control={form.control}
            name="base_salary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salario Base</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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

          <div className="flex gap-4 w-full justify-end">
            <Button type="button" variant="neutral" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </Form>
    </GeneralModal>
  );
}
