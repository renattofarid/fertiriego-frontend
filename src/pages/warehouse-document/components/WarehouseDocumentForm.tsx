import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { warehouseDocumentSchemaCreate } from "../lib/warehouse-document.schema";
import type { WarehouseDocumentSchema } from "../lib/warehouse-document.schema";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import FormWrapper from "@/components/FormWrapper";
import { FormSelect } from "@/components/FormSelect";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { Textarea } from "@/components/ui/textarea";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DOCUMENT_TYPES } from "../lib/warehouse-document.constants";
import type { WarehouseResource } from "@/pages/warehouse/lib/warehouse.interface";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import type { ProductResource } from "@/pages/product/lib/product.interface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray } from "react-hook-form";

interface WarehouseDocumentFormProps {
  onSubmit: (data: WarehouseDocumentSchema) => void;
  defaultValues?: Partial<WarehouseDocumentSchema>;
  isSubmitting?: boolean;
  mode: "create" | "update";
  warehouses: WarehouseResource[];
  persons: PersonResource[];
  products: ProductResource[];
}

export default function WarehouseDocumentForm({
  onSubmit,
  defaultValues,
  isSubmitting,
  mode,
  warehouses,
  persons,
  products,
}: WarehouseDocumentFormProps) {
  const form = useForm({
    resolver: zodResolver(warehouseDocumentSchemaCreate) as any,
    defaultValues: defaultValues || {
      warehouse_id: "",
      document_type: "",
      document_number: "",
      person_id: "",
      document_date: "",
      observations: "",
      details: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "details",
  });

  const addDetail = () => {
    append({
      product_id: "",
      quantity: 0,
      unit_cost: 0,
      observations: "",
    });
  };

  return (
    <FormWrapper>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit as any)}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              control={form.control}
              name="warehouse_id"
              label="Almacén"
              placeholder="Seleccione un almacén"
              options={warehouses.map((w) => ({
                value: w.id.toString(),
                label: w.name,
              }))}
            />

            <FormSelect
              control={form.control}
              name="document_type"
              label="Tipo de Documento"
              placeholder="Seleccione el tipo"
              options={DOCUMENT_TYPES.map((type) => ({
                value: type.value,
                label: type.label,
              }))}
            />

            <FormField
              control={form.control}
              name="document_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Documento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: AJ-000123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormSelect
              control={form.control}
              name="person_id"
              label="Persona Responsable"
              placeholder="Seleccione una persona"
              options={persons.map((p) => ({
                value: p.id.toString(),
                label: `${p.names} ${p.father_surname ?? ""} ${
                  p.mother_surname ?? ""
                }`.trim(),
              }))}
            />

            <DatePickerFormField
              control={form.control}
              name="document_date"
              label="Fecha del Documento"
            />
          </div>

          <FormField
            control={form.control}
            name="observations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observaciones</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Observaciones adicionales"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Detalles del Documento</CardTitle>
                <Button type="button" onClick={addDetail} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Producto
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2">
                        <FormSelect
                          control={form.control}
                          name={`details.${index}.product_id`}
                          label="Producto"
                          placeholder="Seleccione producto"
                          options={products.map((p) => ({
                            value: p.id.toString(),
                            label: p.name,
                          }))}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`details.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cantidad</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`details.${index}.unit_cost`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Costo Unitario</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="md:col-span-3">
                        <FormField
                          control={form.control}
                          name={`details.${index}.observations`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Observaciones</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Observaciones del producto"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}

                {fields.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay productos agregados. Haga clic en "Agregar Producto"
                    para comenzar.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Guardando..."
                : mode === "create"
                ? "Crear Documento"
                : "Actualizar Documento"}
            </Button>
          </div>
        </form>
      </Form>
    </FormWrapper>
  );
}
