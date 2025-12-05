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
  saleSchemaCreate,
  saleSchemaUpdate,
  type SaleSchema,
} from "../lib/sale.schema";
import {
  Loader,
  Plus,
  Trash2,
  Edit,
  FileText,
  CreditCard,
  ListCheck,
  ListChecks,
} from "lucide-react";
import { FormSelect } from "@/components/FormSelect";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import type { SaleResource } from "../lib/sale.interface";
import type { WarehouseResource } from "@/pages/warehouse/lib/warehouse.interface";
import type { ProductResource } from "@/pages/product/lib/product.interface";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import { useState, useEffect } from "react";
import { formatDecimalTrunc } from "@/lib/utils";
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
} from "../lib/sale.interface";
import { errorToast } from "@/lib/core.function";
import { GroupFormSection } from "@/components/GroupFormSection";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface SaleFormProps {
  defaultValues: Partial<SaleSchema>;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  customers: PersonResource[];
  warehouses: WarehouseResource[];
  products: ProductResource[];
  sale?: SaleResource;
}

interface DetailRow {
  product_id: string;
  product_name?: string;
  quantity: string;
  unit_price: string;
  subtotal: number;
  igv: number;
  total: number;
}

interface InstallmentRow {
  installment_number: string;
  due_days: string;
  amount: string;
}

