"use client";

import { useForm } from "react-hook-form";
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
import { FileText, Loader, Package, Plus, Trash2 } from "lucide-react";
import { FormSelect } from "@/components/FormSelect";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import type { WarehouseResource } from "@/pages/warehouse/lib/warehouse.interface";
import type { ProductResource } from "@/pages/product/lib/product.interface";
import type { QuotationResource } from "@/pages/quotation/lib/quotation.interface";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { AddProductSheet, type ProductDetail } from "./AddProductSheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CURRENCIES, type CreateOrderRequest } from "../lib/order.interface";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { GroupFormSection } from "@/components/GroupFormSection";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface OrderFormProps {
  onSubmit: (data: CreateOrderRequest) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  customers: PersonResource[];
  warehouses: WarehouseResource[];
  products: ProductResource[];
  quotations?: QuotationResource[];
  defaultValues?: any;
  mode?: "create" | "update";
  order?: any;
}

interface DetailRow {
  product_id: string;
  product_name?: string;
  is_igv: boolean;
  quantity: string;
  unit_price: string;
  purchase_price: string;
  subtotal: number;
  tax: number;
  total: number;
}

export const OrderForm = ({
  onCancel,
  onSubmit,
  isSubmitting = false,
  customers,
  warehouses,
  products,
  quotations,
  defaultValues,
  mode = "create",
  order,
}: OrderFormProps) => {
  const { user } = useAuthStore();
  const [details, setDetails] = useState<DetailRow[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);

  const form = useForm<any>({
    defaultValues: defaultValues || {
      order_date: new Date().toISOString().split("T")[0],
      order_expiry_date: "",
      order_delivery_date: "",
      currency: "PEN",
      address: "",
      warehouse_id: "",
      observations: "",
      status: "Pendiente",
      quotation_id: "",
      customer_id: "",
    },
  });

  const quotationId = form.watch("quotation_id");

  // Load order details when in edit mode
  useEffect(() => {
    if (mode === "update" && order && order.order_details) {
      const orderDetails: DetailRow[] = order.order_details.map(
        (detail: any) => ({
          product_id: detail.product_id.toString(),
          product_name: detail.product?.name || "Producto",
          is_igv: detail.is_igv,
          quantity: detail.quantity,
          unit_price: detail.unit_price,
          purchase_price: detail.purchase_price,
          subtotal: parseFloat(detail.subtotal),
          tax: parseFloat(detail.tax),
          total: parseFloat(detail.total),
        })
      );
      setDetails(orderDetails);
    }
  }, [mode, order]);

  useEffect(() => {
    if (quotationId && quotations) {
      const selectedQuotation = quotations.find(
        (q) => q.id === parseInt(quotationId)
      );

      if (selectedQuotation && mode === "create") {
        // Prellenar datos del formulario
        form.setValue("customer_id", selectedQuotation.customer_id.toString());
        form.setValue(
          "warehouse_id",
          selectedQuotation.warehouse_id.toString()
        );
        form.setValue("currency", selectedQuotation.currency);
        form.setValue("address", selectedQuotation.address || "");
        form.setValue("observations", selectedQuotation.observations || "");

        // Prellenar los detalles de productos
        const quotationDetails: DetailRow[] =
          selectedQuotation.quotation_details.map((detail) => ({
            product_id: detail.product_id.toString(),
            product_name: detail.product.name,
            is_igv: detail.is_igv,
            quantity: detail.quantity,
            unit_price: detail.unit_price,
            purchase_price: detail.purchase_price,
            subtotal: parseFloat(detail.subtotal),
            tax: parseFloat(detail.tax),
            total: parseFloat(detail.total),
          }));

        setDetails(quotationDetails);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotationId, quotations]);

  const handleAddDetail = (detail: ProductDetail) => {
    const newDetail: DetailRow = {
      product_id: detail.product_id,
      product_name: detail.product_name,
      is_igv: detail.is_igv,
      quantity: detail.quantity,
      unit_price: detail.unit_price,
      purchase_price: detail.purchase_price,
      subtotal: detail.subtotal,
      tax: detail.tax,
      total: detail.total,
    };

    setDetails([...details, newDetail]);
  };

  const handleRemoveDetail = (index: number) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  const handleSubmitForm = (formData: any) => {
    if (details.length === 0) {
      return;
    }

    const request: CreateOrderRequest = {
      order_date: formData.order_date,
      order_expiry_date: formData.order_expiry_date,
      order_delivery_date: formData.order_delivery_date,
      currency: formData.currency,
      address: formData.address || "",
      warehouse_id: parseInt(formData.warehouse_id),
      user_id: user?.id || 1,
      observations: formData.observations || "",
      status: formData.status,
      customer_id: parseInt(formData.customer_id),
      ...(formData.quotation_id && {
        quotation_id: parseInt(formData.quotation_id),
      }),
      order_details: details.map((detail) => ({
        product_id: parseInt(detail.product_id),
        is_igv: detail.is_igv,
        quantity: parseFloat(detail.quantity),
        unit_price: parseFloat(detail.unit_price),
        purchase_price: parseFloat(detail.purchase_price),
      })),
    };

    onSubmit(request);
  };

  const getTotalAmount = () => {
    return details.reduce((sum, detail) => sum + detail.total, 0);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmitForm)}
        className="space-y-6"
      >
        <GroupFormSection
          title="Información General"
          icon={FileText}
          cols={{
            sm: 1,
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormSelect
              control={form.control}
              name="customer_id"
              label="Cliente"
              options={customers.map((c) => ({
                value: c.id.toString(),
                label:
                  c.business_name ||
                  c.names +
                    " " +
                    (c.father_surname || "") +
                    " " +
                    (c.mother_surname || ""),
              }))}
              placeholder="Seleccionar cliente"
            />

            <FormSelect
              control={form.control}
              name="warehouse_id"
              label="Almacén"
              options={warehouses.map((w) => ({
                value: w.id.toString(),
                label: w.name,
                description: w.address,
              }))}
              placeholder="Seleccionar almacén"
            />

            {quotations && quotations.length > 0 && (
              <FormSelect
                control={form.control}
                name="quotation_id"
                label="Cotización"
                options={quotations.map((q) => ({
                  value: q.id.toString(),
                  label: `#${q.id} - ${q.quotation_number}`,
                }))}
                placeholder="Seleccionar cotización"
              />
            )}

            <DatePickerFormField
              control={form.control}
              name="order_date"
              label="Fecha de Pedido"
              placeholder="Seleccionar fecha"
            />

            <DatePickerFormField
              control={form.control}
              name="order_delivery_date"
              label="Fecha de Entrega"
              placeholder="Seleccionar fecha"
            />

            <DatePickerFormField
              control={form.control}
              name="order_expiry_date"
              label="Fecha de Vencimiento"
              placeholder="Seleccionar fecha"
            />

            <FormSelect
              control={form.control}
              name="currency"
              label="Moneda"
              options={CURRENCIES.map((c) => ({
                value: c.value,
                label: c.label,
              }))}
              placeholder="Seleccionar moneda"
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="md:col-span-3">
                  <FormLabel>Dirección de Entrega</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Dirección de entrega" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem className="md:col-span-3">
                  <FormLabel>Observaciones</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Observaciones adicionales"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </GroupFormSection>

        <GroupFormSection
          title="Detalles del Pedido"
          icon={Package}
          cols={{
            sm: 1,
          }}
        >
          <div className="flex justify-end">
            <Button type="button" onClick={() => setSheetOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Producto
            </Button>
          </div>
          {details.length === 0 ? (
            <Empty className="border border-dashed">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Package />
                </EmptyMedia>
                <EmptyTitle>No hay productos agregados</EmptyTitle>
                <EmptyDescription>
                  Haz clic en "Agregar Producto" para añadir productos al
                  pedido.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">P. Unitario</TableHead>
                  <TableHead className="text-right">P. Compra</TableHead>
                  <TableHead className="text-center">IGV</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="text-right">IGV</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {details.map((detail, index) => (
                  <TableRow key={index}>
                    <TableCell>{detail.product_name}</TableCell>
                    <TableCell className="text-right">
                      {detail.quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      {parseFloat(detail.unit_price).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {parseFloat(detail.purchase_price).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={detail.is_igv ? "default" : "secondary"}>
                        {detail.is_igv ? "Sí" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {detail.subtotal.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {detail.tax.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {detail.total.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveDetail(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={7} className="text-right font-bold">
                    Total General:
                  </TableCell>
                  <TableCell className="text-right font-bold text-lg">
                    {getTotalAmount().toFixed(2)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          )}
        </GroupFormSection>

        <AddProductSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          onAdd={handleAddDetail}
          products={products}
        />

        <div className="flex gap-4 justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting || details.length === 0}>
            {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting
              ? mode === "update"
                ? "Actualizando..."
                : "Creando..."
              : mode === "update"
              ? "Actualizar Pedido"
              : "Crear Pedido"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
