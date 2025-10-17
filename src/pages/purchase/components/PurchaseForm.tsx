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
import { DatePickerFormField } from "@/components/DatePickerFormField";
import type { PurchaseResource } from "../lib/purchase.interface";
import type { WarehouseResource } from "@/pages/warehouse/lib/warehouse.interface";
import type { ProductResource } from "@/pages/product/lib/product.interface";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import type { PurchaseOrderResource } from "@/pages/purchase-order/lib/purchase-order.interface";
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
import { DOCUMENT_TYPES, PAYMENT_TYPES, CURRENCIES } from "../lib/purchase.interface";
import { errorToast } from "@/lib/core.function";

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
  const [editingDetailIndex, setEditingDetailIndex] = useState<number | null>(null);
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
  const [editingInstallmentIndex, setEditingInstallmentIndex] = useState<number | null>(null);
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

  // Sincronizar detalles
  useEffect(() => {
    detailTempForm.setValue("temp_product_id", currentDetail.product_id);
    detailTempForm.setValue("temp_quantity", currentDetail.quantity);
    detailTempForm.setValue("temp_unit_price", currentDetail.unit_price);
  }, [currentDetail, detailTempForm]);

  // Sincronizar cuotas
  useEffect(() => {
    installmentTempForm.setValue("temp_due_days", currentInstallment.due_days);
    installmentTempForm.setValue("temp_amount", currentInstallment.amount);
  }, [currentInstallment, installmentTempForm]);

  // Observers para detalles
  useEffect(() => {
    if (selectedProductId !== currentDetail.product_id) {
      setCurrentDetail({ ...currentDetail, product_id: selectedProductId || "" });
    }
  }, [selectedProductId]);

  useEffect(() => {
    if (selectedQuantity !== currentDetail.quantity) {
      setCurrentDetail({ ...currentDetail, quantity: selectedQuantity || "" });
    }
  }, [selectedQuantity]);

  useEffect(() => {
    if (selectedUnitPrice !== currentDetail.unit_price) {
      setCurrentDetail({ ...currentDetail, unit_price: selectedUnitPrice || "" });
    }
  }, [selectedUnitPrice]);


  // Observers para cuotas
  useEffect(() => {
    if (selectedDueDays !== currentInstallment.due_days) {
      setCurrentInstallment({ ...currentInstallment, due_days: selectedDueDays || "" });
    }
  }, [selectedDueDays]);

  useEffect(() => {
    if (selectedAmount !== currentInstallment.amount) {
      setCurrentInstallment({ ...currentInstallment, amount: selectedAmount || "" });
    }
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

  // Funciones para detalles
  const handleAddDetail = () => {
    if (
      !currentDetail.product_id ||
      !currentDetail.quantity ||
      !currentDetail.unit_price
    ) {
      return;
    }

    const product = products.find((p) => p.id.toString() === currentDetail.product_id);
    const quantity = parseFloat(currentDetail.quantity);
    const unitPrice = parseFloat(currentDetail.unit_price);
    const subtotal = quantity * unitPrice;
    const tax = subtotal * 0.18; // Calcular impuesto automáticamente (18%)
    const total = subtotal + tax;

    const newDetail: DetailRow = {
      ...currentDetail,
      product_name: product?.name,
      tax: tax.toFixed(2),
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

    setCurrentDetail({
      product_id: "",
      quantity: "",
      unit_price: "",
      tax: "",
      subtotal: 0,
      total: 0,
    });
  };

  const handleEditDetail = (index: number) => {
    setCurrentDetail(details[index]);
    setEditingDetailIndex(index);
  };

  const handleRemoveDetail = (index: number) => {
    const updatedDetails = details.filter((_, i) => i !== index);
    setDetails(updatedDetails);
    form.setValue("details", updatedDetails);
  };

  const calculateDetailsTotal = () => {
    return details.reduce((sum, detail) => sum + detail.total, 0);
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
      errorToast(`El total de cuotas no puede exceder el total de la compra (${purchaseTotal.toFixed(2)})`);
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
    setCurrentInstallment(installments[index]);
    setEditingInstallmentIndex(index);
  };

  const handleRemoveInstallment = (index: number) => {
    const updatedInstallments = installments.filter((_, i) => i !== index);
    setInstallments(updatedInstallments);
    form.setValue("installments", updatedInstallments);
  };

  const calculateInstallmentsTotal = () => {
    return installments.reduce((sum, inst) => sum + parseFloat(inst.amount), 0);
  };

  // Validar si las cuotas coinciden con el total (si hay cuotas)
  const installmentsMatchTotal = () => {
    if (installments.length === 0) return true; // Si no hay cuotas, está ok
    const purchaseTotal = calculateDetailsTotal();
    const installmentsTotal = calculateInstallmentsTotal();
    return Math.abs(purchaseTotal - installmentsTotal) < 0.01; // Tolerancia de 0.01 por redondeos
  };

  const handleFormSubmit = (data: any) => {
    // Validar antes de enviar
    if (installments.length > 0 && !installmentsMatchTotal()) {
      errorToast(`El total de cuotas (${calculateInstallmentsTotal().toFixed(2)}) debe ser igual al total de la compra (${calculateDetailsTotal().toFixed(2)})`);
      return;
    }

    onSubmit({
      ...data,
      details,
      installments,
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
              <FormSelect
                control={form.control}
                name="supplier_id"
                label="Proveedor"
                placeholder="Seleccione un proveedor"
                options={suppliers.map((supplier) => ({
                  value: supplier.id.toString(),
                  label: supplier.business_name ?? supplier.names + " " + supplier.father_surname + " " + supplier.mother_surname,
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
                name="purchase_order_id"
                label="Orden de Compra"
                placeholder="Seleccione una orden"
                options={[
                  { value: "", label: "Ninguna" },
                  ...purchaseOrders.map((po) => ({
                    value: po.id.toString(),
                    label: po.correlativo + " - " + po.order_number,
                  })),
                ]}
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

              <DatePickerFormField
                control={form.control}
                name="issue_date"
                label="Fecha de Emisión"
                placeholder="Seleccione la fecha"
                dateFormat="dd/MM/yyyy"
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
                          step="0.01"
                          variant="primary"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="md:col-span-4 flex justify-end">
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
                          <TableCell className="text-right">{detail.quantity}</TableCell>
                          <TableCell className="text-right">
                            {parseFloat(detail.unit_price).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            {detail.subtotal.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            {parseFloat(detail.tax).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-bold text-green-600">
                            {detail.total.toFixed(2)}
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
                        <TableCell colSpan={5} className="text-right font-bold">
                          TOTAL:
                        </TableCell>
                        <TableCell className="text-right font-bold text-lg text-green-600">
                          {calculateDetailsTotal().toFixed(2)}
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

        {/* Cuotas */}
        {mode === "create" && (
          <Card>
            <CardHeader>
              <CardTitle>Cuotas (Opcional)</CardTitle>
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
                    {editingInstallmentIndex !== null ? "Actualizar" : "Agregar"}
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
                          <TableHead className="text-right">Días Vencimiento</TableHead>
                          <TableHead className="text-right">Monto</TableHead>
                          <TableHead className="text-center">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {installments.map((inst, index) => (
                          <TableRow key={index}>
                            <TableCell>Cuota {index + 1}</TableCell>
                            <TableCell className="text-right">{inst.due_days} días</TableCell>
                            <TableCell className="text-right font-semibold">
                              {parseFloat(inst.amount).toFixed(2)}
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
                          <TableCell colSpan={2} className="text-right font-bold">
                            TOTAL CUOTAS:
                          </TableCell>
                          <TableCell className="text-right font-bold text-lg text-blue-600">
                            {calculateInstallmentsTotal().toFixed(2)}
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
                        ⚠️ El total de cuotas ({calculateInstallmentsTotal().toFixed(2)}) debe ser igual al total de la compra ({calculateDetailsTotal().toFixed(2)})
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
              (mode === "create" && installments.length > 0 && !installmentsMatchTotal())
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
