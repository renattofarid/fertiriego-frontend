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
import { Trash2, Plus, Info } from "lucide-react";
import { FormSelect } from "@/components/FormSelect";
import { FormSwitch } from "@/components/FormSwitch";
import { useAllSales, useSaleById } from "@/pages/sale/lib/sale.hook";
import { useEffect, useState } from "react";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { GroupFormSection } from "@/components/GroupFormSection";
import type { Option } from "@/lib/core.interface";
import type { CreditNoteReason } from "../lib/credit-note.interface";
import { CreditNoteSummary } from "./CreditNoteSummary";

interface CreditNoteFormProps {
  defaultValues: Partial<CreditNoteSchema>;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "edit";
  creditNoteReasons: CreditNoteReason[];
}

export const CreditNoteForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  creditNoteReasons,
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
      credit_note_motive_id: "",
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
      quantity: 0,
      unit_price: 0,
    });
  };

  const calculateSubtotal = () => {
    return fields.reduce((sum, _field, index) => {
      const quantity = form.watch(`details.${index}.quantity`) || 0;
      const unitPrice = form.watch(`details.${index}.unit_price`) || 0;
      return sum + (quantity * unitPrice);
    }, 0);
  };

  const calculateIGV = () => {
    return calculateSubtotal() * 0.18;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateIGV();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid xl:grid-cols-3 gap-6 w-full">
        <div className="xl:col-span-2 space-y-4">
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
            disabled={mode === "edit"}
            withValue
          />
          <DatePickerFormField
            control={form.control}
            name="issue_date"
            label="Fecha de Emisión"
            placeholder="Seleccione la fecha"
            disabledRange={{
              after: new Date(),
            }}
          />

          <FormSelect
            name="credit_note_motive_id"
            label="Tipo de Nota de Crédito"
            placeholder="Seleccione el tipo"
            options={creditNoteReasons.map(
              (reason): Option => ({
                value: reason.id.toString(),
                label: reason.name,
              })
            )}
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
        </div>

        <CreditNoteSummary
          form={form}
          mode={mode}
          isSubmitting={isSubmitting}
          selectedSale={selectedSale || undefined}
          creditNoteReasons={creditNoteReasons}
          details={fields}
          calculateSubtotal={calculateSubtotal}
          calculateIGV={calculateIGV}
          calculateTotal={calculateTotal}
          onCancel={onCancel}
        />
      </form>
    </Form>
  );
};
