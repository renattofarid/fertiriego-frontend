"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import type { ColumnDef } from "@tanstack/react-table";
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
import { Badge } from "@/components/ui/badge";
import { Loader, Plus, Trash2, Pencil, Truck } from "lucide-react";
import { FormSelect } from "@/components/FormSelect";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { GroupFormSection } from "@/components/GroupFormSection";
import { guideSchema, type GuideSchema } from "../lib/guide.schema";
import type { UbigeoResource } from "../lib/ubigeo.interface";
import { type GuideMotiveResource, MODALITIES } from "../lib/guide.interface";
import type { WarehouseResource } from "@/pages/warehouse/lib/warehouse.interface";
import type { SaleResource } from "@/pages/sale/lib/sale.interface";
import type { PurchaseResource } from "@/pages/purchase/lib/purchase.interface";
import type { WarehouseDocumentResource } from "@/pages/warehouse-document/lib/warehouse-document.interface";
import type { OrderResource } from "@/pages/order/lib/order.interface";
import { format } from "date-fns";
import { SearchableSelect } from "@/components/SearchableSelect";
import { DataTable } from "@/components/DataTable";
import { getPendingOrderDetails } from "@/pages/order/lib/order.actions";
import { errorToast } from "@/lib/core.function";
import { SearchableSelectAsync } from "@/components/SearchableSelectAsync";
import { useProduct } from "@/pages/product/lib/product.hook";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { useClients } from "@/pages/client/lib/client.hook";
import { useCarriers } from "@/pages/carrier/lib/carrier.hook";
import { useDrivers } from "@/pages/driver/lib/driver.hook";
import { useVehicles } from "@/pages/vehicle/lib/vehicle.hook";
import { useSuppliers } from "@/pages/supplier/lib/supplier.hook";
import { useUbigeosFrom, useUbigeosTo } from "../lib/ubigeo.hook";
import { usePurchases } from "@/pages/purchase/lib/purchase.hook";
import { useOrder } from "@/pages/order/lib/order.hook";
import { useSale } from "@/pages/sale/lib/sale.hook";
import { useWarehouseDocuments } from "@/pages/warehouse-document/lib/warehouse-document.hook";
import { useRemittents } from "@/pages/person/lib/person.hook";
import { findSaleById } from "@/pages/sale/lib/sale.actions";

interface GuideFormProps {
  defaultValues: Partial<GuideSchema>;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "edit";
  warehouses: WarehouseResource[];
  motives: GuideMotiveResource[];
}

interface DetailRow {
  index: string;
  product_id: number;
  product_name?: string;
  description: string;
  quantity: string;
  unit_measure: string;
  weight: string;
}

const createDetailColumns = (
  onEdit: (index: number) => void,
  onDelete: (index: number) => void,
): ColumnDef<DetailRow>[] => [
  {
    accessorKey: "product_id",
    header: "Producto",
    cell: ({ row }) => {
      return (
        <span className="text-sm">
          {row.original.product_name || row.original.description || "N/A"}
        </span>
      );
    },
  },
  {
    accessorKey: "product_id",
    header: "Producto",
    cell: ({ row }) => {
      return (
        <span className="text-sm">
          {row.original.product_name || row.original.description || "N/A"}
        </span>
      );
    },
  },
  {
    accessorKey: "quantity",
    header: "Cantidad",
    cell: ({ getValue }) => (
      <span className="text-sm text-center block">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "unit_measure",
    header: "Unidad",
    cell: ({ getValue }) => (
      <span className="text-sm text-center block">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "weight",
    header: "Peso",
    cell: ({ getValue }) => (
      <span className="text-sm text-center block">{getValue() as string}</span>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row, table }) => {
      const index = table.getRowModel().rows.findIndex((r) => r.id === row.id);
      return (
        <div className="flex justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onEdit(index)}
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onDelete(index)}
          >
            <Trash2 className="h-3 w-3 text-red-500" />
          </Button>
        </div>
      );
    },
  },
];

