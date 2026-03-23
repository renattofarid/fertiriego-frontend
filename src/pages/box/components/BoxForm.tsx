"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  boxSchemaCreate,
  boxSchemaUpdate,
  type BoxSchema,
} from "../lib/box.schema.ts";
import { Loader } from "lucide-react";
import { useAllBranches } from "@/pages/branch/lib/branch.hook";
import { BRANCH_SERIES } from "@/pages/branch/lib/branch.interface";
import { FormSelect } from "@/components/FormSelect";
import { FormInput } from "@/components/FormInput.tsx";

interface BoxFormProps {
  defaultValues: Partial<BoxSchema>;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "edit";
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
      mode === "create" ? boxSchemaCreate : boxSchemaUpdate,
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

  const handleBranchChange = (branchId: string) => {
    const id = Number(branchId) as keyof typeof BRANCH_SERIES;
    const serie = BRANCH_SERIES[id];
    if (serie) form.setValue("serie", serie, { shouldValidate: true });
  };

  // Serie → Branch: si hay una sola sucursal que corresponde a esa serie, la selecciona
  const SERIE_TO_BRANCH: Record<string, string> = Object.fromEntries(
    (Object.entries(BRANCH_SERIES) as [string, string][]).map(([branchId, serie]) => [serie, branchId])
  );

  const handleSerieChange = (serie: string) => {
    const branchId = SERIE_TO_BRANCH[serie];
    if (branchId) form.setValue("branch_id", branchId, { shouldValidate: true });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted p-4 rounded-lg">
          <FormInput
            control={form.control}
            name="name"
            label="Nombre"
            placeholder="Ej: Caja Central"
          />

          <FormSelect
            control={form.control}
            name="serie"
            label="Serie"
            placeholder="Seleccione una serie"
            options={[
              { value: "100", label: "100" },
              { value: "200", label: "200" },
            ]}
            onChange={handleSerieChange}
          />

          <div className="col-span-full">
            <FormSelect
              name="branch_id"
              label="Sucursal"
              placeholder="Seleccione una sucursal"
              options={branchOptions}
              control={form.control}
              disabled={loadingBranches}
              onChange={handleBranchChange}
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
