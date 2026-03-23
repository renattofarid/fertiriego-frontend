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
import { roundTo4, roundTo8 } from "@/lib/saleCalculations";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Package, Plus, RefreshCw, Trash2, Pencil } from "lucide-react";
import { FormSelect } from "@/components/FormSelect";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import type { WarehouseResource } from "@/pages/warehouse/lib/warehouse.interface";
import type { QuotationResource } from "@/pages/quotation/lib/quotation.interface";
import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/config";
import { FormInput } from "@/components/FormInput";
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
import { OrderSummary } from "./OrderSummary";
import { ClientCreateModal } from "@/pages/client/components/ClientCreateModal";
import { WarehouseCreateModal } from "@/pages/warehouse/components/WarehouseCreateModal";
import { useClients } from "@/pages/client/lib/client.hook";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { useQuotations } from "@/pages/quotation/lib/quotation.hook";

interface OrderFormProps {
  onSubmit: (data: CreateOrderRequest) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  warehouses: WarehouseResource[];
  defaultValues?: any;
  mode?: "create" | "edit";
  order?: any;
}

interface DetailRow {
  product_id: string;
  product_name?: string;
  is_igv: boolean;
  quantity: string;
  unit_price: string;
  unit_price_igv: string;
  purchase_price: string;
  subtotal: number;
  tax: number;
  total: number;
}

