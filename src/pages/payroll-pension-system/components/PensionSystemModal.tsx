"use client";

import { useEffect } from "react";
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
import { FormSwitch } from "@/components/FormSwitch";
import { FormSelect } from "@/components/FormSelect";
import { errorToast, successToast } from "@/lib/core.function";
import {
  storePensionSystem,
  updatePensionSystem,
} from "../lib/pension-system.actions";
import {
  PENSION_SYSTEM_TYPE_OPTIONS,
  type PensionSystemResource,
  type PensionSystemType,
} from "../lib/pension-system.interface";

const rateSchema = (label: string) =>
  z.coerce
    .number()
    .min(0, `${label} debe ser mayor o igual a 0`)
    .max(100, `${label} no puede ser mayor a 100`);

const pensionSystemSchema = z.object({
  type: z.string().min(1, "Seleccione un tipo"),
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  rate: rateSchema("El aporte"),
  insurance_rate: rateSchema("La prima de seguro"),
  admin_fee_rate: rateSchema("La comisión"),
  is_active: z.boolean(),
});

type PensionSystemFormValues = z.infer<typeof pensionSystemSchema>;

const EMPTY_VALUES: PensionSystemFormValues = {
  type: "ONP",
  name: "",
  rate: 0,
  insurance_rate: 0,
  admin_fee_rate: 0,
  is_active: true,
};

interface PensionSystemModalProps {
  open: boolean;
  item: PensionSystemResource | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PensionSystemModal({
  open,
  item,
  onClose,
  onSuccess,
}: PensionSystemModalProps) {
  const isEdit = item !== null;
  const form = useForm<PensionSystemFormValues>({
    resolver: zodResolver(pensionSystemSchema) as any,
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      item
        ? {
            type: item.type,
            name: item.name,
            rate: Number(item.rate),
            insurance_rate: Number(item.insurance_rate),
            admin_fee_rate: Number(item.admin_fee_rate),
            is_active: item.is_active,
          }
        : EMPTY_VALUES,
    );
  }, [open, item, form]);

  const isSubmitting = form.formState.isSubmitting;

  const handleClose = () => {
    form.reset(EMPTY_VALUES);
    onClose();
  };

  const onSubmit = async (values: PensionSystemFormValues) => {
    const payload = { ...values, type: values.type as PensionSystemType };
    try {
      if (item) {
        await updatePensionSystem(item.id, payload);
        successToast("Sistema de pensión actualizado exitosamente");
      } else {
        await storePensionSystem(payload);
        successToast("Sistema de pensión registrado exitosamente");
      }
      form.reset(EMPTY_VALUES);
      onSuccess();
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ??
          error?.response?.data?.error ??
          "Error al guardar el sistema de pensión",
      );
    }
  };

  const rateField = (
    name: "rate" | "insurance_rate" | "admin_fee_rate",
    label: string,
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input type="number" step="0.01" min="0" max="100" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title={
        isEdit ? "Actualizar Sistema de Pensión" : "Registrar Sistema de Pensión"
      }
      subtitle="Complete los campos del sistema de pensión"
      icon="Landmark"
      size="lg"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 w-full"
        >
          <FormSelect
            control={form.control}
            name="type"
            label="Tipo"
            placeholder="Seleccione un tipo"
            options={PENSION_SYSTEM_TYPE_OPTIONS.map((o) => ({
              value: o.value,
              label: o.label,
            }))}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. AFP Integra" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rateField("rate", "Aporte (%)")}
            {rateField("insurance_rate", "Prima de seguro (%)")}
            {rateField("admin_fee_rate", "Comisión (%)")}
          </div>

          {isEdit && (
            <FormSwitch
              control={form.control}
              name="is_active"
              text="Activo"
              textDescription="Indique si el sistema de pensión está activo"
              autoHeight
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
