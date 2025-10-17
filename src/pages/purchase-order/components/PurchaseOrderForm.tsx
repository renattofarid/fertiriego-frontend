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
import { Textarea } from "@/components/ui/textarea";
import {
  purchaseOrderSchemaCreate,
  purchaseOrderSchemaUpdate,
  type PurchaseOrderSchema,
} from "../lib/purchase-order.schema";
import { Loader, Plus, Trash2, Edit } from "lucide-react";
import { FormSelect } from "@/components/FormSelect";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import type { PurchaseOrderResource } from "../lib/purchase-order.interface";
import type { WarehouseResource } from "@/pages/warehouse/lib/warehouse.interface";
import type { ProductResource } from "@/pages/product/lib/product.interface";
import { useState, useEffect } from "react";
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
        subtotal:
          d.quantity_requested * parseFloat(d.unit_price_estimated),
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

  // Controlador temporal para el select de productos
  const tempForm = useForm({
    defaultValues: {
      temp_product_id: currentDetail.product_id,
      temp_quantity: currentDetail.quantity_requested,
      temp_price: currentDetail.unit_price_estimated,
    },
  });

  // Sincronizar el formulario temporal con el estado actual
  useEffect(() => {
    tempForm.setValue("temp_product_id", currentDetail.product_id);
    tempForm.setValue("temp_quantity", currentDetail.quantity_requested);
    tempForm.setValue("temp_price", currentDetail.unit_price_estimated);
  }, [currentDetail, tempForm]);

  // Observar cambios en todos los campos del formulario temporal
  const selectedProductId = tempForm.watch("temp_product_id");
  const selectedQuantity = tempForm.watch("temp_quantity");
  const selectedPrice = tempForm.watch("temp_price");
  
  useEffect(() => {
    if (selectedProductId !== currentDetail.product_id) {
      setCurrentDetail({
        ...currentDetail,
        product_id: selectedProductId || "",
      });
    }
  }, [selectedProductId, currentDetail]);

  useEffect(() => {
    if (selectedQuantity !== currentDetail.quantity_requested) {
      setCurrentDetail({
        ...currentDetail,
        quantity_requested: selectedQuantity || "",
      });
    }
  }, [selectedQuantity, currentDetail]);

  useEffect(() => {
    if (selectedPrice !== currentDetail.unit_price_estimated) {
      setCurrentDetail({
        ...currentDetail,
        unit_price_estimated: selectedPrice || "",
      });
    }
  }, [selectedPrice, currentDetail]);

  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? purchaseOrderSchemaCreate : purchaseOrderSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
      details: details.length > 0 ? details : [],
    },
    mode: "onChange",
  });

  const handleAddDetail = () => {
    if (
      !currentDetail.product_id ||
      !currentDetail.quantity_requested ||
      !currentDetail.unit_price_estimated
    ) {
      return;
    }

    const product = products.find((p) => p.id.toString() === currentDetail.product_id);
    const subtotal =
      parseFloat(currentDetail.quantity_requested) *
      parseFloat(currentDetail.unit_price_estimated);

    const newDetail: DetailRow = {
      ...currentDetail,
      product_name: product?.name,
      subtotal,
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
  };

  const handleEditDetail = (index: number) => {
    setCurrentDetail(details[index]);
    setEditingIndex(index);
  };

  const handleRemoveDetail = (index: number) => {
    const updatedDetails = details.filter((_, i) => i !== index);
    setDetails(updatedDetails);
    form.setValue("details", updatedDetails);
  };

  const calculateTotal = () => {
    return details.reduce((sum, detail) => sum + detail.subtotal, 0);
  };

  const handleFormSubmit = (data: any) => {
    onSubmit({
      ...data,
      details,
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
                  label: supplier.business_name
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

              <FormField
                control={form.control}
                name="order_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Orden</FormLabel>
                    <FormControl>
                      <Input
                        variant="primary"
                        placeholder="Ej: OC-2025-001"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DatePickerFormField
                control={form.control}
                name="issue_date"
                label="Fecha de Emisión"
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-sidebar rounded-lg">
                <div className="md:col-span-2">
                  <Form {...tempForm}>
                    <FormSelect
                      control={tempForm.control}
                      name="temp_product_id"
                      label="Producto"
                      placeholder="Seleccione un producto"
                      options={products.map((product) => ({
                        value: product.id.toString(),
                        label: product.name,
                      }))}
                    />
                  </Form>
                </div>

                <div>
                  <FormField
                    control={tempForm.control}
                    name="temp_quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cantidad</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            variant="primary"
                            placeholder="0"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <FormField
                    control={tempForm.control}
                    name="temp_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio Unitario</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            variant="primary"
                            placeholder="0.00"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="md:col-span-4 flex justify-end">
                  <Button
                    type="button"
                    variant="default"
                    onClick={handleAddDetail}
                    disabled={
                      !currentDetail.product_id ||
                      !currentDetail.quantity_requested ||
                      !currentDetail.unit_price_estimated
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {editingIndex !== null ? "Actualizar" : "Agregar"}
                  </Button>
                </div>
              </div>

              {details.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead className="text-right">P. Unitario</TableHead>
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
                            S/. {parseFloat(detail.unit_price_estimated).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            S/. {detail.subtotal.toFixed(2)}
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
                          TOTAL:
                        </TableCell>
                        <TableCell className="text-right font-bold text-lg text-green-600">
                          S/. {calculateTotal().toFixed(2)}
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
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
