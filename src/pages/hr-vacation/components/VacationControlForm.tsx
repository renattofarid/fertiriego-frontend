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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import {
  vacationControlSchema,
  type VacationControlSchema,
} from "../lib/vacation.schema";

interface VacationControlFormProps {
  defaultValues: VacationControlSchema;
  onSubmit: (data: VacationControlSchema) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export const VacationControlForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: VacationControlFormProps) => {
  const form = useForm<VacationControlSchema>({
    resolver: zodResolver(vacationControlSchema),
    defaultValues: {
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
        <div className="grid grid-cols-1 gap-4 bg-muted p-4 rounded-lg">
          <DatePickerFormField
            control={form.control}
            name="hire_date"
            label="Fecha de Ingreso"
          />

          <FormField
            control={form.control}
            name="vacation_days_per_year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Días de Vacaciones por Año</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? undefined : Number(e.target.value),
                      )
                    }
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormDescription>
                  Permite regenerar los periodos vacacionales del trabajador.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4 w-full justify-end">
          <Button type="button" variant="neutral" onClick={onCancel}>
            Cancelar
          </Button>

          <Button type="submit" disabled={isSubmitting}>
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