export const OrderForm = ({
  onCancel,
  onSubmit,
  isSubmitting = false,
  warehouses,
  defaultValues,
  mode = "create",
  order,
}: OrderFormProps) => {
  const { user } = useAuthStore();
  const [details, setDetails] = useState<DetailRow[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingDetail, setEditingDetail] = useState<ProductDetail | null>(
    null,
  );
  const [editingIndex, setEditingIndex] = useState<number | undefined>(
    undefined,
  );
  // Estados para modales
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [customersList, setCustomersList] = useState<PersonResource[]>([]);
  const [warehousesList, setWarehousesList] =
    useState<WarehouseResource[]>(warehouses);
  const [defaultCustomerOption, setDefaultCustomerOption] = useState<
    { value: string; label: string } | undefined
  >(undefined);
  const [preloadCustomerId, setPreloadCustomerId] = useState<
    string | undefined
  >(undefined);

  const form = useForm<any>({
    defaultValues: defaultValues || {
      order_date: new Date().toISOString().split("T")[0],
      order_expiry_date: new Date(
        new Date().setMonth(new Date().getMonth() + 1),
      )
        .toISOString()
        .split("T")[0],
      order_delivery_date: new Date(
        new Date().setMonth(new Date().getMonth() + 1),
      )
        .toISOString()
        .split("T")[0],
      currency: "PEN",
      address: "",
      warehouse_id: "",
      observations: "",
      status: "Pendiente",
      quotation_id: "",
      customer_id: "",
      tipo_cambio: "",
    },
  });

  const watchedOrderDate = form.watch("order_date");
  const [tipoCambioError, setTipoCambioError] = useState<string>("");
  const tipoCambioCache = useRef<Record<string, string>>({});
  const tipoCambioFetching = useRef<Set<string>>(new Set());

  const fetchTipoCambio = useCallback(
    async (fecha: string, force = false) => {
      if (!fecha) return;

      if (!force && tipoCambioCache.current[fecha]) {
        setTipoCambioError("");
        form.setValue("tipo_cambio", tipoCambioCache.current[fecha]);
        return;
      }

      if (tipoCambioFetching.current.has(fecha)) return;

      tipoCambioFetching.current.add(fecha);
      setTipoCambioError("");
      try {
        const { data } = await api.get(`tipo-cambio-sunat?fecha=${fecha}`);
        const valorStr = (data?.venta || data?.compra || "").toString();
        tipoCambioCache.current[fecha] = valorStr;
        form.setValue("tipo_cambio", valorStr);
      } catch {
        setTipoCambioError("No se pudo obtener el tipo de cambio SUNAT.");
        form.setValue("tipo_cambio", "");
      } finally {
        tipoCambioFetching.current.delete(fecha);
      }
    },
    [form],
  );

  useEffect(() => {
    if (watchedOrderDate) {
      if (mode === "edit" && order?.tipo_cambio) return;
      fetchTipoCambio(watchedOrderDate);
    } else {
      setTipoCambioError("");
      form.setValue("tipo_cambio", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedOrderDate]);

  // Actualizar listas cuando cambien las props
  useEffect(() => {
    setWarehousesList(warehouses);
  }, [warehouses]);

  // Handlers para modales
  const handleClientCreated = (newClient: PersonResource) => {
    setCustomersList((prev) => [...prev, newClient]);
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

  // Load order details when in edit mode
  useEffect(() => {
    if (mode === "edit" && order && order.order_details) {
      const orderDetails: DetailRow[] = order.order_details.map(
        (detail: any) => ({
          product_id: detail.product_id.toString(),
          product_name: detail.product?.name || "Producto",
          is_igv: detail.is_igv,
          quantity: detail.quantity,
          unit_price: detail.unit_price,
          unit_price_igv: detail.unit_price_igv,
          purchase_price: detail.purchase_price,
          subtotal: parseFloat(detail.subtotal),
          tax: parseFloat(detail.tax),
          total: parseFloat(detail.total),
        }),
      );
      setDetails(orderDetails);

      // Setear quotation_id si existe en el pedido
      if (order.quotation_id) {
        form.setValue("quotation_id", order.quotation_id.toString());
      }

      if (order.tipo_cambio) {
        form.setValue("tipo_cambio", order.tipo_cambio.toString());
      }

      // Establecer defaultCustomerOption si existe el cliente en el pedido
      if (order.customer) {
        const customerLabel =
          order.customer.business_name ||
          order.customer.names +
            " " +
            (order.customer.father_surname || "") +
            " " +
            (order.customer.mother_surname || "");

        setDefaultCustomerOption({
          value: order.customer_id.toString(),
          label: customerLabel,
        });

        // Establecer el ID para precargar automáticamente
        setPreloadCustomerId(order.customer_id.toString());
      }
    }
  }, [mode, order, form]);

  const handleQuotationChange = (_value: string, quotation?: QuotationResource) => {
    if (!quotation) {
      setDefaultCustomerOption(undefined);
      setPreloadCustomerId(undefined);
      return;
    }

    const customerLabel =
      quotation.customer?.business_name ||
      quotation.customer?.names +
        " " +
        (quotation.customer?.father_surname || "") +
        " " +
        (quotation.customer?.mother_surname || "");

    setDefaultCustomerOption({
      value: quotation.customer_id.toString(),
      label: customerLabel,
    });
    setPreloadCustomerId(quotation.customer_id.toString());

    if (mode === "create") {
      form.setValue("customer_id", quotation.customer_id.toString());
      form.setValue("warehouse_id", quotation.warehouse_id.toString());
      form.setValue("currency", quotation.currency);
      form.setValue("address", quotation.address || "");
      if (quotation.tipo_cambio) {
        form.setValue("tipo_cambio", quotation.tipo_cambio.toString());
      }
      form.setValue("observations", quotation.observations || "");

      const quotationDetails: DetailRow[] =
        quotation.quotation_details.map((detail) => ({
          product_id: detail.product_id.toString(),
          product_name: detail.product.name,
          is_igv: detail.is_igv,
          quantity: detail.quantity,
          unit_price: detail.unit_price,
          unit_price_igv: detail.unit_price_igv,
          purchase_price: detail.purchase_price,
          subtotal: parseFloat(detail.subtotal),
          tax: parseFloat(detail.tax),
          total: parseFloat(detail.total),
        }));

      setDetails(quotationDetails);
    }
  };

  const handleAddDetail = (detail: ProductDetail) => {
    const newDetail: DetailRow = {
      product_id: detail.product_id,
      product_name: detail.product_name,
      is_igv: detail.is_igv,
      quantity: detail.quantity,
      unit_price: detail.unit_price,
      unit_price_igv: detail.unit_price_igv,
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

  const handleEditDetail = (index: number) => {
    const detail = details[index];
    const productDetail: ProductDetail = {
      product_id: detail.product_id,
      product_name: detail.product_name || "",
      is_igv: detail.is_igv,
      quantity: detail.quantity,
      unit_price: detail.unit_price,
      unit_price_igv: detail.unit_price_igv,
      purchase_price: detail.purchase_price,
      subtotal: detail.subtotal,
      tax: detail.tax,
      total: detail.total,
    };
    setEditingDetail(productDetail);
    setEditingIndex(index);
    setSheetOpen(true);
  };

  const handleUpdateDetail = (detail: ProductDetail, index: number) => {
    const newDetail: DetailRow = {
      product_id: detail.product_id,
      product_name: detail.product_name,
      is_igv: detail.is_igv,
      quantity: detail.quantity,
      unit_price: detail.unit_price,
      unit_price_igv: detail.unit_price_igv,
      purchase_price: detail.purchase_price,
      subtotal: detail.subtotal,
      tax: detail.tax,
      total: detail.total,
    };

    const updatedDetails = [...details];
    updatedDetails[index] = newDetail;
    setDetails(updatedDetails);
  };

  const handleCloseSheet = () => {
    setSheetOpen(false);
    setEditingDetail(null);
    setEditingIndex(undefined);
  };

  const handleSubmitForm = (formData: any) => {
    if (details.length === 0) {
      return;
    }

    const hasInvalidPrice = details.some((d) => {
      const price = parseFloat(d.unit_price) || 0;
      const priceIgv = parseFloat(d.unit_price_igv) || 0;
      return price <= 0 && priceIgv <= 0;
    });
    if (hasInvalidPrice) {
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
      tipo_cambio: formData.tipo_cambio ? parseFloat(formData.tipo_cambio) : undefined,
      order_details: details.map((detail) => {
        const rawUnitPrice = parseFloat(detail.unit_price) || 0;
        const rawUnitPriceIgv = parseFloat(detail.unit_price_igv) || 0;
        const effectiveUnitPriceIgv =
          rawUnitPriceIgv > 0
            ? rawUnitPriceIgv
            : detail.is_igv
              ? rawUnitPrice
              : roundTo8(rawUnitPrice * 1.18);
        return {
          product_id: parseInt(detail.product_id),
          is_igv: detail.is_igv,
          quantity: parseFloat(detail.quantity),
          unit_price: roundTo8(rawUnitPrice),
          unit_price_igv: roundTo8(effectiveUnitPriceIgv),
          purchase_price: parseFloat(detail.purchase_price),
        };
      }),
    };

    onSubmit(request);
  };

  const getTotalAmount = () => {
    return roundTo4(details.reduce((sum, detail) => sum + detail.total, 0));
  };

  const calculateSubtotalTotal = () => {
    return roundTo4(details.reduce((sum, detail) => sum + detail.subtotal, 0));
  };

  const calculateTaxTotal = () => {
    return roundTo4(details.reduce((sum, detail) => sum + detail.tax, 0));
  };

  const calculateDetailsTotal = () => {
    return roundTo4(details.reduce((sum, detail) => sum + detail.total, 0));
  };

  // Obtener precio CON IGV efectivo para mostrar en tabla (fallback a unit_price cuando unit_price_igv=0)
  const getDisplayPriceIgv = (detail: DetailRow): number => {
    const priceIgv = parseFloat(detail.unit_price_igv) || 0;
    if (priceIgv > 0) return priceIgv;
    const basePrice = parseFloat(detail.unit_price) || 0;
    return detail.is_igv ? basePrice : basePrice * 1.18;
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
              md: 2,
              lg: 3,
            }}
          >
            <FormSelectAsync
              control={form.control}
              name="quotation_id"
              label="Cotización"
              useQueryHook={useQuotations}
              mapOptionFn={(q: QuotationResource) => ({
                value: q.id.toString(),
                label: `#${q.id} - ${q.quotation_number} - ${q.customer?.business_name || q.customer?.names || "Cliente"}`,
              })}
              placeholder="Seleccionar cotización"
              onValueChange={handleQuotationChange}
            />

            <div className="flex gap-2 items-end max-w-full">
              <div className="flex-1 min-w-0">
                <FormSelectAsync
                  control={form.control}
                  name="customer_id"
                  label="Cliente"
                  useQueryHook={useClients}
                  mapOptionFn={(c: PersonResource) => ({
                    value: c.id.toString(),
                    label:
                      c.business_name ||
                      c.names +
                        " " +
                        (c.father_surname || "") +
                        " " +
                        (c.mother_surname || ""),
                  })}
                  placeholder="Seleccionar cliente"
                  defaultOption={defaultCustomerOption}
                  preloadItemId={preloadCustomerId}
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
                    description: w.address,
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

            <div className="flex items-end gap-2">
              <div className="flex-1 min-w-0">
                <FormInput
                  control={form.control}
                  name="tipo_cambio"
                  label="Tipo de Cambio SUNAT"
                  placeholder="Se obtiene automáticamente"
                  error={tipoCambioError}
                  description={
                    !tipoCambioError && !form.watch("tipo_cambio")
                      ? "Se obtiene de SUNAT según la fecha de pedido."
                      : undefined
                  }
                />
              </div>
              <Button
                type="button"
                size="icon"
                variant="outline"
                tooltip="Volver a consultar tipo de cambio SUNAT"
                onClick={() => watchedOrderDate && fetchTipoCambio(watchedOrderDate, true)}
                disabled={!watchedOrderDate}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

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
          </GroupFormSection>

          <GroupFormSection
            title="Detalles del Pedido"
            icon={Package}
            cols={{
              sm: 1,
            }}
          >
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={() => setSheetOpen(true)}
                
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
                    <TableHead className="text-right">V. Unitario</TableHead>
                    <TableHead className="text-right">P. Unitario</TableHead>
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
                        {parseFloat(detail.quantity).toFixed(4)}
                      </TableCell>
                      <TableCell className="text-right">
                        {(getDisplayPriceIgv(detail) / 1.18).toFixed(4)}
                      </TableCell>
                      <TableCell className="text-right">
                        {getDisplayPriceIgv(detail).toFixed(4)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={detail.is_igv ? "default" : "secondary"}
                        >
                          {detail.is_igv ? "Sí" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {detail.subtotal.toFixed(4)}
                      </TableCell>
                      <TableCell className="text-right">
                        {detail.tax.toFixed(4)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {detail.total.toFixed(4)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex gap-1 justify-center">
                          <Button
                            type="button"
                            variant="ghost"
                            
                            onClick={() => handleEditDetail(index)}
                          >
                            <Pencil className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            
                            onClick={() => handleRemoveDetail(index)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
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
            onClose={handleCloseSheet}
            onAdd={handleAddDetail}
            onEdit={handleUpdateDetail}
            editingDetail={editingDetail}
            editingIndex={editingIndex}
            currency={form.watch("currency")}
          />
        </div>

        <OrderSummary
          form={form}
          mode={mode}
          isSubmitting={isSubmitting}
          customers={customersList}
          warehouses={warehouses}
          details={details}
          calculateSubtotalTotal={calculateSubtotalTotal}
          calculateTaxTotal={calculateTaxTotal}
          calculateDetailsTotal={calculateDetailsTotal}
          onCancel={onCancel}
          tipoCambio={form.watch("tipo_cambio") || ""}
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
