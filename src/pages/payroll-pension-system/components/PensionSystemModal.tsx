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
import { errorToast, successToast } from "@/lib/core.function";
import {
  storePensionSystem,
  updatePensionSystem,
} from "../lib/pension-system.actions";
import type { PensionSystemResource } from "../lib/pension-system.interface";

const pensionSystemSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  type: z
    .string()
    .min(1, "El tipo es requerido")
    .max(50, "El tipo no puede exceder 50 caracteres"),
});

type PensionSystemFormValues = z.infer<typeof pensionSystemSchema>;

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
    resolver: zodResolver(pensionSystemSchema),
    defaultValues: { name: "", type: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({ name: item?.name ?? "", type: item?.type ?? "" });
    }
  }, [open, item, form]);

  const isSubmitting = form.formState.isSubmitting;

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = async (values: PensionSystemFormValues) => {
    try {
      if (item) {
        await updatePensionSystem(item.id, values);
        successToast("Sistema de pensión actualizado exitosamente");
      } else {
        await storePensionSystem(values);
        successToast("Sistema de pensión registrado exitosamente");
      }
      form.reset();
      onSuccess();
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ??
          error?.response?.data?.error ??
          "Error al guardar el sistema de pensión",
      );
    }
  };

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

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. AFP" {...field} />
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
