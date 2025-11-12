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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  purchaseOrderSchemaCreate,
  purchaseOrderSchemaUpdate,
  type PurchaseOrderSchema,
} from "../lib/purchase-order.schema";
import { Loader, Trash2, Edit } from "lucide-react";
import { FormSelect } from "@/components/FormSelect";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import type { PurchaseOrderResource } from "../lib/purchase-order.interface";
import type { WarehouseResource } from "@/pages/warehouse/lib/warehouse.interface";
import type { ProductResource } from "@/pages/product/lib/product.interface";
import { useState } from "react";
import { truncDecimal } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatCurrency";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import { PurchaseOrderDetailForm } from "./forms/PurchaseOrderDetailForm";
import { FormSwitch } from "@/components/FormSwitch";

interface PurchaseOrderFormProps {
  defaultValues: Partial<PurchaseOrderSchema>;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  suppliers: PersonResource[];
  warehouses: WarehouseResource[];
  products: ProductResource[];
  purchaseOrder?: PurchaseOrderResource;
}

interface DetailRow {
  product_id: string;
  product_name?: string;
  quantity_requested: string;
  unit_price_estimated: string;
  subtotal: number;
  // Cuando está en modo update, el backend ya calculó el subtotal real
  subtotal_estimated?: number;
}

export const PurchaseOrderForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  suppliers,
  warehouses,
  products,
  purchaseOrder,
}: PurchaseOrderFormProps) => {
  const [details, setDetails] = useState<DetailRow[]>(
    mode === "update" && purchaseOrder
      ? purchaseOrder.details.map((d) => ({
          product_id: d.product_id.toString(),
          product_name: d.product_name,
          quantity_requested: d.quantity_requested.toString(),
          unit_price_estimated: d.unit_price_estimated,
          // En modo update: usar el subtotal calculado por el backend si existe
          subtotal: d.subtotal_estimated
            ? truncDecimal(parseFloat(d.subtotal_estimated), 6)
            : truncDecimal(
                d.quantity_requested * parseFloat(d.unit_price_estimated),
                6
              ),
          subtotal_estimated: d.subtotal_estimated
            ? truncDecimal(parseFloat(d.subtotal_estimated), 6)
            : undefined,
        }))
      : []
  );
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [currentDetail, setCurrentDetail] = useState<DetailRow>({
    product_id: "",
    quantity_requested: "",
    unit_price_estimated: "",
    subtotal: 0,
  });

  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? purchaseOrderSchemaCreate : purchaseOrderSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
      details: details.length > 0 ? details : [],
      apply_igv: Boolean((defaultValues as any)?.apply_igv ?? false),
    },
    mode: "onChange",
  });

  // Tasa IGV referencial
  const IGV_RATE = 0.18;

  // Vigilar el switch de aplicar IGV para mostrar referencia en UI (no modifica payload)
  const applyIgv = form.watch("apply_igv");

  const handleAddDetail = async (data: any) => {
    const product = products.find((p) => p.id.toString() === data.product_id);

    const newDetail: DetailRow = {
      product_id: data.product_id,
      product_name: product?.name,
      quantity_requested: data.quantity_requested,
      unit_price_estimated: data.unit_price_estimated,
      subtotal: data.subtotal,
    };

    if (editingIndex !== null) {
      const updatedDetails = [...details];
      updatedDetails[editingIndex] = newDetail;
      setDetails(updatedDetails);
      form.setValue("details", updatedDetails);
      setEditingIndex(null);
    } else {
      const updatedDetails = [...details, newDetail];
      setDetails(updatedDetails);
      form.setValue("details", updatedDetails);
    }

    setCurrentDetail({
      product_id: "",
      quantity_requested: "",
      unit_price_estimated: "",
      subtotal: 0,
    });

    // Disparar validación del formulario
    await form.trigger();
  };

  const handleEditDetail = (index: number) => {
    setCurrentDetail(details[index]);
    setEditingIndex(index);
  };

  const handleRemoveDetail = async (index: number) => {
    const updatedDetails = details.filter((_, i) => i !== index);
    setDetails(updatedDetails);
    form.setValue("details", updatedDetails);

    // Disparar validación del formulario
    await form.trigger();
  };

  // Calcular total desde los detalles actuales
  const calculateTotal = () => {
    const sum = details.reduce((sum, detail) => sum + detail.subtotal, 0);
    return truncDecimal(sum, 6);
  };

  // Calcular total desde los detalles actuales
  const subtotalBase = calculateTotal();

  // Calcular IGV y total con IGV (siempre desde subtotales en modo create)
  const igvAmount = truncDecimal(subtotalBase * IGV_RATE, 6);
  const totalWithIgv = truncDecimal(subtotalBase + igvAmount, 6);

  const handleFormSubmit = (data: any) => {
    if (isSubmitting) return; // Prevenir múltiples envíos

    // Transformar detalles a los tipos que espera el backend y calcular subtotales y total
    const transformedDetails = details.map((d) => {
      const qty = Number(d.quantity_requested);
      const price = Number(d.unit_price_estimated);
      const subtotal = truncDecimal(qty * price, 6);
      return {
        product_id: Number(d.product_id),
        quantity_requested: qty,
        unit_price_estimated: truncDecimal(price, 6),
        subtotal_estimated: subtotal,
      };
    });

    const totalEstimated = truncDecimal(
      transformedDetails.reduce((s, it) => s + it.subtotal_estimated, 0),
      6
    );

    onSubmit({
      supplier_id: Number(data.supplier_id),
      warehouse_id: Number(data.warehouse_id),
      order_number: data.order_number,
      issue_date: data.issue_date,
      expected_date: data.expected_date,
      observations: data.observations,
      apply_igv: !!data.apply_igv,
      total_estimated: totalEstimated,
      details: transformedDetails,
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6 w-full"
      >
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                control={form.control}
                name="supplier_id"
                label="Proveedor"
                placeholder="Seleccione un proveedor"
                options={suppliers.map((supplier) => ({
                  value: supplier.id.toString(),
                  label:
                    supplier.business_name ??
                    supplier.names +
                      " " +
                      supplier.father_surname +
                      " " +
                      supplier.mother_surname,
                }))}
                disabled={mode === "update"}
              />

              <FormSelect
                control={form.control}
                name="warehouse_id"
                label="Almacén"
                placeholder="Seleccione un almacén"
                options={warehouses.map((warehouse) => ({
                  value: warehouse.id.toString(),
                  label: warehouse.name,
                }))}
                disabled={mode === "update"}
              />

              <DatePickerFormField
                control={form.control}
                name="issue_date"
                label="Fecha de Emisión"
                disabledRange={{ after: new Date() }}
                placeholder="Seleccione la fecha de emisión"
                dateFormat="dd/MM/yyyy"
              />

              <DatePickerFormField
                control={form.control}
                name="expected_date"
                label="Fecha Esperada"
                placeholder="Seleccione la fecha esperada"
                dateFormat="dd/MM/yyyy"
              />

              <FormSwitch
                control={form.control}
                name="apply_igv"
                label="Aplicar IGV"
                text="¿Aplicar IGV a esta orden de compra?"
              />

              {mode === "update" && purchaseOrder?.total_estimated && (
                <div className="bg-sidebar p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm">Total Estimado:</span>
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(parseFloat(purchaseOrder.total_estimated), { currencySymbol: "S/.", decimals: 6 })}
                    </span>
                  </div>
                </div>
              )}

              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="observations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observaciones</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ingrese observaciones adicionales"
                          className="resize-none"
                          {...field}
                          // Coerce null to empty string so the native textarea value type is satisfied
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {mode === "create" && (
          <Card>
            <CardHeader>
              <CardTitle>Detalles de la Orden</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-sidebar rounded-lg">
                <PurchaseOrderDetailForm
                  products={products}
                  detail={editingIndex !== null ? currentDetail : null}
                  onSubmit={handleAddDetail}
                  onCancel={() => {
                    setCurrentDetail({
                      product_id: "",
                      quantity_requested: "",
                      unit_price_estimated: "",
                      subtotal: 0,
                    });
                    setEditingIndex(null);
                  }}
                  isEditing={editingIndex !== null}
                />
              </div>

              {details.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead className="text-right">
                          P. Unitario
                        </TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                        <TableHead className="text-center">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {details.map((detail, index) => (
                        <TableRow key={index}>
                          <TableCell>{detail.product_name}</TableCell>
                          <TableCell className="text-right">
                            {detail.quantity_requested}
                          </TableCell>
                          <TableCell className="text-right">
                              {formatCurrency(parseFloat(detail.unit_price_estimated), { currencySymbol: "S/.", decimals: 6 })}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(detail.subtotal, { currencySymbol: "S/.", decimals: 6 })}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditDetail(index)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveDetail(index)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                          <TableCell colSpan={3} className="text-right font-bold">
                          SUBTOTAL:
                        </TableCell>
                        <TableCell className="text-right font-bold text-lg text-primary">
                          {formatCurrency(subtotalBase, { currencySymbol: "S/.", decimals: 6 })}
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>

                      {applyIgv && (
                        <>
                          <TableRow>
                            <TableCell
                              colSpan={3}
                              className="text-right font-bold"
                            >
                              IGV (18%) estimado:
                            </TableCell>
                            <TableCell className="text-right font-bold">
                              {formatCurrency(igvAmount, { currencySymbol: "S/.", decimals: 6 })}
                            </TableCell>
                            <TableCell></TableCell>
                          </TableRow>

                          <TableRow>
                            <TableCell
                              colSpan={3}
                              className="text-right font-bold"
                            >
                              TOTAL (con IGV) estimado:
                            </TableCell>
                            <TableCell className="text-right font-bold text-lg text-primary">
                              {formatCurrency(totalWithIgv, { currencySymbol: "S/.", decimals: 6 })}
                            </TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                        </>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}

              {details.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Badge variant="outline" className="text-lg p-3">
                    No hay detalles agregados
                  </Badge>
                  <p className="text-sm mt-2">
                    Agregue productos a la orden de compra
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4 w-full justify-end">
          <Button type="button" variant="neutral" onClick={onCancel}>
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={
              isSubmitting ||
              !form.formState.isValid ||
              (mode === "create" && details.length === 0)
            }
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
