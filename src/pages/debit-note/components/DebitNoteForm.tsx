"use client";

import { useForm, useFieldArray } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  debitNoteSchema,
  type DebitNoteSchema,
} from "../lib/debit-note.schema";
import { Loader, Trash2, Plus, Info } from "lucide-react";
import { FormSelect } from "@/components/FormSelect";
import { useAllSales, useSaleById } from "@/pages/sale/lib/sale.hook";
import { useEffect, useState } from "react";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { GroupFormSection } from "@/components/GroupFormSection";
import type { DebitNoteReason } from "../lib/debit-note.interface";

interface DebitNoteFormProps {
  defaultValues: Partial<DebitNoteSchema>;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  debitNoteReasons: DebitNoteReason[];
}

export const DebitNoteForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  debitNoteReasons,
}: DebitNoteFormProps) => {
  const { data: sales } = useAllSales();
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(
    defaultValues.sale_id || null
  );
  const { data: selectedSale } = useSaleById(Number(selectedSaleId));

  const form = useForm({
    resolver: zodResolver(debitNoteSchema),
    defaultValues: {
      sale_id: "",
      warehouse_id: "",
      issue_date: "",
      debit_note_motive_id: "",
      observations: "",
      details: [],
      ...defaultValues,
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "details",
  });

  // Preparar opciones para el selector de ventas
  const saleOptions =
    sales?.map((sale) => ({
      value: sale.id.toString(),
      label: `${sale.full_document_number} - ${sale.customer_fullname}`,
      description: `Total: ${sale.currency} ${sale.total_amount}`,
    })) || [];

  // Cuando se selecciona una venta, actualizar el estado y cargar detalles
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "sale_id" && value.sale_id) {
        setSelectedSaleId(value.sale_id);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Cargar todos los detalles de la venta seleccionada
  useEffect(() => {
    if (selectedSale && mode === "create") {
      // Limpiar detalles existentes
      form.setValue("details", []);

      // Cargar todos los detalles de la venta
      const saleDetails =
        selectedSale.details?.map((detail) => ({
          sale_detail_id: detail.id.toString(),
          product_id: detail.product_id,
          concept: detail.concept,
          quantity: detail.quantity,
          unit_price: detail.unit_price,
        })) || [];

      form.setValue("details", saleDetails);
    }
  }, [selectedSale, mode, form]);

  // Preparar opciones de productos de la venta seleccionada
  const saleDetailOptions =
    selectedSale?.details?.map((detail) => ({
      value: detail.id.toString(),
      label: detail.product.name,
      description: `Cantidad: ${detail.quantity} - Precio: ${detail.unit_price}`,
      product_id: detail.product_id,
      quantity: detail.quantity,
      unit_price: detail.unit_price,
    })) || [];

  const handleAddDetail = () => {
    append({
      sale_detail_id: "",
      product_id: 0,
      concept: "",
      quantity: 0,
      unit_price: 0,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <GroupFormSection
          title="Información de la Nota de Crédito"
          icon={Info}
          cols={{ sm: 1 }}
        >
          <FormSelect
            name="sale_id"
            label="Venta"
            placeholder="Seleccione la venta"
            options={saleOptions}
            control={form.control}
            disabled={mode === "update"}
            withValue
          />
          <DatePickerFormField
            control={form.control}
            name="issue_date"
            label="Fecha de Emisión"
            placeholder="Seleccione la fecha"
          />

          <FormSelect
            name="debit_note_type"
            label="Tipo de Nota de Crédito"
            placeholder="Seleccione el tipo"
            options={debitNoteReasons.map((reason) => ({
              value: reason.id.toString(),
              label: reason.name,
            }))}
            control={form.control}
          />

          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ingrese las observaciones de la nota de débito"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </GroupFormSection>

        {/* Detalles */}
        <GroupFormSection
          title="Detalles de la Nota de Crédito"
          icon={Info}
          cols={{ sm: 1 }}
          headerExtra={
            <Button
              type="button"
              onClick={handleAddDetail}
              size="sm"
              disabled={!selectedSaleId}
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar Detalle
            </Button>
          }
        >
          {fields.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay detalles agregados. Seleccione una venta y agregue
              detalles.
            </p>
          )}

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end"
                key={field.id}
              >
                <div className="md:col-span-2">
                  <FormSelect
                    name={`details.${index}.sale_detail_id`}
                    label="Producto de la Venta"
                    placeholder="Seleccione el producto"
                    options={saleDetailOptions}
                    control={form.control}
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
                          step="0.001"
                          placeholder="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`details.${index}.unit_price`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio Unitario</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </GroupFormSection>

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
