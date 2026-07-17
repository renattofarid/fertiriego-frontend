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
  tagSchemaCreate,
  tagSchemaUpdate,
  type TagSchema,
} from "../lib/product-tag.schema";
import { Loader } from "lucide-react";
import { FormSwitch } from "@/components/FormSwitch";
import { FormTextArea } from "@/components/FormTextArea";
import { FormSelect } from "@/components/FormSelect";

const TYPE_OPTIONS = [
  { value: "rotation", label: "Rotación" },
  { value: "priority", label: "Prioridad" },
  { value: "supplier", label: "Proveedor" },
  { value: "custom", label: "Personalizado" },
];

interface TagFormProps {
  defaultValues: Partial<TagSchema>;
  onSubmit: (data: TagSchema) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "edit";
}

export const TagForm = ({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode = "create",
}: TagFormProps) => {
  const form = useForm<TagSchema>({
    resolver: zodResolver((mode === "create" ? tagSchemaCreate : tagSchemaUpdate) as any),
    defaultValues: {
      name: "",
      color: "#3b82f6",
      type: "custom",
      description: "",
      is_active: true,
      ...defaultValues,
    },
    mode: "onChange",
  });

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
                  <Input placeholder="Ej: Alta Rotación" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={field.value ?? "#3b82f6"}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="h-9 w-14 cursor-pointer rounded border border-input bg-background"
                    />
                    <span className="text-sm text-muted-foreground font-mono">
                      {field.value}
                    </span>
                  </div>
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
            options={TYPE_OPTIONS}
          />

          {mode === "edit" && (
            <FormSwitch
              control={form.control}
              name="is_active"
              label="Estado"
              text="Etiqueta activa"
            />
          )}

          <div className="md:col-span-2">
            <FormTextArea
              control={form.control}
              name="description"
              label="Descripción (Opcional)"
              placeholder="Descripción de la etiqueta..."
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-4 w-full justify-end">
          <Button type="button" variant="neutral" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || !form.formState.isValid}>
            <Loader className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`} />
            {isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
