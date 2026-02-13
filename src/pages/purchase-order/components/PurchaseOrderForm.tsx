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
import {
  Trash2,
  Pencil,
  FileText,
  ListCheck,
  Plus,
  ShoppingCart,
} from "lucide-react";
import { FormSelect } from "@/components/FormSelect";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import type { PurchaseOrderResource } from "../lib/purchase-order.interface";
import type { WarehouseResource } from "@/pages/warehouse/lib/warehouse.interface";
import type { ProductResource } from "@/pages/product/lib/product.interface";
import { useState, useEffect } from "react";
import { truncDecimal } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatCurrency";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import { FormSwitch } from "@/components/FormSwitch";
import { GroupFormSection } from "@/components/GroupFormSection";
import EmptyState from "@/components/EmptyState";
import { FormInput } from "@/components/FormInput";
import { PurchaseOrderSummary } from "./PurchaseOrderSummary";
import { SupplierCreateModal } from "@/pages/supplier/components/SupplierCreateModal";
import { WarehouseCreateModal } from "@/pages/warehouse/components/WarehouseCreateModal";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { useProduct } from "@/pages/product/lib/product.hook";
import { useSuppliers } from "@/pages/supplier/lib/supplier.hook";

interface PurchaseOrderFormProps {
  defaultValues: Partial<PurchaseOrderSchema>;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "edit";
  warehouses: WarehouseResource[];
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
  warehouses,
  purchaseOrder,
}: PurchaseOrderFormProps) => {
  const [details, setDetails] = useState<DetailRow[]>(
    mode === "edit" && purchaseOrder
      ? purchaseOrder.details.map((d) => ({
          product_id: d.product_id.toString(),
          product_name: d.product_name,
          quantity_requested: d.quantity_requested.toString(),
          unit_price_estimated: d.unit_price_estimated,
          // En modo update: usar el subtotal calculado por el backend si existe
          subtotal: d.subtotal_estimated
            ? truncDecimal(parseFloat(d.subtotal_estimated), 2)
            : truncDecimal(
                d.quantity_requested * parseFloat(d.unit_price_estimated),
                2,
              ),
          subtotal_estimated: d.subtotal_estimated
            ? truncDecimal(parseFloat(d.subtotal_estimated), 2)
            : undefined,
        }))
      : [],
  );

  // Estados para modales
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [warehousesList, setWarehousesList] =
    useState<WarehouseResource[]>(warehouses);

  const [editingDetailIndex, setEditingDetailIndex] = useState<number | null>(
    null,
  );
  const [currentDetail, setCurrentDetail] = useState<DetailRow>({
    product_id: "",
    quantity_requested: "",
    unit_price_estimated: "",
    subtotal: 0,
  });

  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? purchaseOrderSchemaCreate : purchaseOrderSchemaUpdate,
    ),
    defaultValues: {
      ...defaultValues,
      observations: defaultValues.observations ?? "",
      details: details.length > 0 ? details : [],
      apply_igv: Boolean((defaultValues as any)?.apply_igv ?? false),
    },
    mode: "onChange",
  });

  // Tasa IGV referencial
  const IGV_RATE = 0.18;

  // Vigilar el switch de aplicar IGV para mostrar referencia en UI (no modifica payload)
  const applyIgv = form.watch("apply_igv") ?? false;

  // Obtener proveedor seleccionado
  const supplierWatch = form.watch("supplier_id");
  const { data: suppliersData } = useSuppliers();
  const selectedSupplier = supplierWatch
    ? suppliersData?.data?.find((s) => s.id.toString() === supplierWatch)
    : undefined;

  // Formulario separado para los campos temporales de detalle
  const detailTempForm = useForm({
    defaultValues: {
      temp_product_id: currentDetail.product_id,
      temp_quantity_requested: currentDetail.quantity_requested,
      temp_unit_price_estimated: currentDetail.unit_price_estimated,
    },
  });

  // Watch para los campos temporales de detalle
  const watchTempProductId = detailTempForm.watch("temp_product_id");
  const watchTempQuantity = detailTempForm.watch("temp_quantity_requested");
  const watchTempUnitPrice = detailTempForm.watch("temp_unit_price_estimated");

  useEffect(() => {
    setWarehousesList(warehouses);
  }, [warehouses]);

  const handleWarehouseCreated = (newWarehouse: WarehouseResource) => {
    setWarehousesList((prev) => [...prev, newWarehouse]);
    form.setValue("warehouse_id", newWarehouse.id.toString(), {
      shouldValidate: true,
    });
  };

  const handleSupplierCreated = (newSupplier: PersonResource) => {
    form.setValue("supplier_id", newSupplier.id.toString(), {
      shouldValidate: true,
    });
  };

  // Sincronizar los campos temporales con currentDetail
  useEffect(() => {
    if (watchTempProductId !== currentDetail.product_id) {
      setCurrentDetail((prev) => ({
        ...prev,
        product_id: watchTempProductId || "",
      }));
    }
  }, [watchTempProductId, currentDetail.product_id]);

  useEffect(() => {
    if (watchTempQuantity !== currentDetail.quantity_requested) {
      setCurrentDetail((prev) => ({
        ...prev,
        quantity_requested: watchTempQuantity || "",
      }));
    }
  }, [watchTempQuantity, currentDetail.quantity_requested]);

  useEffect(() => {
    if (watchTempUnitPrice !== currentDetail.unit_price_estimated) {
      setCurrentDetail((prev) => ({
        ...prev,
        unit_price_estimated: watchTempUnitPrice || "",
      }));
    }
  }, [watchTempUnitPrice, currentDetail.unit_price_estimated]);

  const [selectedProduct, setSelectedProduct] = useState<
    ProductResource | undefined
  >(undefined);

  const handleAddDetail = () => {
    if (
      !currentDetail.product_id ||
      !currentDetail.quantity_requested ||
      !currentDetail.unit_price_estimated
    ) {
      return;
    }

    const quantity = parseFloat(currentDetail.quantity_requested);
    const unitPrice = parseFloat(currentDetail.unit_price_estimated);
    const subtotal = truncDecimal(quantity * unitPrice, 2);

    const newDetail: DetailRow = {
      ...currentDetail,
      product_name: selectedProduct?.name,
      subtotal,
    };

    if (editingDetailIndex !== null) {
      const updatedDetails = [...details];
      updatedDetails[editingDetailIndex] = newDetail;
      setDetails(updatedDetails);
      form.setValue("details", updatedDetails);
      setEditingDetailIndex(null);
    } else {
      const updatedDetails = [...details, newDetail];
      setDetails(updatedDetails);
      form.setValue("details", updatedDetails);
    }

    // Limpiar formulario y estado
    setCurrentDetail({
      product_id: "",
      quantity_requested: "",
      unit_price_estimated: "",
      subtotal: 0,
    });
    detailTempForm.reset({
      temp_product_id: "",
      temp_quantity_requested: "",
      temp_unit_price_estimated: "",
    });
  };

  const handleEditDetail = (index: number) => {
    const detail = details[index];
    setCurrentDetail(detail);
    setEditingDetailIndex(index);
    detailTempForm.setValue("temp_product_id", detail.product_id);
    detailTempForm.setValue(
      "temp_quantity_requested",
      detail.quantity_requested,
    );
    detailTempForm.setValue(
      "temp_unit_price_estimated",
      detail.unit_price_estimated,
    );
  };

  const handleRemoveDetail = (index: number) => {
    const updatedDetails = details.filter((_, i) => i !== index);
    setDetails(updatedDetails);
    form.setValue("details", updatedDetails);
  };

  // Calcular total desde los detalles actuales
  const calculateTotal = () => {
    const sum = details.reduce((sum, detail) => sum + detail.subtotal, 0);
    return truncDecimal(sum, 2);
  };

  // Calcular total desde los detalles actuales
  const subtotalBase = calculateTotal();

  // Calcular IGV y total con IGV (siempre desde subtotales en modo create)
  const igvAmount = truncDecimal(subtotalBase * IGV_RATE, 2);
  const totalWithIgv = truncDecimal(subtotalBase + igvAmount, 2);

  const handleFormSubmit = (data: any) => {
    if (isSubmitting) return; // Prevenir múltiples envíos

    // Transformar detalles a los tipos que espera el backend y calcular subtotales y total
    const transformedDetails = details.map((d) => {
      const qty = Number(d.quantity_requested);
      const price = Number(d.unit_price_estimated);
      const subtotal = truncDecimal(qty * price, 2);
      return {
        product_id: Number(d.product_id),
        quantity_requested: qty,
        unit_price_estimated: truncDecimal(price, 2),
        subtotal_estimated: subtotal,
      };
    });

    const totalEstimated = truncDecimal(
      transformedDetails.reduce((s, it) => s + it.subtotal_estimated, 0),
      2,
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
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Columna izquierda: Formulario (2 cols) */}
          <div className="md:col-span-2 space-y-6">
            {/* Información General */}
            <GroupFormSection
              title="Información General"
              icon={FileText}
              cols={{ sm: 1, md: 2 }}
            >
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <FormSelectAsync
                    control={form.control}
                    name="supplier_id"
                    label="Proveedor"
                    placeholder="Seleccione un proveedor"
                    useQueryHook={useSuppliers}
                    mapOptionFn={(p: PersonResource) => ({
                      value: p.id.toString(),
                      label:
                        p.business_name ?? `${p.names} ${p.father_surname}`,
                      description: p.number_document,
                    })}
                    disabled={mode === "edit"}
                  />
                </div>
                {mode === "create" && (
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => setIsSupplierModalOpen(true)}
                    className="flex-shrink-0"
                    title="Crear nuevo proveedor"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <FormSelect
                    control={form.control}
                    name="warehouse_id"
                    label="Almacén"
                    placeholder="Seleccione un almacén"
                    options={warehousesList.map((warehouse) => ({
                      value: warehouse.id.toString(),
                      label: warehouse.name,
                    }))}
                    disabled={mode === "edit"}
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
                text="Aplicar IGV (18%)"
                textDescription="¿Aplicar IGV a esta orden de compra?"
                autoHeight
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
                          value={field.value ?? ""}
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
              title="Detalles de la Orden"
              icon={ListCheck}
              cols={{ sm: 1 }}
            >
              {/* Formulario de agregar/editar en una fila */}
              <div className="grid grid-cols-12 gap-2 p-3 bg-muted/30 rounded-lg items-end">
                <div className="col-span-6">
                  <FormSelectAsync
                    control={detailTempForm.control}
                    name="temp_product_id"
                    label="Producto"
                    placeholder="Seleccione"
                    useQueryHook={useProduct}
                    mapOptionFn={(product: ProductResource) => ({
                      value: product.id.toString(),
                      label: product.name,
                    })}
                    onValueChange={(_value, item) => {
                      setSelectedProduct(item);
                    }}
                  />
                </div>

                <div className="col-span-2">
                  <FormInput
                    control={detailTempForm.control}
                    name="temp_quantity_requested"
                    label="Cantidad"
                    type="number"
                    placeholder="0"
                    className="h-9"
                  />
                </div>

                <div className="col-span-2">
                  <FormInput
                    control={detailTempForm.control}
                    name="temp_unit_price_estimated"
                    label="P. Unit."
                    type="number"
                    step="0.000001"
                    placeholder="0.000000"
                    className="h-9"
                  />
                </div>

                <div className="col-span-2 flex gap-1">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddDetail}
                    disabled={
                      !currentDetail.product_id ||
                      !currentDetail.quantity_requested ||
                      !currentDetail.unit_price_estimated
                    }
                    className="h-9 flex-1 px-2"
                  >
                    {editingDetailIndex !== null ? (
                      <>
                        <Pencil className="h-3 w-3 mr-1" />
                        <span className="text-xs">Actualizar</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-3 w-3 mr-1" />
                        <span className="text-xs">Agregar</span>
                      </>
                    )}
                  </Button>
                  {editingDetailIndex !== null && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingDetailIndex(null);
                        setCurrentDetail({
                          product_id: "",
                          quantity_requested: "",
                          unit_price_estimated: "",
                          subtotal: 0,
                        });
                        detailTempForm.reset({
                          temp_product_id: "",
                          temp_quantity_requested: "",
                          temp_unit_price_estimated: "",
                        });
                      }}
                      className="h-9 px-2"
                    >
                      <span className="text-xs">X</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Tabla de detalles */}
              {details.length > 0 ? (
                <div className="border rounded-lg overflow-hidden mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead className="text-right">P. Unit.</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                        <TableHead className="w-16"></TableHead>
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
                            {formatCurrency(
                              parseFloat(detail.unit_price_estimated),
                              { currencySymbol: "S/.", decimals: 2 },
                            )}
                          </TableCell>
                          <TableCell className="text-right font-bold text-primary">
                            {formatCurrency(detail.subtotal, {
                              currencySymbol: "S/.",
                              decimals: 2,
                            })}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditDetail(index)}
                                className="h-7 w-7"
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveDetail(index)}
                                className="h-7 w-7"
                              >
                                <Trash2 className="h-3 w-3 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <EmptyState
                  title="No hay detalles agregados"
                  description="Complete el formulario arriba para agregar productos"
                  icon={ShoppingCart}
                />
              )}
            </GroupFormSection>
          </div>

          {/* Columna derecha: Resumen - sticky */}
          <PurchaseOrderSummary
            form={form}
            mode={mode}
            isSubmitting={isSubmitting}
            warehouses={warehouses}
            details={details}
            subtotalBase={subtotalBase}
            igvAmount={igvAmount}
            totalWithIgv={totalWithIgv}
            applyIgv={applyIgv}
            selectedSupplier={selectedSupplier}
            onCancel={onCancel}
          />
        </div>
      </form>

      {/* <pre>
        <code>{JSON.stringify(form.getValues(), null, 2)}</code>
        <code>{JSON.stringify(form.formState.errors, null, 2)}</code>
      </pre> */}

      {/* Modal para crear nuevo proveedor */}
      <SupplierCreateModal
        open={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        onSupplierCreated={handleSupplierCreated}
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
