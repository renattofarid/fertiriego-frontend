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
  creditNoteSchema,
  type CreditNoteSchema,
} from "../lib/credit-note.schema";
import { Loader, Trash2, Plus } from "lucide-react";
import { FormSelect } from "@/components/FormSelect";
import { FormSwitch } from "@/components/FormSwitch";
import { useAllSales, useSaleById } from "@/pages/sale/lib/sale.hook";
import { CREDIT_NOTE_TYPES } from "../lib/credit-note.interface";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DatePickerFormField } from "@/components/DatePickerFormField";

interface CreditNoteFormProps {
  defaultValues: Partial<CreditNoteSchema>;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const CreditNoteForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: CreditNoteFormProps) => {
  const { data: sales } = useAllSales();
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(
    defaultValues.sale_id || null
  );
  const { data: selectedSale } = useSaleById(Number(selectedSaleId));

  const form = useForm({
    resolver: zodResolver(creditNoteSchema),
    defaultValues: {
      sale_id: "",
      issue_date: new Date().toISOString().split("T")[0],
      credit_note_type: "",
      reason: "",
      affects_stock: true,
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

  const creditNoteTypeOptions = CREDIT_NOTE_TYPES.map((type) => ({
    value: type.value,
    label: type.label,
  }));

  // Cuando se selecciona una venta, actualizar el estado
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "sale_id" && value.sale_id) {
        setSelectedSaleId(value.sale_id);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

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
      quantity: 0,
      unit_price: 0,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg">
          <FormSelect
            name="sale_id"
            label="Venta"
            placeholder="Seleccione la venta"
            options={saleOptions}
            control={form.control}
            disabled={mode === "update"}
          />
          <DatePickerFormField
            control={form.control}
            name="issue_date"
            label="Fecha de Emisión"
            placeholder="Seleccione la fecha"
          />

          <FormSelect
            name="credit_note_type"
            label="Tipo de Nota de Crédito"
            placeholder="Seleccione el tipo"
            options={creditNoteTypeOptions}
            control={form.control}
          />

          <FormSwitch
            name="affects_stock"
            label="Afecta Stock"
            text="Marque si la nota de crédito debe afectar el inventario"
            control={form.control}
          />

          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ingrese el motivo de la nota de crédito"
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

        {/* Detalles */}
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Detalles de la Nota de Crédito
            </h3>
            <Button
              type="button"
              onClick={handleAddDetail}
              variant="outline"
              size="sm"
              disabled={!selectedSaleId}
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar Detalle
            </Button>
          </div>

          {fields.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay detalles agregados. Seleccione una venta y agregue
              detalles.
            </p>
          )}

          <div className="space-y-4">
            {fields.map((field, index) => (
              <Card key={field.id}>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
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
                </CardContent>
              </Card>
            ))}
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
