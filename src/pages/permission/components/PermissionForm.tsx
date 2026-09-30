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
import { FormSelectAsync } from "@/components/FormSelectAsync";
import {
  useMenuGroupQueryById,
  useMenuGroupsQuery,
} from "@/pages/menu-group/lib/menuGroup.hook";
import {
  permissionSchemaCreate,
  permissionSchemaUpdate,
  type PermissionSchema,
} from "../lib/permission.schema";
import { Loader } from "lucide-react";
import type { MenuGroupResource } from "@/pages/menu-group/lib/menuGroup.interface";
import type { Option } from "@/lib/core.interface";

const STATUS_OPTIONS: Option[] = [
  { value: "Activo", label: "Activo" },
  { value: "Inactivo", label: "Inactivo" },
];

const ACTION_OPTIONS: Option[] = [
  { value: "list", label: "Listar" },
  { value: "create", label: "Crear" },
  { value: "edit", label: "Editar" },
  { value: "delete", label: "Eliminar" },
  { value: "export", label: "Exportar" },
];

const TYPE_OPTIONS: Option[] = [
  { value: "modulo", label: "Módulo" },
  { value: "accion", label: "Acción" },
];

interface Props {
  defaultValues: Partial<PermissionSchema>;
  onSubmit: (data: PermissionSchema) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "edit";
}

const mapMenuGroupOption = (group: MenuGroupResource): Option => ({
  value: String(group.id),
  label: group.name,
});

export const PermissionForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: Props) => {
  const form = useForm<PermissionSchema>({
    resolver: zodResolver(
      (mode === "create" ? permissionSchemaCreate : permissionSchemaUpdate) as any
    ),
    defaultValues: {
      name: "",
      route: "",
      group_menu_id: "",
      action: "list",
      type: "modulo",
      status: "Activo",
      ...defaultValues,
    },
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 w-full"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted p-4 rounded-lg">
          <div className="md:col-span-2">
            <FormSelectAsync
              control={form.control}
              name="group_menu_id"
              label="Grupo de menú"
              placeholder="Seleccione un grupo de menú"
              useQueryHook={useMenuGroupsQuery}
              useQueryByIdHook={useMenuGroupQueryById}
              preloadItemId={defaultValues.group_menu_id || undefined}
              mapOptionFn={mapMenuGroupOption}
              withValue={false}
            />
          </div>

          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Agregar Cliente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="route"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ruta</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: cliente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormSelect
            control={form.control}
            name="action"
            label="Acción"
            placeholder="Seleccione una acción"
            options={ACTION_OPTIONS}
          />

          <FormSelect
            control={form.control}
            name="type"
            label="Tipo"
            placeholder="Seleccione un tipo"
            options={TYPE_OPTIONS}
          />

          {mode === "edit" && (
            <div className="md:col-span-2">
              <FormSelect
                control={form.control}
                name="status"
                label="Estado"
                placeholder="Seleccione un estado"
                options={STATUS_OPTIONS}
              />
            </div>
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
