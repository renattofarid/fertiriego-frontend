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
import { FileText, Loader, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { FormSelect } from "@/components/FormSelect";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import type { WarehouseResource } from "@/pages/warehouse/lib/warehouse.interface";
import type { ProductResource } from "@/pages/product/lib/product.interface";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { AddProductSheet, type ProductDetail } from "./AddProductSheet";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import {
  PAYMENT_TYPES,
  CURRENCIES,
  type CreateQuotationRequest,
  type UpdateQuotationRequest,
  type QuotationResource,
  type QuotationDetailResource,
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
import { useBranchById } from "@/pages/branch/lib/branch.hook";

interface QuotationFormProps {
  mode?: "create" | "edit";
  initialData?: QuotationResource;
  onSubmit: (data: CreateQuotationRequest | UpdateQuotationRequest) => void;
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
  mode = "create",
  initialData,
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
  const [branchHasIgv, setBranchHasIgv] = useState<boolean>(true);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [editingDetail, setEditingDetail] = useState<ProductDetail | null>(
    null
  );
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const form = useForm({
    defaultValues: {
      fecha_emision:
        initialData?.fecha_emision || new Date().toISOString().split("T")[0],
      delivery_time: initialData?.delivery_time || "3 días hábiles",
      validity_time: initialData?.validity_time || "10 días",
      currency: initialData?.currency || "PEN",
      payment_type: initialData?.payment_type || "CONTADO",
      days: initialData?.days?.toString() || "",
      status: initialData?.status || "Pendiente",
      observations: initialData?.observations || "",
      address: initialData?.address || "",
      reference: initialData?.reference || "",
      account_number: initialData?.account_number || "",
      warehouse_id: initialData?.warehouse_id?.toString() || "",
      customer_id: initialData?.customer_id?.toString() || "",
    },
  });

  const warehouseId = form.watch("warehouse_id");
  const paymentType = form.watch("payment_type");

  // Obtener datos de la branch solo cuando tengamos un branch_id válido
  const { data: branchData } = useBranchById(selectedBranchId || 0);

  const handleEditDetail = useCallback(
    (index: number) => {
      const detail = details[index];
      const productDetail: ProductDetail = {
        product_id: detail.product_id,
        product_name: detail.product_name || "",
        is_igv: detail.is_igv,
        quantity: detail.quantity,
        unit_price: detail.unit_price,
        purchase_price: detail.purchase_price,
        subtotal: detail.subtotal,
        tax: detail.tax,
        total: detail.total,
      };
      setEditingDetail(productDetail);
      setEditingIndex(index);
      setSheetOpen(true);
    },
    [details]
  );

  const handleRemoveDetail = useCallback(
    (index: number) => {
      setDetails(details.filter((_, i) => i !== index));
    },
    [details]
  );

  const columns = useMemo<ColumnDef<DetailRow>[]>(
    () => [
      {
        accessorKey: "product_name",
        header: "Producto",
      },
      {
        accessorKey: "quantity",
        header: "Cantidad",
        cell: ({ row }) => (
          <div className="text-right">{row.original.quantity}</div>
        ),
      },
      {
        accessorKey: "unit_price",
        header: "P. Unitario",
        cell: ({ row }) => (
          <div className="text-right">
            {parseFloat(row.original.unit_price).toFixed(2)}
          </div>
        ),
      },
      {
        accessorKey: "purchase_price",
        header: "P. Compra",
        cell: ({ row }) => (
          <div className="text-right">
            {parseFloat(row.original.purchase_price).toFixed(2)}
          </div>
        ),
      },
      {
        accessorKey: "is_igv",
        header: "IGV",
        cell: ({ row }) => (
          <div className="text-center">
            <Badge variant={row.original.is_igv ? "default" : "secondary"}>
              {row.original.is_igv ? "Sí" : "No"}
            </Badge>
          </div>
        ),
      },
      {
        accessorKey: "subtotal",
        header: "Subtotal",
        cell: ({ row }) => (
          <div className="text-right">{row.original.subtotal.toFixed(2)}</div>
        ),
      },
      {
        accessorKey: "tax",
        header: "IGV",
        cell: ({ row }) => (
          <div className="text-right">{row.original.tax.toFixed(2)}</div>
        ),
      },
      {
        accessorKey: "total",
        header: "Total",
        cell: ({ row }) => (
          <div className="text-right font-semibold">
            {row.original.total.toFixed(2)}
          </div>
        ),
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex gap-2 justify-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleEditDetail(row.index)}
            >
              <Pencil className="h-4 w-4 text-blue-500" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveDetail(row.index)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ),
      },
    ],
    [handleEditDetail, handleRemoveDetail]
  );

  // Cargar detalles iniciales cuando se está editando
  useEffect(() => {
    if (mode === "edit" && initialData?.quotation_details) {
      const loadedDetails: DetailRow[] = initialData.quotation_details.map(
        (detail: QuotationDetailResource) => ({
          product_id: detail.product_id.toString(),
          product_name: detail.product?.name || "",
          is_igv: detail.is_igv,
          quantity: detail.quantity.toString(),
          unit_price: detail.unit_price.toString(),
          purchase_price: detail.purchase_price.toString(),
          subtotal: parseFloat(detail.subtotal),
          tax: parseFloat(detail.tax),
          total: parseFloat(detail.total),
        })
      );
      setDetails(loadedDetails);
    }
  }, [mode, initialData]);

  // Actualizar el branch_id cuando cambie el warehouse seleccionado
  useEffect(() => {
    if (warehouseId) {
      const selectedWarehouse = warehouses.find(
        (w) => w.id.toString() === warehouseId
      );
      if (selectedWarehouse?.branch_id) {
        setSelectedBranchId(selectedWarehouse.branch_id);
      }
    } else {
      setSelectedBranchId(null);
    }
  }, [warehouseId, warehouses]);

  // Actualizar has_igv cuando se obtengan los datos de la branch
  useEffect(() => {
    if (branchData) {
      setBranchHasIgv(branchData.has_igv === 1);
    }
  }, [branchData]);

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

  const handleUpdateDetail = (detail: ProductDetail, index: number) => {
    const updatedDetail: DetailRow = {
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

    const updatedDetails = [...details];
    updatedDetails[index] = updatedDetail;
    setDetails(updatedDetails);
    setEditingDetail(null);
    setEditingIndex(null);
  };

  const handleCloseSheet = () => {
    setSheetOpen(false);
    setEditingDetail(null);
    setEditingIndex(null);
  };

  const handleSubmitForm = (formData: Record<string, string>) => {
    if (details.length === 0) {
      return;
    }

    const request: CreateQuotationRequest = {
      fecha_emision: formData.fecha_emision,
      delivery_time: formData.delivery_time,
      validity_time: formData.validity_time,
      currency: formData.currency,
      payment_type: formData.payment_type,
      ...(formData.payment_type === "CREDITO" && formData.days
        ? { days: parseInt(formData.days) }
        : {}),
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

            {paymentType === "CREDITO" && (
              <FormField
                control={form.control}
                name="days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Días de Crédito</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        placeholder="Número de días"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
          title="Productos"
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
                  Haz clic en "Agregar Producto" para añadir productos a la
                  cotización.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="space-y-4">
              <DataTable
                columns={columns}
                data={details}
                isVisibleColumnFilter={false}
                variant="default"
              />
              <div className="flex justify-end items-center gap-4 px-4">
                <span className="text-sm font-bold">Total General:</span>
                <span className="text-lg font-bold">
                  {getTotalAmount().toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </GroupFormSection>

        <AddProductSheet
          open={sheetOpen}
          onClose={handleCloseSheet}
          onAdd={handleAddDetail}
          products={products}
          defaultIsIgv={branchHasIgv}
          editingDetail={editingDetail}
          editIndex={editingIndex}
          onEdit={handleUpdateDetail}
        />

        <div className="flex gap-4 justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting || details.length === 0}>
            {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "edit"
              ? isSubmitting
                ? "Actualizando..."
                : "Actualizar Cotización"
              : isSubmitting
              ? "Creando..."
              : "Crear Cotización"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
