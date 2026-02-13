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
  categorySchemaCreate,
  categorySchemaUpdate,
  type CategorySchema,
} from "../lib/category.schema";
import { Loader } from "lucide-react";
import type { CategoryResource } from "../lib/category.interface";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { useCategory } from "../lib/category.hook";

interface CategoryFormProps {
  defaultValues: Partial<CategorySchema>;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "edit";
}

export const CategoryForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: CategoryFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? categorySchemaCreate : categorySchemaUpdate,
    ),
    defaultValues: {
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
                  <Input placeholder="Ej: SmartPhones" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: SMP"
                    maxLength={10}
                    onChange={(e) => {
                      field.onChange(e.target.value.toUpperCase());
                    }}
                    value={field.value}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="md:col-span-2">
            <FormSelectAsync
              control={form.control}
              name="parent_id"
              label="Categoría Padre (Opcional)"
              placeholder="Seleccione una categoría padre"
              useQueryHook={useCategory}
              mapOptionFn={(category: CategoryResource) => ({
                value: category.id.toString(),
                label: `${"  ".repeat(category.level - 1)}${category.name}`,
              })}
            />
          </div>
        </div>

        {/* 
        <pre>
          <code>{JSON.stringify(form.getValues(), null, 2)}</code>
        </pre> */}

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
