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
  purchaseSchemaCreate,
  purchaseSchemaUpdate,
  type PurchaseSchema,
} from "../lib/purchase.schema";
import { Plus, Trash2, Pencil } from "lucide-react";
import { FormSelect } from "@/components/FormSelect";
import type { PurchaseResource } from "../lib/purchase.interface";
import type { WarehouseResource } from "@/pages/warehouse/lib/warehouse.interface";
import type { ProductResource } from "@/pages/product/lib/product.interface";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import type { PurchaseOrderResource } from "@/pages/purchase-order/lib/purchase-order.interface";
import { useState, useEffect } from "react";
import { SupplierCreateModal } from "@/pages/supplier/components/SupplierCreateModal";
import { WarehouseCreateModal } from "@/pages/warehouse/components/WarehouseCreateModal";
import { truncDecimal, formatDecimalTrunc } from "@/lib/utils";
import { formatNumber } from "@/lib/formatCurrency";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DOCUMENT_TYPES,
  PAYMENT_TYPES,
  CURRENCIES,
} from "../lib/purchase.interface";
import { errorToast } from "@/lib/core.function";
import { format } from "date-fns";
import { GroupFormSection } from "@/components/GroupFormSection";
import { FileText, Package, CalendarDays, ShoppingCart } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { FormSwitch } from "@/components/FormSwitch";
import { FormInput } from "@/components/FormInput";
import { PurchaseSummary } from "./PurchaseSummary";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { useProduct } from "@/pages/product/lib/product.hook";

interface PurchaseFormProps {
  defaultValues: Partial<PurchaseSchema>;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  suppliers: PersonResource[];
  warehouses: WarehouseResource[];
  purchaseOrders: PurchaseOrderResource[];
  purchase?: PurchaseResource;
  currentUserId: number;
}

interface DetailRow {
  product_id: string;
  product_name?: string;
  quantity: string;
  unit_price: string;
  tax: string;
  subtotal: number;
  total: number;
}

interface InstallmentRow {
  due_days: string;
  amount: string;
}

