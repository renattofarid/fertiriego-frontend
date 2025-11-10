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
import { Loader, Plus, Trash2, Edit } from "lucide-react";
import { FormSelect } from "@/components/FormSelect";
import type { PurchaseResource } from "../lib/purchase.interface";
import type { WarehouseResource } from "@/pages/warehouse/lib/warehouse.interface";
import type { ProductResource } from "@/pages/product/lib/product.interface";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import type { PurchaseOrderResource } from "@/pages/purchase-order/lib/purchase-order.interface";
import { useState, useEffect } from "react";
import { truncDecimal, formatDecimalTrunc } from "@/lib/utils";
import { formatNumber } from "@/lib/formatCurrency";
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
import {
  DOCUMENT_TYPES,
  PAYMENT_TYPES,
  CURRENCIES,
} from "../lib/purchase.interface";
import { errorToast } from "@/lib/core.function";
import { format } from "date-fns";

interface PurchaseFormProps {
  defaultValues: Partial<PurchaseSchema>;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  suppliers: PersonResource[];
  warehouses: WarehouseResource[];
  products: ProductResource[];
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
  products,
  purchaseOrders,
  currentUserId,
}: PurchaseFormProps) => {
  // Estados para detalles
  const [details, setDetails] = useState<DetailRow[]>([]);
  const [includeIgv, setIncludeIgv] = useState<boolean>(false);

  const IGV_RATE = 0.18;

  const [editingDetailIndex, setEditingDetailIndex] = useState<number | null>(
    null
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

  // Formularios temporales
  const detailTempForm = useForm({
    defaultValues: {
      temp_product_id: currentDetail.product_id,
      temp_quantity: currentDetail.quantity,
      temp_unit_price: currentDetail.unit_price,
    },
  });

  const installmentTempForm = useForm({
    defaultValues: {
      temp_due_days: currentInstallment.due_days,
      temp_amount: currentInstallment.amount,
    },
  });

  // Watchers para detalles
  const selectedProductId = detailTempForm.watch("temp_product_id");
  const selectedQuantity = detailTempForm.watch("temp_quantity");
  const selectedUnitPrice = detailTempForm.watch("temp_unit_price");

  // Watchers para cuotas
  const selectedDueDays = installmentTempForm.watch("temp_due_days");
  const selectedAmount = installmentTempForm.watch("temp_amount");

  // Observers para detalles
  useEffect(() => {
    if (selectedProductId !== currentDetail.product_id) {
      setCurrentDetail((prev) => ({
        ...prev,
        product_id: selectedProductId || "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProductId]);

  useEffect(() => {
    if (selectedQuantity !== currentDetail.quantity) {
      setCurrentDetail((prev) => ({
        ...prev,
        quantity: selectedQuantity || "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedQuantity]);

  useEffect(() => {
    if (selectedUnitPrice !== currentDetail.unit_price) {
      setCurrentDetail((prev) => ({
        ...prev,
        unit_price: selectedUnitPrice || "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUnitPrice]);

  // Observers para cuotas
  useEffect(() => {
    if (selectedDueDays !== currentInstallment.due_days) {
      setCurrentInstallment((prev) => ({
        ...prev,
        due_days: selectedDueDays || "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDueDays]);

  useEffect(() => {
    if (selectedAmount !== currentInstallment.amount) {
      setCurrentInstallment((prev) => ({
        ...prev,
        amount: selectedAmount || "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAmount]);

  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? purchaseSchemaCreate : purchaseSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
      user_id: currentUserId.toString(),
      details: details.length > 0 ? details : [],
      installments: installments.length > 0 ? installments : [],
    },
    mode: "onChange",
  });

  // Watch para la orden de compra seleccionada
  const selectedPurchaseOrderId = form.watch("purchase_order_id");

  // Watch para el tipo de pago
  const selectedPaymentType = form.watch("payment_type");

  // Establecer fecha de emisión automáticamente al cargar el formulario
  useEffect(() => {
    const today = new Date();
    const formattedDate = format(today, "yyyy-MM-dd");
    form.setValue("issue_date", formattedDate);
  }, [form]);

  // Auto-llenar datos cuando se selecciona una orden de compra
  useEffect(() => {
    if (!selectedPurchaseOrderId || selectedPurchaseOrderId === "") {
      return;
    }

    const selectedPO = purchaseOrders.find(
      (po) => po.id.toString() === selectedPurchaseOrderId
    );

    if (!selectedPO) return;

    // Auto-llenar proveedor y almacén
    form.setValue("supplier_id", selectedPO.supplier_id.toString());
    form.setValue("warehouse_id", selectedPO.warehouse_id.toString());

    // Auto-llenar detalles de la orden de compra
    if (selectedPO.details && selectedPO.details.length > 0) {
      const poDetails: DetailRow[] = selectedPO.details.map((detail) => {
        const quantity = parseFloat(detail.quantity_requested.toString());
        const unitPrice = parseFloat(detail.unit_price_estimated);
        // calcular con truncación a 6 decimales
        const subtotal = truncDecimal(quantity * unitPrice, 6);
        const tax = truncDecimal(subtotal * IGV_RATE, 6);
        const total = truncDecimal(subtotal + tax, 6);

        return {
          product_id: detail.product_id.toString(),
          product_name: detail.product_name,
          quantity: detail.quantity_requested.toString(),
          unit_price: detail.unit_price_estimated,
          tax: formatDecimalTrunc(tax, 6),
          subtotal,
          total,
        };
      });

      setDetails(poDetails);
      form.setValue("details", poDetails);
    }
  }, [selectedPurchaseOrderId, purchaseOrders, form]);

  // Funciones para detalles
  const handleAddDetail = () => {
    if (
      !currentDetail.product_id ||
      !currentDetail.quantity ||
      !currentDetail.unit_price
    ) {
      return;
    }

    const product = products.find(
      (p) => p.id.toString() === currentDetail.product_id
    );
    const quantity = parseFloat(currentDetail.quantity);
    const unitPrice = parseFloat(currentDetail.unit_price);
    let subtotal = truncDecimal(quantity * unitPrice, 6);
    let tax = 0;
    let total = 0;

    if (includeIgv) {
      // unitPrice incluye IGV: descomponer (truncando resultados)
      const totalIncl = truncDecimal(quantity * unitPrice, 6);
      subtotal = truncDecimal(totalIncl / (1 + IGV_RATE), 6);
      tax = truncDecimal(totalIncl - subtotal, 6);
      total = totalIncl;
    } else {
      tax = truncDecimal(subtotal * IGV_RATE, 6); // Calcular impuesto automáticamente (18%)
      total = truncDecimal(subtotal + tax, 6);
    }

    const newDetail: DetailRow = {
      ...currentDetail,
      product_name: product?.name,
      tax: formatDecimalTrunc(tax, 6),
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
    const emptyDetail = {
      product_id: "",
      quantity: "",
      unit_price: "",
      tax: "",
      subtotal: 0,
      total: 0,
    };
    setCurrentDetail(emptyDetail);
    detailTempForm.reset({
      temp_product_id: "",
      temp_quantity: "",
      temp_unit_price: "",
    });
  };

  const handleEditDetail = (index: number) => {
    const detail = details[index];
    setCurrentDetail(detail);
    // Actualizar formulario temporal manualmente
    detailTempForm.setValue("temp_product_id", detail.product_id);
    detailTempForm.setValue("temp_quantity", detail.quantity);
    detailTempForm.setValue("temp_unit_price", detail.unit_price);
    setEditingDetailIndex(index);
  };

  const handleRemoveDetail = (index: number) => {
    const updatedDetails = details.filter((_, i) => i !== index);
    setDetails(updatedDetails);
    form.setValue("details", updatedDetails);
  };

  const calculateDetailsTotal = () => {
    const sum = details.reduce((sum, detail) => sum + (detail.total || 0), 0);
    return truncDecimal(sum, 6);
  };

  const calculateSubtotalTotal = () => {
    const sum = details.reduce(
      (sum, detail) => sum + (detail.subtotal || 0),
      0
    );
    return truncDecimal(sum, 6);
  };

  const calculateTaxTotal = () => {
    const sum = details.reduce(
      (sum, detail) =>
        sum + (isNaN(parseFloat(detail.tax)) ? 0 : parseFloat(detail.tax)),
      0
    );
    return truncDecimal(sum, 6);
  };

  // Recalcular detalles cuando cambie el modo de interpretación de precios (incluye IGV o no)
  useEffect(() => {
    if (!details || details.length === 0) return;

    const recalculated = details.map((d) => {
      const q = parseFloat(d.quantity || "0");
      const up = parseFloat(d.unit_price || "0");
      let subtotal = 0;
      let tax = 0;
      let total = 0;

      if (includeIgv) {
        const totalIncl = truncDecimal(q * up, 6);
        subtotal = truncDecimal(totalIncl / (1 + IGV_RATE), 6);
        tax = truncDecimal(totalIncl - subtotal, 6);
        total = totalIncl;
      } else {
        subtotal = truncDecimal(q * up, 6);
        tax = truncDecimal(subtotal * IGV_RATE, 6);
        total = truncDecimal(subtotal + tax, 6);
      }

      return {
        ...d,
        subtotal,
        total,
        tax: formatDecimalTrunc(tax, 6),
      };
    });

    setDetails(recalculated);
    form.setValue("details", recalculated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includeIgv]);

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
          6
        )})`
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
    installmentTempForm.setValue("temp_due_days", "");
    installmentTempForm.setValue("temp_amount", "");
  };

  const handleEditInstallment = (index: number) => {
    const inst = installments[index];
    setCurrentInstallment(inst);
    // Actualizar formulario temporal manualmente
    installmentTempForm.setValue("temp_due_days", inst.due_days);
    installmentTempForm.setValue("temp_amount", inst.amount);
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
      0
    );
    return truncDecimal(sum, 6);
  };

  // Validar si las cuotas coinciden con el total (si hay cuotas)
  const installmentsMatchTotal = () => {
    if (installments.length === 0) return true; // Si no hay cuotas, está ok
    const purchaseTotal = calculateDetailsTotal();
    const installmentsTotal = calculateInstallmentsTotal();
    return Math.abs(purchaseTotal - installmentsTotal) < 0.000001; // Tolerancia acorde a 6 decimales
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
          calculateInstallmentsTotal()
        )}) debe ser igual al total de la compra (${formatNumber(
          calculateDetailsTotal()
        )})`
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
          amount: formatDecimalTrunc(totalAmount, 6),
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
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6 w-full"
      >
        {/* Información General */}
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      <Input
                        variant="primary"
                        placeholder="Ej: F001-001245"
                        {...field}
                      />
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
            </div>
          </CardContent>
        </Card>

        {/* Detalles */}
        {mode === "create" && (
          <Card>
            <CardHeader>
              <CardTitle>Detalles de la Compra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-sidebar rounded-lg">
                <div className="md:col-span-2">
                  <Form {...detailTempForm}>
                    <FormSelect
                      control={detailTempForm.control}
                      name="temp_product_id"
                      label="Producto"
                      placeholder="Seleccione"
                      options={products.map((product) => ({
                        value: product.id.toString(),
                        label: product.name,
                      }))}
                    />
                  </Form>
                </div>

                <FormField
                  control={detailTempForm.control}
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
                    </FormItem>
                  )}
                />

                <FormField
                  control={detailTempForm.control}
                  name="temp_unit_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio Unit.</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.000001"
                          variant="primary"
                          placeholder="0.000000"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="md:col-span-4 flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={includeIgv}
                      onChange={(e) => setIncludeIgv(e.target.checked)}
                      className="accent-primary"
                    />
                    <span className="text-sm">Incluir IGV (18%)</span>
                  </label>

                  <div>
                    <Button
                      type="button"
                      variant="default"
                      onClick={handleAddDetail}
                      disabled={
                        !currentDetail.product_id ||
                        !currentDetail.quantity ||
                        !currentDetail.unit_price
                      }
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {editingDetailIndex !== null ? "Actualizar" : "Agregar"}
                    </Button>
                  </div>
                </div>
              </div>

              {details.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead className="text-right">P. Unit.</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                        <TableHead className="text-right">Impuesto</TableHead>
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
                          <TableCell className="text-right font-bold text-green-600">
                            {formatNumber(detail.total)}
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
                        <TableCell colSpan={4} className="text-right font-bold">
                          SUBTOTAL:
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {formatNumber(calculateSubtotalTotal())}
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell colSpan={4} className="text-right font-bold">
                          IGV (18%):
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {formatNumber(calculateTaxTotal())}
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell colSpan={4} className="text-right font-bold">
                          TOTAL:
                        </TableCell>
                        <TableCell className="text-right font-bold text-lg text-green-600">
                          {formatNumber(calculateDetailsTotal())}
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Badge variant="outline" className="text-lg p-3">
                    No hay detalles agregados
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Cuotas - Solo mostrar si es a crédito */}
        {mode === "create" && selectedPaymentType === "CREDITO" && (
          <Card>
            <CardHeader>
              <CardTitle>Cuotas (Obligatorio)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-sidebar rounded-lg">
                <FormField
                  control={installmentTempForm.control}
                  name="temp_due_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Días de Vencimiento</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          variant="primary"
                          placeholder="0"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={installmentTempForm.control}
                  name="temp_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          variant="primary"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="default"
                    onClick={handleAddInstallment}
                    disabled={
                      !currentInstallment.due_days || !currentInstallment.amount
                    }
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
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
                          <TableHead className="text-right">Monto</TableHead>
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
                              {formatDecimalTrunc(parseFloat(inst.amount), 6)}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex justify-center gap-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditInstallment(index)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveInstallment(index)}
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
                              6
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
                        {formatNumber(calculateInstallmentsTotal())}) debe ser
                        igual al total de la compra (
                        {formatNumber(calculateDetailsTotal())})
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Badge variant="outline" className="text-lg p-3">
                    No hay cuotas agregadas
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Botones */}
        <div className="flex gap-4 w-full justify-end">
          <Button type="button" variant="neutral" onClick={onCancel}>
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={
              isSubmitting ||
              !form.formState.isValid ||
              (mode === "create" && details.length === 0) ||
              (mode === "create" &&
                selectedPaymentType === "CREDITO" &&
                installments.length === 0) ||
              (mode === "create" &&
                installments.length > 0 &&
                !installmentsMatchTotal())
            }
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
