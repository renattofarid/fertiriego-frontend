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
import { vehicleSchema, type VehicleSchema } from "../lib/vehicle.schema";
import { Loader } from "lucide-react";
import { FormSelect } from "@/components/FormSelect";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { useWorkers } from "@/pages/worker/lib/worker.hook";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import { FormInput } from "@/components/FormInput";

interface VehicleFormProps {
  defaultValues: Partial<VehicleSchema>;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "edit";
}

export const VehicleForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: VehicleFormProps) => {
  const form = useForm({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      plate: "",
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      color: "",
      vehicle_type: "",
      max_weight: 0,
      mtc: "",
      owner_id: "",
      observations: "",
      ...defaultValues,
    },
    mode: "onChange",
  });

  const vehicleTypeOptions = [
    { value: "carga", label: "Carga" },
    { value: "pasajeros", label: "Pasajeros" },
    { value: "mixto", label: "Mixto" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg">
          <FormInput
            control={form.control}
            name="plate"
            placeholder="Ingrese la placa"
            label="Placa"
            uppercase
          />

          <FormInput
            control={form.control}
            name="brand"
            placeholder="Ingrese la marca"
            label="Marca"
            uppercase
          />

          <FormInput
            control={form.control}
            name="model"
            placeholder="Ingrese el modelo"
            label="Modelo"
            uppercase
          />

          <FormInput
            control={form.control}
            name="year"
            placeholder="Ingrese el año"
            label="Año"
            type="number"
            inputMode="numeric"
          />

          <FormInput
            control={form.control}
            name="color"
            placeholder="Ingrese el color"
            label="Color"
            uppercase
          />

          <FormSelect
            name="vehicle_type"
            label="Tipo de Vehículo"
            placeholder="Seleccione el tipo"
            options={vehicleTypeOptions}
            control={form.control}
          />

          <FormInput
            control={form.control}
            name="max_weight"
            placeholder="Ingrese el peso máximo"
            label="Peso Máximo (kg)"
            type="number"
            step="0.001"
          />

          <FormInput
            control={form.control}
            name="mtc"
            placeholder="Ingrese el MTC"
            label="MTC"
            uppercase
          />

          <div className="col-span-full">
            <FormSelectAsync
              name="owner_id"
              label="Propietario"
              placeholder="Seleccione el propietario"
              useQueryHook={useWorkers}
              mapOptionFn={(worker: PersonResource) => ({
                value: worker.id.toString(),
                label:
                  worker.business_name ??
                  `${worker.names} ${worker.father_surname} ${worker.mother_surname}`,
                description: worker.number_document,
              })}
              control={form.control}
            />
          </div>

          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ingrese observaciones (opcional)"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 px-4 pb-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting
              ? mode === "create"
                ? "Creando..."
                : "Actualizando..."
              : mode === "create"
                ? "Crear"
                : "Actualizar"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
