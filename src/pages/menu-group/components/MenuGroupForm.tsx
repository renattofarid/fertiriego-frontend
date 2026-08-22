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
import { FormSelect } from "@/components/FormSelect";
import {
  menuGroupSchemaCreate,
  menuGroupSchemaUpdate,
  type MenuGroupSchema,
} from "../lib/menuGroup.schema";
import { Loader } from "lucide-react";
import * as LucideReact from "lucide-react";
import type { MenuGroupResource } from "../lib/menuGroup.interface";
import type { Option } from "@/lib/core.interface";

const STATUS_OPTIONS: Option[] = [
  { value: "Activo", label: "Activo" },
  { value: "Inactivo", label: "Inactivo" },
];

interface Props {
  defaultValues: Partial<MenuGroupSchema>;
  onSubmit: (data: MenuGroupSchema) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "edit";
  parentOptions: MenuGroupResource[];
}

export const MenuGroupForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  parentOptions,
}: Props) => {
  const form = useForm<MenuGroupSchema>({
    resolver: zodResolver(
      (mode === "create" ? menuGroupSchemaCreate : menuGroupSchemaUpdate) as any
    ),
    defaultValues: {
      name: "",
      icon: "",
      group_menu_id: "",
      status: "Activo",
      ...defaultValues,
    },
    mode: "onChange",
  });

  const iconValue = form.watch("icon");
  const IconPreview = iconValue
    ? (LucideReact[iconValue as keyof typeof LucideReact] as
        | React.ComponentType<any>
        | undefined)
    : undefined;

  const parentSelectOptions: Option[] = [
    { value: "", label: "Sin grupo padre" },
    ...parentOptions.map((group) => ({
      value: String(group.id),
      label: group.name,
    })),
  ];

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 w-full"
      >
        <div className="grid grid-cols-1 gap-4 bg-muted p-4 rounded-lg">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Configuración" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ícono (nombre de lucide-react)</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    {IconPreview && (
                      <div className="bg-primary text-primary-foreground rounded-md p-2">
                        <IconPreview className="size-4" />
                      </div>
                    )}
                    <Input placeholder="Ej: Settings" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormSelect
            control={form.control}
            name="group_menu_id"
            label="Grupo padre (opcional)"
            placeholder="Seleccione un grupo padre"
            options={parentSelectOptions}
          />

          {mode === "edit" && (
            <FormSelect
              control={form.control}
              name="status"
              label="Estado"
              placeholder="Seleccione un estado"
              options={STATUS_OPTIONS}
            />
          )}
        </div>

        <div className="flex gap-4 w-full justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
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