const UNIT_MEASUREMENTS = [
  { value: "KGM", label: "Kilogramos (KGM)" },
  { value: "TNE", label: "Toneladas (TNE)" },
  { value: "GRM", label: "Gramos (GRM)" },
  { value: "UND", label: "Unidades (UND)" },
];

export const GuideForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  warehouses,
  motives,
}: GuideFormProps) => {
  const [details, setDetails] = useState<DetailRow[]>([]);
  const [editingDetailIndex, setEditingDetailIndex] = useState<number | null>(
    null,
  );
  const [currentDetail, setCurrentDetail] = useState<DetailRow>({
    index: "",
    product_id: 0,
    description: "",
    quantity: "",
    unit_measure: "UND",
    weight: "",
  });

  // Estado para pedido seleccionado
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [hasNoPendingDetails, setHasNoPendingDetails] = useState(false);

  const form = useForm({
    resolver: zodResolver(guideSchema) as any,
    defaultValues: {
      ...defaultValues,
      transport_modality: defaultValues.transport_modality || "PRIVADO",
    },
    mode: "onChange",
  });

  const transportModality = form.watch("transport_modality");
  const orderId = form.watch("order_id");
  const saleId = form.watch("sale_id");

  // Cargar orden cuando se selecciona y llenar detalles automáticamente con los pendientes
  useEffect(() => {
    const loadOrder = async () => {
      if (orderId && orderId !== "") {
        setLoadingOrder(true);
        setHasNoPendingDetails(false);
        try {
          const response = await getPendingOrderDetails(Number(orderId));

          // Llenar automáticamente los detalles con los productos pendientes del pedido
          if (response.data && response.data.pending_details) {
            // Verificar si hay detalles pendientes
            if (response.data.pending_details.length === 0) {
              setHasNoPendingDetails(true);
              setDetails([]);
            } else {
              setHasNoPendingDetails(false);
              const orderDetails: DetailRow[] =
                response.data.pending_details.map((detail, index) => ({
                  index: index.toString(),
                  product_id: detail.product_id,
                  product_name: detail.product_name,
                  description: detail.product_name,
                  quantity: detail.quantity_pending.toString(),
                  unit_measure: "UND",
                  weight: "0",
                }));
              setDetails(orderDetails);
            }

            // Si el pedido tiene driver_id en el objeto order, establecerlo
            const orderData = response.data.order as any;
            if (orderData.driver_id) {
              form.setValue("driver_id", orderData.driver_id.toString());
            }

            // Setear el recipient_id con el customer_id del pedido
            if (response.data.order?.customer?.id) {
              form.setValue("recipient_id", response.data.order.customer.id.toString());
            }
          }
        } catch (error) {
          console.error("Error loading order pending details:", error);
          setHasNoPendingDetails(false);
        } finally {
          setLoadingOrder(false);
        }
      } else {
        // Si se deselecciona el pedido, limpiar los detalles
        setHasNoPendingDetails(false);
        if (mode === "create") {
          setDetails([]);
        }
      }
    };

    loadOrder();
  }, [orderId, mode]);

  // Cargar venta cuando se selecciona y setear el recipient_id
  useEffect(() => {
    const loadSale = async () => {
      if (saleId && saleId !== "") {
        try {
          const response = await findSaleById(Number(saleId));

          // Setear el recipient_id con el customer_id de la venta
          if (response.data?.customer_id) {
            form.setValue("recipient_id", response.data.customer_id.toString());
          }
        } catch (error) {
          console.error("Error loading sale:", error);
        }
      }
    };

    loadSale();
  }, [saleId, form]);

  // Establecer fechas automáticamente
  useEffect(() => {
    const today = new Date();
    const formattedDate = format(today, "yyyy-MM-dd");
    if (!form.getValues("issue_date")) {
      form.setValue("issue_date", formattedDate);
    }
    if (!form.getValues("transfer_date")) {
      form.setValue("transfer_date", formattedDate);
    }
  }, [form]);

  // Establecer almacén por defecto si solo hay uno
  useEffect(() => {
    if (
      warehouses.length === 1 &&
      !form.getValues("warehouse_id") &&
      mode === "create"
    ) {
      form.setValue("warehouse_id", warehouses[0].id.toString());
    }
  }, [warehouses, mode, form]);

  // Cargar detalles existentes en modo edición
  useEffect(() => {
    if (mode === "edit" && defaultValues.details) {
      const formattedDetails = defaultValues.details.map(
        (detail: any, index: number) => ({
          index: index.toString(),
          product_id: detail.product_id || 0,
          product_name: detail.description || "",
          description: detail.description || "",
          quantity: detail.quantity?.toString() || "",
          unit_measure: detail.unit_measure || "UND",
          weight: detail.weight?.toString() || "",
        }),
      );
      setDetails(formattedDetails);
    }
  }, []);

  // Sincronizar details con el form cuando cambien
  useEffect(() => {
    if (details.length > 0) {
      const formatted = details.map((detail) => ({
        product_id: detail.product_id.toString(),
        description: detail.description || detail.product_name || "",
        quantity: Number(detail.quantity),
        unit_measure: detail.unit_measure,
        weight: Number(detail.weight || 0),
      }));

      // Solo actualizar si realmente hay cambios
      const currentFormDetails = form.getValues("details") || [];
      if (JSON.stringify(currentFormDetails) !== JSON.stringify(formatted)) {
        form.setValue("details", formatted as any, { shouldValidate: false });
      }
    } else {
      // Si no hay details, limpiar el form
      form.setValue("details", [], { shouldValidate: false });
    }
  }, [details, form]);

  const handleAddDetail = () => {
    if (!currentDetail.product_id || !currentDetail.quantity) {
      errorToast("Seleccione producto y cantidad");
      return;
    }

    const detailToSave: DetailRow = {
      ...currentDetail,
      description:
        currentDetail.description || currentDetail.product_name || "",
    };

    if (editingDetailIndex !== null) {
      const updatedDetails = [...details];
      updatedDetails[editingDetailIndex] = detailToSave;
      setDetails(updatedDetails);
      setEditingDetailIndex(null);
    } else {
      setDetails([...details, detailToSave]);
    }

    setCurrentDetail({
      index: "",
      product_id: 0,
      description: "",
      quantity: "",
      unit_measure: "UND",
      weight: "",
    });
  };

  const handleEditDetail = (index: number) => {
    setCurrentDetail(details[index]);
    setEditingDetailIndex(index);
  };

  const handleDeleteDetail = (index: number) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  const handleFormSubmit = (data: any) => {
    const hasCurrentDetail =
      currentDetail.product_id && currentDetail.quantity?.trim() !== "";
    const effectiveDetails =
      details.length > 0 ? details : hasCurrentDetail ? [currentDetail] : [];

    if (effectiveDetails.length === 0) {
      alert("Debe agregar al menos un detalle");
      return;
    }

    const formattedDetails = effectiveDetails.map((detail) => ({
      product_id: Number(detail.product_id),
      description: detail.description,
      quantity: Number(detail.quantity),
      unit_measure: detail.unit_measure,
      weight: Number(detail.weight || 0),
    }));

    const payload: GuideSchema = {
      ...data,
      details: formattedDetails,
    };

    console.log("✅ Payload siendo enviado:", payload);
    console.log("✅ Details state:", details);
    console.log("✅ Form details value:", form.getValues("details"));
    onSubmit(payload);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6 w-full grid grid-cols-1 md:grid-cols-2 gap-x-4"
      >
        {/* Información General */}
        <GroupFormSection
          title="Información General"
          icon={Truck}
          cols={{ sm: 1, md: 2, lg: 3 }}
          gap="gap-3"
          className=""
        >
          <FormSelect
            control={form.control}
            name="warehouse_id"
            label="Almacén"
            placeholder="Seleccione un almacén"
            options={warehouses.map((warehouse) => ({
              value: warehouse.id.toString(),
              label: warehouse.name,
              description: warehouse.address,
            }))}
          />

          <FormSelect
            control={form.control}
            name="motive_id"
            label="Motivo de Traslado"
            placeholder="Seleccione un motivo"
            options={motives.map((motive) => ({
              value: motive.id.toString(),
              label: motive.name,
              description: motive.code,
            }))}
            withValue
          />

          <FormSelect
            control={form.control}
            name="transport_modality"
            label="Modalidad de Transporte"
            placeholder="Seleccione modalidad"
            options={MODALITIES.map((mod) => ({
              value: mod.value,
              label: mod.label,
            }))}
          />

          <DatePickerFormField
            control={form.control}
            name="issue_date"
            label="Fecha de Emisión"
          />

          <DatePickerFormField
            control={form.control}
            name="transfer_date"
            label="Fecha de Traslado"
          />

          <div className="relative">
            <FormSelectAsync
              control={form.control}
              name="order_id"
              label="Pedido"
              placeholder="Seleccione un pedido"
              useQueryHook={useOrder}
              mapOptionFn={(order: OrderResource) => ({
                value: order.id.toString(),
                label: `#${order.order_number} - ${order.customer.full_name}`,
                description: `Fecha: ${order.order_date}`,
              })}
              withValue
            />
            {loadingOrder && (
              <div className="absolute right-2 top-9">
                <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
            {hasNoPendingDetails && orderId && (
              <Badge variant="amber-outline">Sin productos pendientes</Badge>
            )}
          </div>
          <FormSelectAsync
            control={form.control}
            name="sale_id"
            label="Venta"
            placeholder="Selecciona una venta"
            useQueryHook={useSale}
            mapOptionFn={(sale: SaleResource) => ({
              value: sale.id.toString(),
              label: sale.full_document_number || `Venta #${sale.id}`,
              description: sale.customer.full_name,
            })}
            withValue
          />

          <FormSelectAsync
            control={form.control}
            name="purchase_id"
            label="Compra"
            placeholder="Selecciona una compra"
            useQueryHook={usePurchases}
            mapOptionFn={(purchase: PurchaseResource) => ({
              value: purchase.id.toString(),
              label: purchase.document_number || `Compra #${purchase.id}`,
              description: purchase.supplier_fullname,
            })}
            withValue
          />

          <FormSelectAsync
            control={form.control}
            name="warehouse_document_id"
            label="Documento Almacén"
            placeholder="Selecciona un documento"
            useQueryHook={useWarehouseDocuments}
            mapOptionFn={(warehouseDocument: WarehouseDocumentResource) => ({
              value: warehouseDocument.id.toString(),
              label: `${warehouseDocument.document_type} - ${warehouseDocument.document_number}`,
              description: warehouseDocument.warehouse_name,
            })}
            withValue
          />

          <FormSelect
            control={form.control}
            name="destination_warehouse_id"
            label="Almacén Destino"
            placeholder="Selecciona un almacén"
            options={warehouses.map((warehouse) => ({
              value: warehouse.id.toString(),
              label: warehouse.name,
              description: warehouse.address,
            }))}
          />

          <FormSelectAsync
            control={form.control}
            name="recipient_id"
            label="Destinatario"
            placeholder="Selecciona un destinatario"
            useQueryHook={useClients}
            mapOptionFn={(client) => ({
              value: client.id.toString(),
              label:
                client.business_name ||
                `${client.names} ${client.father_surname} ${client.mother_surname}`.trim(),
              description: client.business_name
                ? ""
                : `${client.names} ${client.father_surname} ${client.mother_surname}`.trim(),
            })}
            withValue
          />

          <FormSelectAsync
            control={form.control}
            name="remittent_id"
            label="Remitente"
            placeholder="Selecciona un remitente"
            useQueryHook={useRemittents}
            mapOptionFn={(remmitent) => ({
              value: remmitent.id.toString(),
              label:
                remmitent.business_name ||
                `${remmitent.names} ${remmitent.father_surname} ${remmitent.mother_surname}`.trim(),
              description: remmitent.business_name
                ? ""
                : `${remmitent.names} ${remmitent.father_surname} ${remmitent.mother_surname}`.trim(),
            })}
            preloadItemId={form.getValues("remittent_id") || undefined}
            withValue
          />

          <FormField
            control={form.control}
            name="observations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observaciones</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Observaciones"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </GroupFormSection>

        {/* Transporte y Direcciones */}
        <GroupFormSection
          title="Transporte y Direcciones"
          icon={Truck}
          cols={{ sm: 1, md: 2 }}
          gap="gap-3"
        >
          <FormSelectAsync
            control={form.control}
            name="carrier_id"
            label="Transportista"
            placeholder="Seleccione un transportista"
            useQueryHook={useCarriers}
            mapOptionFn={(carrier) => ({
              value: carrier.id.toString(),
              label:
                carrier.business_name ||
                `${carrier.names} ${carrier.father_surname} ${carrier.mother_surname}`.trim(),
            })}
          />

          <FormSelectAsync
            control={form.control}
            name="dispatcher_id"
            label="Despachador (Opcional)"
            placeholder="Seleccione un despachador"
            useQueryHook={useSuppliers}
            mapOptionFn={(supplier) => ({
              value: supplier.id.toString(),
              label:
                supplier.business_name ||
                `${supplier.names} ${supplier.father_surname} ${supplier.mother_surname}`.trim(),
            })}
          />

          {transportModality === "PRIVADO" && (
            <>
              <FormSelectAsync
                control={form.control}
                name="driver_id"
                label="Conductor"
                placeholder="Seleccione un conductor"
                useQueryHook={useDrivers}
                mapOptionFn={(driver) => ({
                  value: driver.id.toString(),
                  label:
                    driver.business_name ||
                    `${driver.names} ${driver.father_surname} ${driver.mother_surname}`.trim(),
                })}
              />

              <FormSelectAsync
                control={form.control}
                name="vehicle_id"
                label="Vehículo"
                placeholder="Seleccione un vehículo"
                useQueryHook={useVehicles}
                mapOptionFn={(vehicle) => ({
                  value: vehicle.id.toString(),
                  label: vehicle.plate,
                  description: `${vehicle.brand} ${vehicle.model}`,
                })}
              />

              <FormField
                control={form.control}
                name="driver_license"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Licencia del Conductor</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: B12345678"
                        {...field}
                        value={field.value || ""}
                        maxLength={20}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormSelectAsync
                control={form.control}
                name="secondary_vehicle_id"
                label="Vehículo Secundario (Opcional)"
                placeholder="Seleccione un vehículo secundario"
                useQueryHook={useVehicles}
                mapOptionFn={(vehicle) => ({
                  value: vehicle.id.toString(),
                  label: vehicle.plate,
                  description: `${vehicle.brand} ${vehicle.model}`,
                })}
              />

              <FormField
                control={form.control}
                name="vehicle_plate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placa del Vehículo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: ABC-123"
                        {...field}
                        value={field.value || ""}
                        maxLength={20}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vehicle_brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca del Vehículo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Toyota"
                        {...field}
                        value={field.value || ""}
                        maxLength={100}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vehicle_model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo del Vehículo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Hilux"
                        {...field}
                        value={field.value || ""}
                        maxLength={100}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vehicle_mtc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certificado MTC</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: MTC123456"
                        {...field}
                        value={field.value || ""}
                        maxLength={50}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <FormSelectAsync
            control={form.control}
            name="origin_ubigeo_id"
            label="Ubigeo de Origen"
            placeholder="Buscar ubigeo..."
            useQueryHook={useUbigeosFrom}
            mapOptionFn={(item: UbigeoResource) => ({
              value: item.id.toString(),
              label: item.name,
              description: item.cadena,
            })}
          />

          <FormSelectAsync
            control={form.control}
            name="destination_ubigeo_id"
            label="Ubigeo de Destino"
            placeholder="Buscar ubigeo..."
            useQueryHook={useUbigeosTo}
            mapOptionFn={(item: UbigeoResource) => ({
              value: item.id.toString(),
              label: item.name,
              description: item.cadena,
            })}
          />

          <FormField
            control={form.control}
            name="origin_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección de Origen</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ingrese la dirección de origen"
                    {...field}
                    value={field.value || ""}
                    maxLength={500}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="destination_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección de Destino</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ingrese la dirección de destino"
                    {...field}
                    value={field.value || ""}
                    maxLength={500}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </GroupFormSection>

        {/* Detalles de Productos */}
        <GroupFormSection
          title="Detalles de Productos"
          icon={Truck}
          cols={{ sm: 1, md: 3 }}
          className="col-span-full"
        >
          <FormField
            control={form.control}
            name="details"
            render={() => (
              <FormItem className="col-span-full">
                <div className="space-y-4">
                  {/* Formulario para agregar detalles */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-6 p-4 rounded-lg">
                    <SearchableSelectAsync
                      label="Producto"
                      useQueryHook={useProduct}
                      mapOptionFn={(product) => ({
                        value: product.id.toString(),
                        label: product.name,
                        description: product.brand_name,
                      })}
                      withValue
                      value={currentDetail.product_id.toString()}
                      onChange={(value) => {
                        setCurrentDetail({
                          ...currentDetail,
                          product_id: Number(value),
                        });
                      }}
                      onValueChange={(value, item) => {
                        setCurrentDetail({
                          ...currentDetail,
                          product_id: Number(value),
                          product_name: item?.name || "",
                          description: item?.name || "",
                        });
                      }}
                      placeholder="Selecciona un producto"
                      classNameDiv="md:col-span-2"
                      buttonSize="default"
                    />

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Cantidad
                      </label>
                      <Input
                        type="number"
                        placeholder="Cantidad"
                        value={currentDetail.quantity}
                        onChange={(e) =>
                          setCurrentDetail({
                            ...currentDetail,
                            quantity: e.target.value,
                          })
                        }
                      />
                    </div>

                    <SearchableSelect
                      label="Unidad"
                      options={UNIT_MEASUREMENTS.map((unit) => ({
                        value: unit.value,
                        label: unit.label,
                      }))}
                      value={currentDetail.unit_measure}
                      onChange={(value) =>
                        setCurrentDetail({
                          ...currentDetail,
                          unit_measure: value,
                        })
                      }
                      buttonSize="default"
                      placeholder="Selecciona unidad"
                    />

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Peso
                      </label>
                      <Input
                        type="number"
                        placeholder="Peso"
                        value={currentDetail.weight}
                        onChange={(e) =>
                          setCurrentDetail({
                            ...currentDetail,
                            weight: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        type="button"
                        onClick={handleAddDetail}
                        size="sm"
                        className="w-full"
                        disabled={
                          !currentDetail.product_id || !currentDetail.quantity
                        }
                      >
                        {editingDetailIndex !== null ? (
                          <>
                            <Pencil className="mr-2 h-4 w-4" />
                            Actualizar
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Agregar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Tabla de detalles */}
                  {details.length > 0 && (
                    <DataTable
                      columns={createDetailColumns(
                        handleEditDetail,
                        handleDeleteDetail,
                      )}
                      data={details}
                      isLoading={false}
                      variant="ghost"
                    />
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </GroupFormSection>

        {/* <pre>
          <code>
            {JSON.stringify(form.formState.errors, null, 2)}
          </code>
        </pre> */}

        {/* Botones de Acción */}
        <div className="flex justify-end gap-4 col-span-full">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "Crear Guía" : "Actualizar Guía"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
