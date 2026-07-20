"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { FormSelect } from "@/components/FormSelect";
import { useWorkers } from "@/pages/worker/lib/worker.hook";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import { storeIncome } from "../lib/income.actions";
import { INCOME_TYPE_OPTIONS, type IncomeType } from "../lib/income.interface";
import { errorToast, successToast } from "@/lib/core.function";
import { requiredNumberId } from "@/lib/core.schema";

const incomeFormSchema = z.object({
  person_id: requiredNumberId("Seleccione un trabajador"),
  concept: z
    .string()
    .min(1, "El concepto es requerido")
    .max(200, "El concepto no puede exceder 200 caracteres"),
  type: z.string().min(1, "Seleccione un tipo"),
  amount: z.coerce.number().min(0, "El monto debe ser mayor o igual a 0"),
  is_taxable: z.boolean(),
  is_active: z.boolean(),
});

type IncomeFormValues = z.infer<typeof incomeFormSchema>;

function getPersonDisplayName(person: PersonResource) {
  return person.type_document === "RUC"
    ? person.business_name
    : `${person.names} ${person.father_surname} ${person.mother_surname}`.trim();
}

interface IncomeAddModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function IncomeAddModal({
  open,
  onClose,
  onSuccess,
}: IncomeAddModalProps) {
  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeFormSchema) as any,
    defaultValues: {
      person_id: undefined,
      concept: "",
      type: "FIJO",
      amount: 0,
      is_taxable: true,
      is_active: true,
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = async (values: IncomeFormValues) => {
    try {
      await storeIncome({
        person_id: Number(values.person_id),
        concept: values.concept,
        type: values.type as IncomeType,
        amount: values.amount,
        is_taxable: values.is_taxable,
        is_active: values.is_active,
      });
      successToast("Ingreso registrado exitosamente");
      form.reset();
      onSuccess();
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ??
          error?.response?.data?.error ??
          "Error al registrar el ingreso",
      );
    }
  };

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Registrar Ingreso"
      subtitle="Complete los campos para registrar un nuevo ingreso"
      icon="ArrowUpCircle"
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
            name="concept"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Concepto</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. GRATIFICACIÓN" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormSelect
            control={form.control}
            name="type"
            label="Tipo"
            placeholder="Seleccione un tipo"
            options={INCOME_TYPE_OPTIONS.map((o) => ({
              value: o.value,
              label: o.label,
            }))}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monto</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_taxable"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="!mb-0 font-normal">
                  Afecto a impuestos
                </FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="!mb-0 font-normal">Activo</FormLabel>
              </FormItem>
            )}
          />

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