export const SaleForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  customers,
  warehouses,
  products,
}: SaleFormProps) => {
  // Estados para detalles
  const [details, setDetails] = useState<DetailRow[]>([]);

  const [editingDetailIndex, setEditingDetailIndex] = useState<number | null>(
    null
  );
  const [currentDetail, setCurrentDetail] = useState<DetailRow>({
    product_id: "",
    quantity: "",
    unit_price: "",
    subtotal: 0,
    igv: 0,
    total: 0,
  });

  // Estados para cuotas
  const [installments, setInstallments] = useState<InstallmentRow[]>([]);
  const [editingInstallmentIndex, setEditingInstallmentIndex] = useState<
    number | null
  >(null);
  const [currentInstallment, setCurrentInstallment] = useState<InstallmentRow>({
    installment_number: "",
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
      temp_installment_number: currentInstallment.installment_number,
      temp_due_days: currentInstallment.due_days,
      temp_amount: currentInstallment.amount,
    },
  });

  // Watchers para detalles
  const selectedProductId = detailTempForm.watch("temp_product_id");
  const selectedQuantity = detailTempForm.watch("temp_quantity");
  const selectedUnitPrice = detailTempForm.watch("temp_unit_price");

  // Watchers para cuotas
  const selectedInstallmentNumber = installmentTempForm.watch(
    "temp_installment_number"
  );
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
    if (selectedInstallmentNumber !== currentInstallment.installment_number) {
      setCurrentInstallment((prev) => ({
        ...prev,
        installment_number: selectedInstallmentNumber || "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedInstallmentNumber]);

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
      mode === "create" ? saleSchemaCreate : saleSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
      details: details.length > 0 ? details : [],
      installments: installments.length > 0 ? installments : [],
    },
    mode: "onChange",
  });

  // Inicializar detalles y cuotas desde defaultValues (para modo edición)
  useEffect(() => {
    if (mode === "update" && defaultValues) {
      // Inicializar detalles
      if (defaultValues.details && defaultValues.details.length > 0) {
        const initialDetails = defaultValues.details.map((detail: any) => {
          const product = products.find(
            (p) => p.id.toString() === detail.product_id
          );
          const quantity = parseFloat(detail.quantity);
          const unitPrice = parseFloat(detail.unit_price);
          const subtotal = roundTo6Decimals(quantity * unitPrice);
          const igv = roundTo6Decimals(subtotal * 0.18);
          const total = roundTo6Decimals(subtotal + igv);

          return {
            product_id: detail.product_id,
            product_name: product?.name,
            quantity: detail.quantity,
            unit_price: detail.unit_price,
            subtotal,
            igv,
            total,
          };
        });
        setDetails(initialDetails);
        form.setValue("details", initialDetails);
      }

      // Inicializar cuotas
      if (defaultValues.installments && defaultValues.installments.length > 0) {
        const initialInstallments = defaultValues.installments.map(
          (inst: any) => ({
            installment_number: inst.installment_number,
            due_days: inst.due_days,
            amount: inst.amount,
          })
        );
        setInstallments(initialInstallments);
        form.setValue("installments", initialInstallments);
      }

      // Disparar validación después de setear valores en modo edición
      form.trigger();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Watch para el tipo de pago
  const selectedPaymentType = form.watch("payment_type");

  // Establecer fecha de emisión automáticamente al cargar el formulario
  useEffect(() => {
    // Inicializar montos de pago a 0
    if (!form.getValues("amount_cash")) {
      form.setValue("amount_cash", "0");
    }
    if (!form.getValues("amount_card")) {
      form.setValue("amount_card", "0");
    }
    if (!form.getValues("amount_yape")) {
      form.setValue("amount_yape", "0");
    }
  }, [form]);

  // Función de redondeo a 6 decimales
  const roundTo6Decimals = (value: number): number => {
    return Math.round(value * 1000000) / 1000000;
  };

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

    // Calcular subtotal, IGV (18%) y total con redondeo a 6 decimales
    const subtotal = roundTo6Decimals(quantity * unitPrice);
    const igv = roundTo6Decimals(subtotal * 0.18); // IGV 18%
    const total = roundTo6Decimals(subtotal + igv);

    const newDetail: DetailRow = {
      ...currentDetail,
      product_name: product?.name,
      subtotal,
      igv,
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
      subtotal: 0,
      igv: 0,
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

  const calculateDetailsSubtotal = () => {
    const sum = details.reduce(
      (sum, detail) => sum + (detail.subtotal || 0),
      0
    );
    return roundTo6Decimals(sum);
  };

  const calculateDetailsIGV = () => {
    const sum = details.reduce((sum, detail) => sum + (detail.igv || 0), 0);
    return roundTo6Decimals(sum);
  };

  const calculateDetailsTotal = () => {
    const sum = details.reduce((sum, detail) => sum + (detail.total || 0), 0);
    return roundTo6Decimals(sum);
  };

  // Funciones para cuotas
  const handleAddInstallment = () => {
    if (
      !currentInstallment.installment_number ||
      !currentInstallment.due_days ||
      !currentInstallment.amount
    ) {
      return;
    }

    const newAmount = parseFloat(currentInstallment.amount);
    const saleTotal = calculateDetailsTotal();

    // Calcular el total de cuotas (excluyendo la que se está editando si aplica)
    let currentInstallmentsTotal = installments.reduce((sum, inst, idx) => {
      if (editingInstallmentIndex !== null && idx === editingInstallmentIndex) {
        return sum;
      }
      return sum + parseFloat(inst.amount);
    }, 0);

    // Validar que no exceda el total de la venta
    if (currentInstallmentsTotal + newAmount > saleTotal) {
      errorToast(
        `El total de cuotas no puede exceder el total de la venta (${formatDecimalTrunc(
          saleTotal,
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
      installment_number: "",
      due_days: "",
      amount: "",
    });
    installmentTempForm.setValue("temp_installment_number", "");
    installmentTempForm.setValue("temp_due_days", "");
    installmentTempForm.setValue("temp_amount", "");
  };

  const handleEditInstallment = (index: number) => {
    const inst = installments[index];
    setCurrentInstallment(inst);
    installmentTempForm.setValue(
      "temp_installment_number",
      inst.installment_number
    );
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
    return roundTo6Decimals(sum);
  };

  const installmentsMatchTotal = () => {
    if (installments.length === 0) return true;
    const saleTotal = calculateDetailsTotal();
    const installmentsTotal = calculateInstallmentsTotal();
    return Math.abs(saleTotal - installmentsTotal) < 0.000001;
  };

  // Funciones para montos de pago
  const calculatePaymentTotal = () => {
    const cash = parseFloat(form.watch("amount_cash") || "0");
    const card = parseFloat(form.watch("amount_card") || "0");
    const yape = parseFloat(form.watch("amount_yape") || "0");
    const sum = cash + card + yape;
    return roundTo6Decimals(sum);
  };

  const paymentAmountsMatchTotal = () => {
    if (selectedPaymentType !== "CONTADO") return true;
    const saleTotal = calculateDetailsTotal();
    const paymentTotal = calculatePaymentTotal();
    return Math.abs(saleTotal - paymentTotal) < 0.000001;
  };

  const handleFormSubmit = (data: any) => {
    // Validar que si es al contado, los montos de pago deben coincidir con el total
    if (selectedPaymentType === "CONTADO" && !paymentAmountsMatchTotal()) {
      errorToast(
        `El total pagado (${formatNumber(
          calculatePaymentTotal()
        )}) debe ser igual al total de la venta (${formatNumber(
          calculateDetailsTotal()
        )})`
      );
      return;
    }

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
        )}) debe ser igual al total de la venta (${formatNumber(
          calculateDetailsTotal()
        )})`
      );
      return;
    }

    // Preparar cuotas según el tipo de pago
    let validInstallments: {
      installment_number: number;
      due_days: string;
      amount: string;
    }[];

    if (selectedPaymentType === "CONTADO") {
      // Para pagos al contado, las cuotas van vacías
      validInstallments = [];
    } else {
      // Para pagos a crédito, usar las cuotas ingresadas
      validInstallments = installments
        .filter(
          (inst) => inst.installment_number && inst.due_days && inst.amount
        )
        .map((inst) => ({
          installment_number: parseInt(inst.installment_number),
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
        <GroupFormSection
          title="Información General"
          icon={FileText}
          cols={{
            sm: 1,
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormSelect
              control={form.control}
              name="customer_id"
              label="Cliente"
              placeholder="Seleccione un cliente"
              options={customers.map((customer) => ({
                value: customer.id.toString(),
                label:
                  customer.business_name ??
                  customer.names +
                    " " +
                    customer.father_surname +
                    " " +
                    customer.mother_surname,
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
              name="serie"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serie</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: F001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="numero"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: 00000001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DatePickerFormField
              control={form.control}
              name="issue_date"
              label="Fecha de Emisión"
              placeholder="Seleccione fecha"
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
        </GroupFormSection>

        {/* Detalles */}
        <GroupFormSection
          title="Detalles de la Venta"
          icon={ListCheck}
          cols={{
            sm: 1,
          }}
        >
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
                    <Input type="number" placeholder="0" {...field} />
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
                      placeholder="0.000000"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="md:col-span-4 flex items-center justify-end">
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
                    <TableHead className="text-right">IGV (18%)</TableHead>
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
                        {formatNumber(parseFloat(detail.unit_price))}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(detail.subtotal)}
                      </TableCell>
                      <TableCell className="text-right text-orange-600">
                        {formatNumber(detail.igv)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-primary">
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
                    <TableCell colSpan={3} className="text-right font-bold">
                      TOTALES:
                    </TableCell>
                    <TableCell className="text-right font-bold text-lg">
                      {formatNumber(calculateDetailsSubtotal())}
                    </TableCell>
                    <TableCell className="text-right font-bold text-lg text-orange-600">
                      {formatNumber(calculateDetailsIGV())}
                    </TableCell>
                    <TableCell className="text-right font-bold text-lg text-primary">
                      {formatNumber(calculateDetailsTotal())}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          ) : (
            <Empty className="border border-dashed">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ListCheck />
                </EmptyMedia>
                <EmptyTitle> No hay detalles agregados</EmptyTitle>
                <EmptyDescription>
                  Agregue productos a la venta utilizando el formulario de
                  arriba.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </GroupFormSection>

        {/* Métodos de Pago - Solo mostrar si es al contado */}
        {mode === "create" && selectedPaymentType === "CONTADO" && (
          <GroupFormSection
            title="Métodos de Pago"
            icon={CreditCard}
            cols={{
              sm: 1,
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="amount_cash"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto en Efectivo</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount_card"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto con Tarjeta</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount_yape"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto Yape</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Mostrar total de pagos vs total de venta */}
            {details.length > 0 && (
              <div className="mt-4 p-4 bg-sidebar rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total de la Venta:</span>
                  <span className="text-lg font-bold text-primary">
                    {formatNumber(calculateDetailsTotal())}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Pagado:</span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatNumber(calculatePaymentTotal())}
                  </span>
                </div>
                {!paymentAmountsMatchTotal() && (
                  <Badge variant="orange">
                    El total pagado debe ser igual al total de la venta
                  </Badge>
                )}
              </div>
            )}
          </GroupFormSection>
        )}

        {/* Cuotas - Solo mostrar si es a crédito */}
        {selectedPaymentType === "CREDITO" && (
          <GroupFormSection
            title="Información General"
            icon={FileText}
            cols={{
              sm: 1,
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-sidebar rounded-lg">
              <FormField
                control={installmentTempForm.control}
                name="temp_installment_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Cuota</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={installmentTempForm.control}
                name="temp_due_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Días de Vencimiento</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="30" {...field} />
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
                    !currentInstallment.installment_number ||
                    !currentInstallment.due_days ||
                    !currentInstallment.amount
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
                        <TableHead className="text-right">
                          Días Vencimiento
                        </TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                        <TableHead className="text-center">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {installments.map((inst, index) => (
                        <TableRow key={index}>
                          <TableCell>Cuota {inst.installment_number}</TableCell>
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
                        <TableCell colSpan={2} className="text-right font-bold">
                          TOTAL CUOTAS:
                        </TableCell>
                        <TableCell className="text-right font-bold text-lg text-blue-600">
                          {formatDecimalTrunc(calculateInstallmentsTotal(), 6)}
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                {!installmentsMatchTotal() && (
                  <div className="p-4 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <p className="text-sm text-orange-800 dark:text-orange-200 font-semibold">
                      ⚠️ El total de cuotas (
                      {formatNumber(calculateInstallmentsTotal())}) debe ser
                      igual al total de la venta (
                      {formatNumber(calculateDetailsTotal())})
                    </p>
                  </div>
                )}
              </>
            ) : (
              <Empty className="border border-dashed">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <ListChecks />
                  </EmptyMedia>
                  <EmptyTitle>No hay cuotas agregadas</EmptyTitle>
                  <EmptyDescription>
                    Agregue cuotas a la venta utilizando el formulario de
                    arriba.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </GroupFormSection>
        )}

        {/* <pre>
          <code>{JSON.stringify(form.getValues(), null, 2)}</code>
          <code>{JSON.stringify(form.formState.errors, null, 2)}</code>
        </pre>
        <Button onClick={() => form.trigger()}>Button</Button> */}

        {/* Botones */}
        <div className="flex gap-4 w-full justify-end">
          <Button type="button" variant="neutral" onClick={onCancel}>
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={
              isSubmitting ||
              (mode === "create" && details.length === 0) ||
              (mode === "create" &&
                selectedPaymentType === "CONTADO" &&
                !paymentAmountsMatchTotal()) ||
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