export const PurchaseForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  suppliers,
  warehouses,
  purchaseOrders,
  currentUserId,
}: PurchaseFormProps) => {
  // Estados para detalles
  const [details, setDetails] = useState<DetailRow[]>([]);
  const [includeIgv, setIncludeIgv] = useState<boolean>(false);

  const IGV_RATE = 0.18;

  // Estado para modales
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [suppliersList, setSuppliersList] =
    useState<PersonResource[]>(suppliers);
  const [warehousesList, setWarehousesList] =
    useState<WarehouseResource[]>(warehouses);

  const [editingDetailIndex, setEditingDetailIndex] = useState<number | null>(
    null,
  );
  const [currentDetail, setCurrentDetail] = useState<DetailRow>({
    product_id: "",
    quantity: "",
    unit_price: "",
    tax: "",
    subtotal: 0,
    total: 0,
  });

  // Estados para cuotas
  const [installments, setInstallments] = useState<InstallmentRow[]>([]);
  const [editingInstallmentIndex, setEditingInstallmentIndex] = useState<
    number | null
  >(null);
  const [currentInstallment, setCurrentInstallment] = useState<InstallmentRow>({
    due_days: "",
    amount: "",
  });

  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? purchaseSchemaCreate : purchaseSchemaUpdate,
    ),
    defaultValues: {
      ...defaultValues,
      user_id: currentUserId.toString(),
      details: details.length > 0 ? details : [],
      installments: installments.length > 0 ? installments : [],
    },
    mode: "onChange",
  });

  // Formulario separado para el switch de IGV
  const igvForm = useForm({
    defaultValues: {
      include_igv: includeIgv,
    },
  });

  // Formulario separado para los campos temporales de detalle
  const detailTempForm = useForm({
    defaultValues: {
      temp_product_id: currentDetail.product_id,
      temp_quantity: currentDetail.quantity,
      temp_unit_price: currentDetail.unit_price,
    },
  });

  // Watch para la orden de compra seleccionada
  const selectedPurchaseOrderId = form.watch("purchase_order_id");

  // Watch para el tipo de pago
  const selectedPaymentType = form.watch("payment_type");

  // Watch para el switch de IGV
  const watchIncludeIgv = igvForm.watch("include_igv");

  // Watch para los campos temporales de detalle
  const watchTempProductId = detailTempForm.watch("temp_product_id");
  const watchTempQuantity = detailTempForm.watch("temp_quantity");
  const watchTempUnitPrice = detailTempForm.watch("temp_unit_price");

  // Sincronizar el estado includeIgv con el campo del formulario
  useEffect(() => {
    if (watchIncludeIgv !== includeIgv) {
      setIncludeIgv(watchIncludeIgv);

      // Si hay detalles, recalcular todos los precios
      if (details.length > 0) {
        const updatedDetails = details.map((detail) => {
          const quantity = parseFloat(detail.quantity);
          const unitPrice = parseFloat(detail.unit_price);
          let subtotal = truncDecimal(quantity * unitPrice, 2);
          let tax = 0;
          let total = 0;

          if (watchIncludeIgv) {
            // unitPrice incluye IGV: descomponer (truncando resultados)
            const totalIncl = truncDecimal(quantity * unitPrice, 2);
            subtotal = truncDecimal(totalIncl / (1 + IGV_RATE), 2);
            tax = truncDecimal(totalIncl - subtotal, 2);
            total = totalIncl;
          } else {
            tax = truncDecimal(subtotal * IGV_RATE, 2); // Calcular impuesto automáticamente (18%)
            total = truncDecimal(subtotal + tax, 2);
          }

          return {
            ...detail,
            tax: formatDecimalTrunc(tax, 2),
            subtotal,
            total,
          };
        });

        setDetails(updatedDetails);
        form.setValue("details", updatedDetails);
      }
    }
  }, [watchIncludeIgv, includeIgv]);

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
    if (watchTempQuantity !== currentDetail.quantity) {
      setCurrentDetail((prev) => ({
        ...prev,
        quantity: watchTempQuantity || "",
      }));
    }
  }, [watchTempQuantity, currentDetail.quantity]);

  useEffect(() => {
    if (watchTempUnitPrice !== currentDetail.unit_price) {
      setCurrentDetail((prev) => ({
        ...prev,
        unit_price: watchTempUnitPrice || "",
      }));
    }
  }, [watchTempUnitPrice, currentDetail.unit_price]);

  // Actualizar listas cuando cambien las props
  useEffect(() => {
    setSuppliersList(suppliers);
  }, [suppliers]);

  useEffect(() => {
    setWarehousesList(warehouses);
  }, [warehouses]);

  // Handlers para modales
  const handleSupplierCreated = (newSupplier: PersonResource) => {
    setSuppliersList((prev) => [...prev, newSupplier]);
    form.setValue("supplier_id", newSupplier.id.toString(), {
      shouldValidate: true,
    });
  };

  const handleWarehouseCreated = (newWarehouse: WarehouseResource) => {
    setWarehousesList((prev) => [...prev, newWarehouse]);
    form.setValue("warehouse_id", newWarehouse.id.toString(), {
      shouldValidate: true,
    });
  };

  // Establecer fecha de emisión automáticamente al cargar el formulario
  useEffect(() => {
    const today = new Date();
    const formattedDate = format(today, "yyyy-MM-dd");
    form.setValue("issue_date", formattedDate);
  }, [form]);

  // Auto-llenar datos cuando se selecciona una orden de compra
  useEffect(() => {
    // Limpiar detalles siempre que cambie la orden de compra seleccionada
    setDetails([]);
    form.setValue("details", []);

    if (!selectedPurchaseOrderId || selectedPurchaseOrderId === "") {
      return;
    }

    const selectedPO = purchaseOrders.find(
      (po) => po.id.toString() === selectedPurchaseOrderId,
    );

    if (!selectedPO) return;

    // Auto-llenar proveedor y almacén
    form.setValue("supplier_id", selectedPO.supplier_id.toString());
    form.setValue("warehouse_id", selectedPO.warehouse_id.toString());

    // Setear el include_igv según el apply_igv de la orden
    // Si apply_igv = true → se le aplicó IGV → los precios NO incluyen IGV → include_igv = false
    // Si apply_igv = false → no se le aplicó IGV → los precios ya incluyen IGV → include_igv = true
    const applyIgvBoolean = Boolean(selectedPO.apply_igv);
    const includeIgvValue = !applyIgvBoolean; // Lógica inversa
    igvForm.setValue("include_igv", includeIgvValue);
    setIncludeIgv(includeIgvValue);

    // Auto-llenar detalles de la orden de compra
    if (selectedPO.details && selectedPO.details.length > 0) {
      const poDetails: DetailRow[] = selectedPO.details.map((detail) => {
        const quantity = parseFloat(detail.quantity_requested.toString());
        const unitPrice = parseFloat(detail.unit_price_estimated);
        let subtotal = truncDecimal(quantity * unitPrice, 2);
        let tax = 0;
        let total = 0;

        if (includeIgvValue) {
          // unitPrice incluye IGV: descomponer (truncando resultados)
          const totalIncl = truncDecimal(quantity * unitPrice, 2);
          subtotal = truncDecimal(totalIncl / (1 + IGV_RATE),2);
          tax = truncDecimal(totalIncl - subtotal, 2);
          total = totalIncl;
        } else {
          tax = truncDecimal(subtotal * IGV_RATE, 2);
          total = truncDecimal(subtotal + tax, 2);
        }

        return {
          product_id: detail.product_id.toString(),
          product_name: detail.product_name,
          quantity: detail.quantity_requested.toString(),
          unit_price: detail.unit_price_estimated,
          tax: formatDecimalTrunc(tax, 2),
          subtotal,
          total,
        };
      });

      setDetails(poDetails);
      form.setValue("details", poDetails);
    }
  }, [selectedPurchaseOrderId, purchaseOrders, form, igvForm]);

  const [selectedProduct, setSelectedProduct] = useState<
    ProductResource | undefined
  >(undefined);
  
  // Funciones para detalles
  const handleAddDetail = () => {
    if (
      !currentDetail.product_id ||
      !currentDetail.quantity ||
      !currentDetail.unit_price
    ) {
      return;
    }

    const quantity = parseFloat(currentDetail.quantity);
    const unitPrice = parseFloat(currentDetail.unit_price);
    let subtotal = truncDecimal(quantity * unitPrice, 2);
    let tax = 0;
    let total = 0;

    if (includeIgv) {
      // unitPrice incluye IGV: descomponer (truncando resultados)
      const totalIncl = truncDecimal(quantity * unitPrice, 2);
      subtotal = truncDecimal(totalIncl / (1 + IGV_RATE), 2);
      tax = truncDecimal(totalIncl - subtotal, 2);
      total = totalIncl;
    } else {
      tax = truncDecimal(subtotal * IGV_RATE, 2); // Calcular impuesto automáticamente (18%)
      total = truncDecimal(subtotal + tax, 2);
    }

    const newDetail: DetailRow = {
      ...currentDetail,
      product_name: selectedProduct?.name,
      tax: formatDecimalTrunc(tax, 2),
      subtotal,
      total,
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
      quantity: "",
      unit_price: "",
      tax: "",
      subtotal: 0,
      total: 0,
    });
    detailTempForm.reset({
      temp_product_id: "",
      temp_quantity: "",
      temp_unit_price: "",
    });
  };

  const handleEditDetail = (index: number) => {
    const detail = details[index];
    setCurrentDetail(detail);
    setEditingDetailIndex(index);
    detailTempForm.setValue("temp_product_id", detail.product_id);
    detailTempForm.setValue("temp_quantity", detail.quantity);
    detailTempForm.setValue("temp_unit_price", detail.unit_price);
  };

  const handleRemoveDetail = (index: number) => {
    const updatedDetails = details.filter((_, i) => i !== index);
    setDetails(updatedDetails);
    form.setValue("details", updatedDetails);
  };

  const calculateDetailsTotal = () => {
    const sum = details.reduce((sum, detail) => sum + (detail.total || 0), 0);
    return truncDecimal(sum, 2);
  };

  const calculateSubtotalTotal = () => {
    const sum = details.reduce(
      (sum, detail) => sum + (detail.subtotal || 0),
      0,
    );
    return truncDecimal(sum, 2);
  };

  const calculateTaxTotal = () => {
    const sum = details.reduce(
      (sum, detail) =>
        sum + (isNaN(parseFloat(detail.tax)) ? 0 : parseFloat(detail.tax)),
      0,
    );
    return truncDecimal(sum, 2);
  };

  // Funciones para cuotas
  const handleAddInstallment = () => {
    if (!currentInstallment.due_days || !currentInstallment.amount) {
      return;
    }

    const newAmount = parseFloat(currentInstallment.amount);
    const purchaseTotal = calculateDetailsTotal();

    // Calcular el total de cuotas (excluyendo la que se está editando si aplica)
    let currentInstallmentsTotal = installments.reduce((sum, inst, idx) => {
      if (editingInstallmentIndex !== null && idx === editingInstallmentIndex) {
        return sum; // Excluir la cuota que se está editando
      }
      return sum + parseFloat(inst.amount);
    }, 0);

    // Validar que no exceda el total de la compra
    if (currentInstallmentsTotal + newAmount > purchaseTotal) {
      errorToast(
        `El total de cuotas no puede exceder el total de la compra (${formatDecimalTrunc(
          purchaseTotal,
          2,
        )})`,
      );
      return;
    }

    const newInstallment: InstallmentRow = { ...currentInstallment };

    if (editingInstallmentIndex !== null) {
      const updatedInstallments = [...installments];
      updatedInstallments[editingInstallmentIndex] = newInstallment;
      setInstallments(updatedInstallments);
      form.setValue("installments", updatedInstallments);
      setEditingInstallmentIndex(null);
    } else {
      const updatedInstallments = [...installments, newInstallment];
      setInstallments(updatedInstallments);
      form.setValue("installments", updatedInstallments);
    }

    setCurrentInstallment({
      due_days: "",
      amount: "",
    });
  };

  const handleEditInstallment = (index: number) => {
    const inst = installments[index];
    setCurrentInstallment(inst);
    setEditingInstallmentIndex(index);
  };

  const handleRemoveInstallment = (index: number) => {
    const updatedInstallments = installments.filter((_, i) => i !== index);
    setInstallments(updatedInstallments);
    form.setValue("installments", updatedInstallments);
  };

  const calculateInstallmentsTotal = () => {
    const sum = installments.reduce(
      (sum, inst) => sum + parseFloat(inst.amount),
      0,
    );
    return truncDecimal(sum, 2);
  };

  // Validar si las cuotas coinciden con el total (si hay cuotas)
  const installmentsMatchTotal = () => {
    if (installments.length === 0) return true; // Si no hay cuotas, está ok
    const purchaseTotal = calculateDetailsTotal();
    const installmentsTotal = calculateInstallmentsTotal();
    return Math.abs(purchaseTotal - installmentsTotal) < 0.01; // Tolerancia acorde a 2 decimales
  };

  const handleFormSubmit = (data: any) => {
    // Validar que si es a crédito, debe tener cuotas
    if (selectedPaymentType === "CREDITO" && installments.length === 0) {
      errorToast("Para pagos a crédito, debe agregar al menos una cuota");
      return;
    }

    // Validar que las cuotas coincidan con el total si hay cuotas
    if (installments.length > 0 && !installmentsMatchTotal()) {
      errorToast(
        `El total de cuotas (${formatNumber(
          calculateInstallmentsTotal(),
        )}) debe ser igual al total de la compra (${formatNumber(
          calculateDetailsTotal(),
        )})`,
      );
      return;
    }

    // Preparar cuotas según el tipo de pago
    let validInstallments;

    if (selectedPaymentType === "CONTADO") {
      // Para pagos al contado, crear automáticamente una cuota con el total
      const totalAmount = calculateDetailsTotal();
      validInstallments = [
        {
          due_days: "1",
          amount: formatDecimalTrunc(totalAmount, 2),
        },
      ];
    } else {
      // Para pagos a crédito, usar las cuotas ingresadas
      validInstallments = installments
        .filter((inst) => inst.due_days && inst.amount)
        .map((inst) => ({
          due_days: inst.due_days,
          amount: inst.amount,
        }));
    }

    onSubmit({
      ...data,
      details,
      installments: validInstallments,
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
              cols={{ sm: 1, md: 2, lg: 3 }}
            >
              <div className="md:col-span-2 lg:col-span-3">
                <FormSelect
                  control={form.control}
                  name="purchase_order_id"
                  label="Orden de Compra (Opcional - Auto-llena los datos)"
                  placeholder="Seleccione una orden de compra"
                  options={[
                    { value: "", label: "Ninguna - Llenar manualmente" },
                    ...purchaseOrders.map((po) => ({
                      value: po.id.toString(),
                      label: `${po.correlativo} (${po.supplier_fullname})`,
                    })),
                  ]}
                />
              </div>

              <div className="flex gap-2 items-end">
                <div className="flex-1 truncate">
                  <FormSelect
                    control={form.control}
                    name="supplier_id"
                    label="Proveedor"
                    placeholder="Seleccione un proveedor"
                    options={suppliersList.map((supplier) => ({
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
                <div className="flex-1 truncate ">
                  <FormSelect
                    control={form.control}
                    name="warehouse_id"
                    label="Almacén"
                    placeholder="Seleccione un almacén"
                    options={warehousesList.map((warehouse) => ({
                      value: warehouse.id.toString(),
                      label: warehouse.name,
                    }))}
                    disabled={mode === "update"}
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

              <FormSelect
                control={form.control}
                name="document_type"
                label="Tipo de Documento"
                placeholder="Seleccione tipo"
                options={DOCUMENT_TYPES.map((dt) => ({
                  value: dt.value,
                  label: dt.label,
                }))}
              />

              <FormField
                control={form.control}
                name="document_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Documento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: F001-001245" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormSelect
                control={form.control}
                name="payment_type"
                label="Tipo de Pago"
                placeholder="Seleccione tipo"
                options={PAYMENT_TYPES.map((pt) => ({
                  value: pt.value,
                  label: pt.label,
                }))}
              />

              <FormSelect
                control={form.control}
                name="currency"
                label="Moneda"
                placeholder="Seleccione moneda"
                options={CURRENCIES.map((c) => ({
                  value: c.value,
                  label: c.label,
                }))}
              />

              <div className="lg:col-span-2">
                <FormSwitch
                  control={igvForm.control}
                  name="include_igv"
                  text="Los precios incluyen IGV"
                  textDescription="El precio unitario de los productos incluye el IGV (18%)"
                  autoHeight
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3">
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
            </GroupFormSection>

            {/* Detalles */}
            {mode === "create" && (
              <GroupFormSection
                title="Detalles de la Compra"
                icon={Package}
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
                      name="temp_quantity"
                      label="Cantidad"
                      type="number"
                      placeholder="0"
                      className="h-9"
                    />
                  </div>

                  <div className="col-span-2">
                    <FormInput
                      control={detailTempForm.control}
                      name="temp_unit_price"
                      label="P. Unit."
                      type="number"
                      step="0.01"
                      placeholder="0.00"
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
                        !currentDetail.quantity ||
                        !currentDetail.unit_price
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
                            quantity: "",
                            unit_price: "",
                            tax: "",
                            subtotal: 0,
                            total: 0,
                          });
                          detailTempForm.reset({
                            temp_product_id: "",
                            temp_quantity: "",
                            temp_unit_price: "",
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
                          <TableHead className="text-right">Impuesto</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead className="w-16"></TableHead>
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
                              {isNaN(parseFloat(detail.unit_price))
                                ? detail.unit_price
                                : formatNumber(parseFloat(detail.unit_price))}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatNumber(detail.subtotal)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatNumber(parseFloat(detail.tax || "0"))}
                            </TableCell>
                            <TableCell className="text-right font-bold text-primary">
                              {formatNumber(detail.total)}
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
            )}

            {/* Cuotas - Solo mostrar si es a crédito */}
            {mode === "create" && selectedPaymentType === "CREDITO" && (
              <GroupFormSection
                title="Cuotas (Obligatorio)"
                icon={CalendarDays}
                cols={{ sm: 1 }}
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-sidebar rounded-lg">
                    <FormItem>
                      <FormLabel>Días de Vencimiento</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          value={currentInstallment.due_days}
                          onChange={(e) =>
                            setCurrentInstallment((prev) => ({
                              ...prev,
                              due_days: e.target.value,
                            }))
                          }
                        />
                      </FormControl>
                    </FormItem>

                    <FormItem>
                      <FormLabel>Monto</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={currentInstallment.amount}
                          onChange={(e) =>
                            setCurrentInstallment((prev) => ({
                              ...prev,
                              amount: e.target.value,
                            }))
                          }
                        />
                      </FormControl>
                    </FormItem>

                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="default"
                        onClick={handleAddInstallment}
                        disabled={
                          !currentInstallment.due_days ||
                          !currentInstallment.amount
                        }
                        className="w-full"
                      >
                        {editingInstallmentIndex !== null ? (
                          <Pencil className="h-4 w-4 mr-2" />
                        ) : (
                          <Plus className="h-4 w-4 mr-2" />
                        )}

                        {editingInstallmentIndex !== null
                          ? "Actualizar"
                          : "Agregar"}
                      </Button>
                    </div>
                  </div>

                  {installments.length > 0 ? (
                    <>
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Cuota #</TableHead>
                              <TableHead className="text-right">
                                Días Vencimiento
                              </TableHead>
                              <TableHead className="text-right">
                                Monto
                              </TableHead>
                              <TableHead className="text-center">
                                Acciones
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {installments.map((inst, index) => (
                              <TableRow key={index}>
                                <TableCell>Cuota {index + 1}</TableCell>
                                <TableCell className="text-right">
                                  {inst.due_days} días
                                </TableCell>
                                <TableCell className="text-right font-semibold">
                                  {formatDecimalTrunc(
                                    parseFloat(inst.amount),
                                    2,
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="flex justify-center gap-2">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleEditInstallment(index)
                                      }
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleRemoveInstallment(index)
                                      }
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                            <TableRow>
                              <TableCell
                                colSpan={2}
                                className="text-right font-bold"
                              >
                                TOTAL CUOTAS:
                              </TableCell>
                              <TableCell className="text-right font-bold text-lg text-blue-600">
                                {formatDecimalTrunc(
                                  calculateInstallmentsTotal(),
                                  2,
                                )}
                              </TableCell>
                              <TableCell></TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                      {/* Advertencia de validación */}
                      {!installmentsMatchTotal() && (
                        <div className="p-4 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
                          <p className="text-sm text-orange-800 dark:text-orange-200 font-semibold">
                            ⚠️ El total de cuotas (
                            {formatNumber(calculateInstallmentsTotal())}) debe
                            ser igual al total de la compra (
                            {formatNumber(calculateDetailsTotal())})
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <EmptyState
                      title="No hay cuotas agregadas"
                      description="Agregue las cuotas de pago para esta compra a crédito"
                      icon={CalendarDays}
                    />
                  )}
                </div>
              </GroupFormSection>
            )}
          </div>

          {/* Columna derecha: Resumen - sticky */}
          <PurchaseSummary
            form={form}
            mode={mode}
            isSubmitting={isSubmitting}
            suppliers={suppliers}
            warehouses={warehouses}
            details={details}
            installments={installments}
            calculateSubtotalTotal={calculateSubtotalTotal}
            calculateTaxTotal={calculateTaxTotal}
            calculateDetailsTotal={calculateDetailsTotal}
            installmentsMatchTotal={installmentsMatchTotal}
            onCancel={onCancel}
            selectedPaymentType={selectedPaymentType}
          />
        </div>
      </form>

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
