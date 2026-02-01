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
import { FileText, Package, Pencil, Plus, Trash2 } from "lucide-react";
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
import { TechnicalSheetsDialog } from "./TechnicalSheetsDialog";
import { QuotationSummary } from "./QuotationSummary";
import { ClientCreateModal } from "@/pages/client/components/ClientCreateModal";
import { WarehouseCreateModal } from "@/pages/warehouse/components/WarehouseCreateModal";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { useClients } from "@/pages/client/lib/client.hook";

interface QuotationFormProps {
  mode?: "create" | "update";
  initialData?: QuotationResource;
  onSubmit: (data: CreateQuotationRequest | UpdateQuotationRequest) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  warehouses: WarehouseResource[];
}

interface DetailRow {
  product_id: string;
  product_name?: string;
  is_igv: boolean;
  quantity: string;
  unit_price: string;
  purchase_price: string;
  description?: string;
  subtotal: number;
  tax: number;
  total: number;
  technical_sheet?: string[];
}

export const QuotationForm = ({
  mode = "create",
  initialData,
  onCancel,
  onSubmit,
  isSubmitting = false,
  warehouses,
}: QuotationFormProps) => {
  const { user } = useAuthStore();
  const [details, setDetails] = useState<DetailRow[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [branchHasIgv, setBranchHasIgv] = useState<boolean>(true);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [editingDetail, setEditingDetail] = useState<ProductDetail | null>(
    null,
  );
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [technicalSheetsDialog, setTechnicalSheetsDialog] = useState<{
    open: boolean;
    sheets: string[];
    productName: string;
  }>({
    open: false,
    sheets: [],
    productName: "",
  });

  // Estados para modales
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);

  const [warehousesList, setWarehousesList] =
    useState<WarehouseResource[]>(warehouses);

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
      order_purchase: initialData?.order_purchase || "",
      order_service: initialData?.order_service || "",
      warehouse_id: initialData?.warehouse_id?.toString() || "",
      customer_id: initialData?.customer_id?.toString() || "",
    },
  });

  const warehouseId = form.watch("warehouse_id");
  const paymentType = form.watch("payment_type");
  const currency = form.watch("currency");

  useEffect(() => {
    setWarehousesList(warehouses);
  }, [warehouses]);

  // Handlers para modales
  const handleClientCreated = (newClient: PersonResource) => {
    form.setValue("customer_id", newClient.id.toString(), {
      shouldValidate: true,
    });
  };

  const handleWarehouseCreated = (newWarehouse: WarehouseResource) => {
    setWarehousesList((prev) => [...prev, newWarehouse]);
    form.setValue("warehouse_id", newWarehouse.id.toString(), {
      shouldValidate: true,
    });
  };

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
        description: detail.description || "",
        subtotal: detail.subtotal,
        tax: detail.tax,
        total: detail.total,
      };
      setEditingDetail(productDetail);
      setEditingIndex(index);
      setSheetOpen(true);
    },
    [details],
  );

  const handleRemoveDetail = useCallback(
    (index: number) => {
      setDetails(details.filter((_, i) => i !== index));
    },
    [details],
  );

  const handleViewTechnicalSheets = useCallback(
    (index: number) => {
      const detail = details[index];
      setTechnicalSheetsDialog({
        open: true,
        sheets: detail.technical_sheet || [],
        productName: detail.product_name || "",
      });
    },
    [details],
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
        id: "fichas",
        header: "Fichas",
        cell: ({ row }) => (
          <div className="flex justify-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleViewTechnicalSheets(row.index)}
              disabled={
                !row.original.technical_sheet ||
                row.original.technical_sheet.length === 0
              }
              title={
                row.original.technical_sheet &&
                row.original.technical_sheet.length > 0
                  ? "Ver fichas técnicas"
                  : "Sin fichas técnicas"
              }
            >
              <FileText
                className={`h-4 w-4 ${
                  row.original.technical_sheet &&
                  row.original.technical_sheet.length > 0
                    ? "text-green-600"
                    : "text-gray-400"
                }`}
              />
            </Button>
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
    [handleEditDetail, handleRemoveDetail, handleViewTechnicalSheets],
  );

  // Cargar detalles iniciales cuando se está editando
  useEffect(() => {
    if (mode === "update" && initialData?.quotation_details) {
      const loadedDetails: DetailRow[] = initialData.quotation_details.map(
        (detail: QuotationDetailResource) => {
          // Buscar el producto para obtener las fichas técnicas
          const product = products.find((p) => p.id === detail.product_id);

          return {
            product_id: detail.product_id.toString(),
            product_name: detail.product?.name || "",
            is_igv: detail.is_igv,
            quantity: detail.quantity.toString(),
            unit_price: detail.unit_price.toString(),
            purchase_price: detail.purchase_price.toString(),
            description: detail.description || "",
            subtotal: parseFloat(detail.subtotal),
            tax: parseFloat(detail.tax),
            total: parseFloat(detail.total),
            technical_sheet: product?.technical_sheet || [],
          };
        },
      );
      setDetails(loadedDetails);
    }
  }, [mode, initialData, products]);

  // Actualizar el branch_id cuando cambie el warehouse seleccionado
  useEffect(() => {
    if (warehouseId) {
      const selectedWarehouse = warehouses.find(
        (w) => w.id.toString() === warehouseId,
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
    // Buscar el producto para obtener las fichas técnicas
    const product = products.find((p) => p.id.toString() === detail.product_id);

    const newDetail: DetailRow = {
      product_id: detail.product_id,
      product_name: detail.product_name,
      is_igv: detail.is_igv,
      quantity: detail.quantity,
      unit_price: detail.unit_price,
      purchase_price: detail.purchase_price,
      description: detail.description || "",
      subtotal: detail.subtotal,
      tax: detail.tax,
      total: detail.total,
      technical_sheet: product?.technical_sheet || [],
    };

    setDetails([...details, newDetail]);
  };

  const handleUpdateDetail = (detail: ProductDetail, index: number) => {
    // Buscar el producto para obtener las fichas técnicas
    const product = products.find((p) => p.id.toString() === detail.product_id);

    const updatedDetail: DetailRow = {
      product_id: detail.product_id,
      product_name: detail.product_name,
      is_igv: detail.is_igv,
      quantity: detail.quantity,
      unit_price: detail.unit_price,
      purchase_price: detail.purchase_price,
      description: detail.description || "",
      subtotal: detail.subtotal,
      tax: detail.tax,
      total: detail.total,
      technical_sheet: product?.technical_sheet || [],
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
      order_purchase: formData.order_purchase || "",
      order_service: formData.order_service || "",
      warehouse_id: parseInt(formData.warehouse_id),
      customer_id: parseInt(formData.customer_id),
      user_id: user?.id || 1,
      quotation_details: details.map((detail) => ({
        product_id: parseInt(detail.product_id),
        is_igv: detail.is_igv,
        quantity: parseFloat(detail.quantity),
        unit_price: parseFloat(detail.unit_price),
        purchase_price: parseFloat(detail.purchase_price),
        description: detail.description || "",
      })),
    };

    onSubmit(request);
  };

  const getTotalAmount = () => {
    return details.reduce((sum, detail) => sum + detail.total, 0);
  };

  const calculateSubtotalTotal = () => {
    return details.reduce((sum, detail) => sum + detail.subtotal, 0);
  };

  const calculateTaxTotal = () => {
    return details.reduce((sum, detail) => sum + detail.tax, 0);
  };

  const calculateDetailsTotal = () => {
    return details.reduce((sum, detail) => sum + detail.total, 0);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmitForm)}
        className="grid xl:grid-cols-3 gap-6"
      >
        <div className="xl:col-span-2 space-y-6">
          <GroupFormSection
            title="Información General"
            icon={FileText}
            cols={{
              sm: 1,
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex gap-2 items-end max-w-full">
                <div className="flex-1 min-w-0">
                  <FormSelectAsync
                    control={form.control}
                    name="customer_id"
                    label="Cliente"
                    useQueryHook={useClients}
                    mapOptionFn={(client: PersonResource) => ({
                      value: client.id.toString(),
                      label:
                        client.business_name ||
                        `${client.names} ${client.father_surname} ${client.mother_surname || ""}`,
                    })}
                    placeholder="Seleccionar cliente"
                  />
                </div>
                {mode === "create" && (
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => setIsClientModalOpen(true)}
                    className="flex-shrink-0"
                    title="Crear nuevo cliente"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex gap-2 items-end max-w-full">
                <div className="flex-1 min-w-0">
                  <FormSelect
                    control={form.control}
                    name="warehouse_id"
                    label="Almacén"
                    options={warehousesList.map((w) => ({
                      value: w.id.toString(),
                      label: w.name,
                    }))}
                    placeholder="Seleccionar almacén"
                  />
                </div>
                {mode === "create" && (
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => setIsWarehouseModalOpen(true)}
                    className="flex-shrink-0"
                    title="Crear nuevo almacén"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>

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
                name="order_purchase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Orden de Compra</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Número de orden de compra"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="order_service"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Orden de Servicio</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Número de orden de servicio"
                      />
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
              <Button
                type="button"
                onClick={() => setSheetOpen(true)}
                size="sm"
              >
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
            defaultIsIgv={branchHasIgv}
            editingDetail={editingDetail}
            editIndex={editingIndex}
            onEdit={handleUpdateDetail}
            currency={currency}
          />

          <TechnicalSheetsDialog
            open={technicalSheetsDialog.open}
            onOpenChange={(open) =>
              setTechnicalSheetsDialog((prev) => ({ ...prev, open }))
            }
            technicalSheets={technicalSheetsDialog.sheets}
            productName={technicalSheetsDialog.productName}
          />
        </div>

        <QuotationSummary
          form={form}
          mode={mode}
          isSubmitting={isSubmitting}
          customers={customers}
          warehouses={warehouses}
          details={details}
          calculateSubtotalTotal={calculateSubtotalTotal}
          calculateTaxTotal={calculateTaxTotal}
          calculateDetailsTotal={calculateDetailsTotal}
          onCancel={onCancel}
          selectedPaymentType={paymentType}
        />
      </form>

      {/* Modal para crear nuevo cliente */}
      <ClientCreateModal
        open={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onClientCreated={handleClientCreated}
      />

      {/* Modal para crear nuevo almacén */}
      <WarehouseCreateModal
        open={isWarehouseModalOpen}
        onClose={() => setIsWarehouseModalOpen(false)}
        onWarehouseCreated={handleWarehouseCreated}
      />
    </Form>
  );
};
