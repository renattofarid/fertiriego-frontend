"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { useWorkers } from "@/pages/worker/lib/worker.hook";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import { requiredNumberId } from "@/lib/core.schema";
import { calculatePayslip } from "../lib/payroll.actions";
import type { PayslipResource } from "../lib/payroll.interface";
import { errorToast, successToast } from "@/lib/core.function";

const payslipFormSchema = z.object({
  person_id: requiredNumberId("Seleccione un trabajador"),
  extra_incomes: z.array(
    z.object({
      concept: z.string().min(1, "Requerido"),
      amount: z.coerce.number().min(0, "Debe ser mayor o igual a 0"),
      is_taxable: z.boolean(),
    }),
  ),
  extra_deductions: z.array(
    z.object({
      concept: z.string().min(1, "Requerido"),
      amount: z.coerce.number().min(0, "Debe ser mayor o igual a 0"),
    }),
  ),
});

type PayslipFormValues = z.infer<typeof payslipFormSchema>;

function getPersonDisplayName(person: PersonResource) {
  return person.type_document === "RUC"
    ? person.business_name
    : `${person.names} ${person.father_surname} ${person.mother_surname}`.trim();
}

interface PayslipCalculateModalProps {
  open: boolean;
  payrollId: number;
  presetPerson?: { id: number; label: string } | null;
  onClose: () => void;
  onCalculated: (payslip: PayslipResource) => void;
}

export default function PayslipCalculateModal({
  open,
  payrollId,
  presetPerson,
  onClose,
  onCalculated,
}: PayslipCalculateModalProps) {
  const form = useForm<PayslipFormValues>({
    resolver: zodResolver(payslipFormSchema) as any,
    defaultValues: {
      person_id: presetPerson?.id,
      extra_incomes: [],
      extra_deductions: [],
    },
  });

  const incomesArray = useFieldArray({
    control: form.control,
    name: "extra_incomes",
  });

  const deductionsArray = useFieldArray({
    control: form.control,
    name: "extra_deductions",
  });

  useEffect(() => {
    if (open) {
      form.reset({
        person_id: presetPerson?.id,
        extra_incomes: [],
        extra_deductions: [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, presetPerson?.id]);

  const isSubmitting = form.formState.isSubmitting;

  const handleClose = () => {
    form.reset({ person_id: undefined, extra_incomes: [], extra_deductions: [] });
    onClose();
  };

  const onSubmit = async (values: PayslipFormValues) => {
    try {
      const response = await calculatePayslip(payrollId, {
        person_id: Number(values.person_id),
        extra_incomes: values.extra_incomes.length
          ? values.extra_incomes
          : null,
        extra_deductions: values.extra_deductions.length
          ? values.extra_deductions
          : null,
      });
      successToast(response.message);
      onCalculated(response.data);
      form.reset({ person_id: undefined, extra_incomes: [], extra_deductions: [] });
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ??
          error?.response?.data?.error ??
          "Error al calcular la boleta",
      );
    }
  };

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Calcular Boleta"
      subtitle="Calcule o recalcule la boleta de un trabajador para este periodo"
      icon="Receipt"
      size="2xl"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
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
            defaultOption={
              presetPerson
                ? {
                    value: presetPerson.id.toString(),
                    label: presetPerson.label,
                  }
                : undefined
            }
          />

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Ingresos Adicionales</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  incomesArray.append({
                    concept: "",
                    amount: 0,
                    is_taxable: true,
                  })
                }
              >
                <Plus className="size-4 mr-1" /> Agregar
              </Button>
            </div>
            {incomesArray.fields.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Sin ingresos adicionales.
              </p>
            )}
            {incomesArray.fields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-end gap-2 p-2 border rounded-lg bg-muted/30"
              >
                <FormField
                  control={form.control}
                  name={`extra_incomes.${index}.concept`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-xs">Concepto</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. CTS" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`extra_incomes.${index}.amount`}
                  render={({ field }) => (
                    <FormItem className="w-32">
                      <FormLabel className="text-xs">Monto</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`extra_incomes.${index}.is_taxable`}
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-center gap-1 space-y-0">
                      <FormLabel className="text-xs">Afecto</FormLabel>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  color="red"
                  onClick={() => incomesArray.remove(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Descuentos Adicionales</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  deductionsArray.append({ concept: "", amount: 0 })
                }
              >
                <Plus className="size-4 mr-1" /> Agregar
              </Button>
            </div>
            {deductionsArray.fields.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Sin descuentos adicionales.
              </p>
            )}
            {deductionsArray.fields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-end gap-2 p-2 border rounded-lg bg-muted/30"
              >
                <FormField
                  control={form.control}
                  name={`extra_deductions.${index}.concept`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-xs">Concepto</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. PRESTAMO" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`extra_deductions.${index}.amount`}
                  render={({ field }) => (
                    <FormItem className="w-32">
                      <FormLabel className="text-xs">Monto</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  color="red"
                  onClick={() => deductionsArray.remove(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex gap-4 w-full justify-end">
            <Button type="button" variant="neutral" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Calculando..." : "Calcular Boleta"}
            </Button>
          </div>
        </form>
      </Form>
    </GeneralModal>
  );
}
