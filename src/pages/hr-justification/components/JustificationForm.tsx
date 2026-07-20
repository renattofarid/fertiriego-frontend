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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { FormSelect } from "@/components/FormSelect";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import {
  justificationSchemaCreate,
  type JustificationSchema,
} from "../lib/justification.schema";
import { useWorkers } from "@/pages/worker/lib/worker.hook";
import type { PersonResource } from "@/pages/person/lib/person.interface";

const TYPE_OPTIONS = [
  { value: "PERMISO", label: "Permiso" },
  { value: "VACACIONES", label: "Vacaciones" },
  { value: "ENFERMEDAD", label: "Enfermedad" },
  { value: "FALTA_JUSTIFICADA", label: "Falta Justificada" },
  { value: "OTRO", label: "Otro" },
];

function getPersonDisplayName(person: PersonResource) {
  return person.type_document === "RUC"
    ? person.business_name
    : `${person.names} ${person.father_surname} ${person.mother_surname}`.trim();
}

interface JustificationFormProps {
  defaultValues: JustificationSchema;
  onSubmit: (data: JustificationSchema) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export const JustificationForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: JustificationFormProps) => {
  const form = useForm<JustificationSchema>({
    resolver: zodResolver(justificationSchemaCreate),
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted p-4 rounded-lg">
          <div className="md:col-span-2">
            <FormSelectAsync
              control={form.control}
              name="person_id"
              label="Trabajador"
              placeholder="Seleccione un trabajador"
              required
              useQueryHook={useWorkers}
              mapOptionFn={(person: PersonResource) => ({
                value: person.id.toString(),
                label: getPersonDisplayName(person),
                description: person.number_document,
              })}
            />
          </div>

          <DatePickerFormField
            control={form.control}
            name="date_from"
            label="Fecha de Inicio"
          />

          <DatePickerFormField
            control={form.control}
            name="date_until"
            label="Fecha de Fin"
          />

          <div className="md:col-span-2">
            <FormSelect
              control={form.control}
              name="type"
              label="Tipo"
              placeholder="Seleccione un tipo"
              options={TYPE_OPTIONS}
            />
          </div>

          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describa el motivo de la justificación"
                      maxLength={1000}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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
