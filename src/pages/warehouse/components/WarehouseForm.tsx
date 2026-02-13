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
  warehouseSchemaCreate,
  warehouseSchemaUpdate,
  type WarehouseSchema,
} from "../lib/warehouse.schema.ts";
import { Loader } from "lucide-react";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { useAllBranches } from "@/pages/branch/lib/branch.hook";
import { FormSelect } from "@/components/FormSelect";
import { useEffect } from "react";

interface WarehouseFormProps {
  defaultValues: Partial<WarehouseSchema>;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "edit";
}

export const WarehouseForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: WarehouseFormProps) => {
  const { user } = useAuthStore();
  const { data: branches, isLoading: loadingBranches } = useAllBranches();

  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? warehouseSchemaCreate : warehouseSchemaUpdate
    ),
    defaultValues: {
      name: "",
      address: "",
      capacity: 0,
      phone: "",
      email: "",
      responsible_id: 0,
      branch_id: "",
      ...defaultValues,
    },
    mode: "onChange",
  });

  // Auto-llenar responsible_id con el ID del usuario logueado
  useEffect(() => {
    if (user?.id && mode === "create") {
      form.setValue("responsible_id", user.id);
    }
  }, [user?.id, mode, form]);

  // Preparar opciones para el selector de sucursales
  const branchOptions =
    branches?.map((branch) => ({
      value: branch.id.toString(),
      label: branch.name,
    })) || [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted p-4 rounded-lg">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input
                    
                    placeholder="Ej: Almacén Principal"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección</FormLabel>
                <FormControl>
                  <Input
                    
                    placeholder="Ej: Carretera Central km 12"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacidad</FormLabel>
                <FormControl>
                  <Input
                    
                    type="number"
                    placeholder="Ej: 5000"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input
                    
                    placeholder="Ej: 987654322"
                    maxLength={9}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    
                    type="email"  
                    placeholder="Ej: almacen.principal@empresa.com"
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
