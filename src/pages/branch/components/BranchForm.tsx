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
import { Checkbox } from "@/components/ui/checkbox";
import {
  branchSchemaCreate,
  branchSchemaUpdate,
  type BranchSchema,
} from "../lib/branch.schema.ts";
import { Loader } from "lucide-react";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { useAllCompanies } from "@/pages/company/lib/company.hook";
import { FormSelect } from "@/components/FormSelect";
import { useEffect } from "react";

interface BranchFormProps {
  defaultValues: Partial<BranchSchema>;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const BranchForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: BranchFormProps) => {
  const { user } = useAuthStore();
  const { data: companies, isLoading: loadingCompanies } = useAllCompanies();

  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? branchSchemaCreate : branchSchemaUpdate
    ),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      email: "",
      is_invoice: false,
      responsible_id: 0,
      company_id: "",
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

  // Preparar opciones para el selector de empresas
  const companyOptions =
    companies?.map((company) => ({
      value: company.id.toString(),
      label: company.trade_name || company.social_reason,
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
                    placeholder="Ej: Sucursal Lima Centro"
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
                    variant="primary"
                    placeholder="Ej: Av. Abancay 1234"
                    {...field}
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
                    variant="primary"
                    placeholder="Ej: 987654321"
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
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    variant="primary"
                    type="email"
                    placeholder="Ej: sucursal.lima@empresa.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="col-span-full">
            <FormSelect
              name="company_id"
              label="Empresa"
              placeholder="Seleccione una empresa"
              options={companyOptions}
              control={form.control}
              disabled={loadingCompanies}
            />
          </div>

          <FormField
            control={form.control}
            name="is_invoice"
            render={({ field }) => (
              <FormItem className="col-span-2 flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>¿Emite factura?</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Marque si esta sucursal puede emitir facturas
                  </p>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
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
