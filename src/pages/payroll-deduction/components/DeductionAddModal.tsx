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
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { FormSelect } from "@/components/FormSelect";
import { useWorkers } from "@/pages/worker/lib/worker.hook";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import { storeDeduction } from "../lib/deduction.actions";
import {
  DEDUCTION_TYPE_OPTIONS,
  type DeductionType,
} from "../lib/deduction.interface";
import { errorToast, successToast } from "@/lib/core.function";
import { requiredNumberId } from "@/lib/core.schema";

const deductionFormSchema = z.object({
  person_id: requiredNumberId("Seleccione un trabajador"),
  concept: z
    .string()
    .min(1, "El concepto es requerido")
    .max(200, "El concepto no puede exceder 200 caracteres"),
  type: z.string().min(1, "Seleccione un tipo"),
  amount: z.coerce.number().min(0, "El monto debe ser mayor o igual a 0"),
});

type DeductionFormValues = z.infer<typeof deductionFormSchema>;

function getPersonDisplayName(person: PersonResource) {
  return person.type_document === "RUC"
    ? person.business_name
    : `${person.names} ${person.father_surname} ${person.mother_surname}`.trim();
}

interface DeductionAddModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeductionAddModal({
  open,
  onClose,
  onSuccess,
}: DeductionAddModalProps) {
  const form = useForm<DeductionFormValues>({
    resolver: zodResolver(deductionFormSchema) as any,
    defaultValues: {
      person_id: undefined,
      concept: "",
      type: "PRESTAMO",
      amount: 0,
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = async (values: DeductionFormValues) => {
    try {
      await storeDeduction({
        person_id: Number(values.person_id),
        concept: values.concept,
        type: values.type as DeductionType,
        amount: values.amount,
        is_active: true,
      });
      successToast("Descuento registrado exitosamente");
      form.reset();
      onSuccess();
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ??
          error?.response?.data?.error ??
          "Error al registrar el descuento",
      );
    }
  };

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Registrar Descuento"
      subtitle="Complete los campos para registrar un nuevo descuento"
      icon="ArrowDownCircle"
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
                  <Input placeholder="Ej. PRESTAMO 500" {...field} />
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
            options={DEDUCTION_TYPE_OPTIONS.map((o) => ({
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
