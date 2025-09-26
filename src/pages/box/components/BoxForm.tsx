"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  boxSchemaCreate,
  boxSchemaUpdate,
  type BoxSchema,
} from "../lib/box.schema.ts";
import { Loader } from "lucide-react";
import { useAllBranches } from "@/pages/branch/lib/branch.hook";
import { FormSelect } from "@/components/FormSelect";

interface BoxFormProps {
  defaultValues: Partial<BoxSchema>;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const BoxForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: BoxFormProps) => {
  const { data: branches, isLoading: loadingBranches } = useAllBranches();

  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? boxSchemaCreate : boxSchemaUpdate
    ),
    defaultValues: {
      name: "",
      serie: "",
      branch_id: "",
      ...defaultValues,
    },
    mode: "onChange",
  });

  // Preparar opciones para el selector de sucursales
  const branchOptions =
    branches?.map((branch) => ({
      value: branch.id.toString(),
      label: branch.name,
    })) || [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-sidebar p-4 rounded-lg">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input
                    variant="primary"
                    placeholder="Ej: Caja Central"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="serie"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Serie</FormLabel>
                <FormControl>
                  <Input
                    variant="primary"
                    placeholder="Ej: 001"
                    className="font-mono"
                    maxLength={10}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="col-span-full">
            <FormSelect
              name="branch_id"
              label="Sucursal"
              placeholder="Seleccione una sucursal"
              options={branchOptions}
              control={form.control}
              disabled={loadingBranches}
            />
          </div>
        </div>

        <div className="flex gap-4 w-full justify-end">
          <Button type="button" variant="neutral" onClick={onCancel}>
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Guardando" : "Guardar"}
          </Button>
        </div>
      </form>
    </Form>
  );
};