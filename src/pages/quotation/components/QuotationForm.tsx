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
import { useState } from "react";
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
import {
  PAYMENT_TYPES,
  CURRENCIES,
  type CreateQuotationRequest,
} from "../lib/quotation.interface";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { GroupFormSection } from "@/components/GroupFormSection";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface QuotationFormProps {
  onSubmit: (data: CreateQuotationRequest) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  customers: PersonResource[];
  warehouses: WarehouseResource[];
  products: ProductResource[];
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

export const QuotationForm = ({
  onCancel,
  onSubmit,
  isSubmitting = false,
  customers,
  warehouses,
  products,
}: QuotationFormProps) => {
  const { user } = useAuthStore();
  const [details, setDetails] = useState<DetailRow[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);

  const form = useForm<any>({
    defaultValues: {
      fecha_emision: new Date().toISOString().split("T")[0],
      delivery_time: "3 días hábiles",
      validity_time: "10 días",
      currency: "PEN",
      payment_type: "CONTADO",
      status: "Pendiente",
      observations: "",
      address: "",
      reference: "",
      account_number: "",
      warehouse_id: "",
      customer_id: "",
    },
  });

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

    const request: CreateQuotationRequest = {
      fecha_emision: formData.fecha_emision,
      delivery_time: formData.delivery_time,
      validity_time: formData.validity_time,
      currency: formData.currency,
      payment_type: formData.payment_type,
      observations: formData.observations || "",
      address: formData.address || "",
      reference: formData.reference || "",
      account_number: formData.account_number || "",
      warehouse_id: parseInt(formData.warehouse_id),
      customer_id: parseInt(formData.customer_id),
      user_id: user?.id || 1,
      quotation_details: details.map((detail) => ({
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
                    c.father_surname +
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
              }))}
              placeholder="Seleccionar almacén"
            />

            <DatePickerFormField
              control={form.control}
              name="fecha_emision"
              label="Fecha de Emisión"
              placeholder="Seleccionar fecha"
            />

            <FormField
              control={form.control}
              name="delivery_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiempo de Entrega</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ej: 3 días hábiles" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="validity_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiempo de Vigencia</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ej: 10 días" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormSelect
              control={form.control}
              name="payment_type"
              label="Tipo de Pago"
              options={PAYMENT_TYPES.map((type) => ({
                value: type.value,
                label: type.label,
              }))}
              placeholder="Seleccionar tipo de pago"
            />

            <FormSelect
              control={form.control}
              name="currency"
              label="Moneda"
              options={CURRENCIES.map((currency) => ({
                value: currency.value,
                label: currency.label,
              }))}
              placeholder="Seleccionar moneda"
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Dirección de entrega" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referencia</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Referencia de ubicación" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="account_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Cuenta</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Número de cuenta bancaria" />
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
          title="Información General"
          icon={FileText}
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
                  Haz clic en "Agregar Producto" para añadir productos a la
                  cotización.
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
            {isSubmitting ? "Creando..." : "Crear Cotización"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
