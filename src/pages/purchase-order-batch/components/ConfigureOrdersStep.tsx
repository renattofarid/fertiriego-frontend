import { memo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { Form } from "@/components/ui/form";
import { FormSelect } from "@/components/FormSelect";
import { FormSwitch } from "@/components/FormSwitch";
import {
  ArrowLeft,
  Building2,
  Loader2,
  Package,
  Send,
  Trash2,
  UserX,
} from "lucide-react";
import { createBatchOrders } from "../lib/purchase-order-batch.actions";
import type {
  BatchOrderResource,
  LotOrderConfig,
} from "../lib/purchase-order-batch.interface";
import { errorToast } from "@/lib/core.function";
import { useWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import { useSuppliers } from "@/pages/supplier/lib/supplier.hook";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { formatCurrency } from "@/lib/formatCurrency";
import { CURRENCIES } from "@/pages/purchase-order/lib/purchase-order.interface";

const PAYMENT_OPTIONS = [
  { value: "CONTADO", label: "Contado" },
  { value: "CREDITO", label: "Crédito" },
];

type OrdersForm = { orders: LotOrderConfig[] };

// ─── LotItemsTable ───────────────────────────────────────────────────────────
// Uses useFieldArray for stable field.id keys → React reconciles by key →
// inputs never lose focus. Direct form.register with real array indices
// ensures submit always captures the current DOM value.

interface LotItemsTableProps {
  lotIndex: number;
  form: UseFormReturn<OrdersForm>;
  currencySymbol: string;
}

const LotItemsTable = memo(function LotItemsTable({
  lotIndex,
  form,
  currencySymbol,
}: LotItemsTableProps) {
  const { fields: itemFields, remove } = useFieldArray({
    control: form.control,
    name: `orders.${lotIndex}.items` as any,
  });

  const watchedItems = form.watch(`orders.${lotIndex}.items`);

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      {/* Desktop */}
      <table className="hidden w-full text-sm md:table">
        <thead>
          <tr className="border-b bg-muted/50 text-left">
            <th className="px-3 py-2 font-medium">Producto</th>
            <th className="px-3 py-2 text-right font-medium">Cantidad</th>
            <th className="px-3 py-2 text-right font-medium">P. Unit.</th>
            <th className="px-3 py-2 text-right font-medium">Subtotal</th>
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {itemFields.map((field, i) => {
            const item = watchedItems?.[i];
            if (!item?.selected) return null;
            const subtotal =
              Number(item.quantity_requested) *
              Number(item.unit_price_estimated);
            return (
              <tr key={field.id}>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Package className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="font-medium leading-tight">
                      {item.product_name}
                    </span>
                    {item.urgency_at_creation && (
                      <Badge
                        variant={
                          item.urgency_at_creation === "CRITICO"
                            ? "destructive"
                            : "secondary"
                        }
                        className="shrink-0 text-xs"
                      >
                        {item.urgency_at_creation}
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    min={item.min_quantity ?? 1}
                    step={1}
                    className="ml-auto h-7 w-24 text-right text-sm"
                    {...form.register(
                      `orders.${lotIndex}.items.${i}.quantity_requested`
                    )}
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    min={0}
                    step={0.000001}
                    className="ml-auto h-7 w-28 text-right text-sm"
                    {...form.register(
                      `orders.${lotIndex}.items.${i}.unit_price_estimated`
                    )}
                  />
                </td>
                <td className="px-3 py-2 text-right font-bold tabular-nums text-primary">
                  {formatCurrency(subtotal, { currencySymbol, decimals: 2 })}
                </td>
                <td className="px-3 py-2 text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => remove(i)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Mobile */}
      <div className="divide-y md:hidden">
        {itemFields.map((field, i) => {
          const item = watchedItems?.[i];
          if (!item?.selected) return null;
          const subtotal =
            Number(item.quantity_requested) *
            Number(item.unit_price_estimated);
          return (
            <div key={field.id} className="space-y-2 p-3">
              <div className="flex items-center gap-2">
                <Package className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="flex-1 text-sm font-medium">
                  {item.product_name}
                </span>
                {item.urgency_at_creation && (
                  <Badge
                    variant={
                      item.urgency_at_creation === "CRITICO"
                        ? "destructive"
                        : "secondary"
                    }
                    className="text-xs"
                  >
                    {item.urgency_at_creation}
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Cantidad</Label>
                  <Input
                    type="number"
                    min={item.min_quantity ?? 1}
                    step={1}
                    className="h-7 text-right text-sm"
                    {...form.register(
                      `orders.${lotIndex}.items.${i}.quantity_requested`
                    )}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">P. Unit.</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.000001}
                    className="h-7 text-right text-sm"
                    {...form.register(
                      `orders.${lotIndex}.items.${i}.unit_price_estimated`
                    )}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between border-t pt-1 text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-bold tabular-nums text-primary">
                  {formatCurrency(subtotal, { currencySymbol, decimals: 2 })}
                </span>
              </div>
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => remove(i)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// ─── ConfigureOrdersStep ─────────────────────────────────────────────────────

interface ConfigureOrdersStepProps {
  lotConfigs: LotOrderConfig[];
  onBack: () => void;
  onNext: (result: BatchOrderResource[]) => void;
}

export default function ConfigureOrdersStep({
  lotConfigs,
  onBack,
  onNext,
}: ConfigureOrdersStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OrdersForm>({ defaultValues: { orders: lotConfigs } });
  const { fields } = useFieldArray({ control: form.control, name: "orders" });
  const watchedOrders = form.watch("orders");

  const { data: warehousesData } = useWarehouses();
  const warehouseOptions = (warehousesData?.data ?? []).map((w) => ({
    value: w.id.toString(),
    label: w.name,
  }));

  const currencyOptions = CURRENCIES.map((c) => ({
    value: c.value,
    label: c.label,
  }));

  const calcLotTotal = (lotIndex: number) => {
    const cfg = watchedOrders[lotIndex];
    if (!cfg) return 0;
    return cfg.items
      .filter((i) => i.selected)
      .reduce(
        (sum, item) =>
          sum +
          Number(item.quantity_requested) * Number(item.unit_price_estimated),
        0
      );
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    for (const cfg of values.orders) {
      if (cfg.supplier_id === null && !cfg.supplier_id_selected) {
        errorToast(`Selecciona un proveedor para el lote: ${cfg.supplier_name}`);
        return;
      }
      if (!cfg.warehouse_id) {
        errorToast(
          `Selecciona un almacén para el proveedor: ${cfg.supplier_name}`
        );
        return;
      }
      if (!cfg.items.filter((i) => i.selected).length) {
        errorToast(`El lote de ${cfg.supplier_name} no tiene ítems activos.`);
        return;
      }
      if (!cfg.expected_date) {
        errorToast(
          `Selecciona la fecha esperada para el lote: ${cfg.supplier_name}`
        );
        return;
      }
      for (const item of cfg.items) {
        if (!item.selected) continue;
        const qty = Number(item.quantity_requested);
        if (!Number.isInteger(qty) || qty < item.min_quantity) {
          errorToast(
            `La cantidad de "${item.product_name}" debe ser un entero mayor o igual a ${item.min_quantity}.`
          );
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      const result = await createBatchOrders({
        orders: values.orders.map((cfg) => ({
          supplier_id: cfg.supplier_id ?? Number(cfg.supplier_id_selected),
          warehouse_id: Number(cfg.warehouse_id),
          currency: cfg.currency,
          apply_igv: cfg.apply_igv,
          payment_type: cfg.payment_type || null,
          days:
            cfg.payment_type === "CREDITO" ? Number(cfg.days) || null : null,
          expected_date: cfg.expected_date || null,
          observations: cfg.observations || null,
          items: cfg.items
            .filter((i) => i.selected)
            .map((item) => ({
              product_id: item.product_id,
              quantity_requested: Number(item.quantity_requested),
              unit_price_estimated: Number(item.unit_price_estimated),
              suggestion_reason: item.suggestion_reason,
              urgency_at_creation: item.urgency_at_creation,
            })),
        })),
      });
      onNext(result.data);
    } catch (e: any) {
      errorToast(
        e?.response?.data?.message ?? "Error al generar órdenes de compra"
      );
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <Form {...form}>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Configura los parámetros para cada lote antes de generarlos.
        </p>

        <div className="divide-y divide-border">
          {fields.map((field, lotIndex) => {
            const cfg = watchedOrders[lotIndex];
            if (!cfg) return null;
            const activeItemCount = cfg.items.filter((i) => i.selected).length;
            const total = calcLotTotal(lotIndex);
            const currencySymbol =
              CURRENCIES.find((c) => c.value === cfg.currency)?.symbol ?? "S/.";
            const isCredito = cfg.payment_type === "CREDITO";

            return (
              <div
                key={field.id}
                className="space-y-4 py-5 first:pt-0 last:pb-0"
              >
                {/* Lot header */}
                <div className="flex items-center gap-2">
                  {cfg.supplier_id === null ? (
                    <UserX className="h-4 w-4 shrink-0 text-yellow-600 dark:text-yellow-400" />
                  ) : (
                    <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className="flex-1 text-sm font-semibold">
                    {cfg.supplier_name}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {activeItemCount} ítem(s)
                  </Badge>
                  <span className="text-sm font-bold text-primary tabular-nums">
                    {formatCurrency(cfg.apply_igv ? total * 1.18 : total, {
                      currencySymbol,
                      decimals: 2,
                    })}
                  </span>
                </div>

                {/* Config grid */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {cfg.supplier_id === null && (
                    <div className="col-span-2 lg:col-span-2">
                      <FormSelectAsync
                        control={form.control}
                        name={`orders.${lotIndex}.supplier_id_selected` as any}
                        label="Proveedor *"
                        placeholder="Buscar y asignar proveedor..."
                        required
                        useQueryHook={useSuppliers}
                        mapOptionFn={(p: PersonResource) => ({
                          value: p.id.toString(),
                          label:
                            p.business_name ??
                            `${p.names} ${p.father_surname}`,
                          description: p.number_document,
                        })}
                      />
                    </div>
                  )}
                  <FormSelect
                    control={form.control}
                    name={`orders.${lotIndex}.warehouse_id` as any}
                    label="Almacén *"
                    placeholder="Selecciona almacén"
                    options={warehouseOptions}
                  />
                  <FormSelect
                    control={form.control}
                    name={`orders.${lotIndex}.currency` as any}
                    label="Moneda"
                    placeholder=""
                    options={currencyOptions}
                  />
                  <FormSelect
                    control={form.control}
                    name={`orders.${lotIndex}.payment_type` as any}
                    label="Tipo de Pago"
                    placeholder=""
                    options={PAYMENT_OPTIONS}
                  />
                  <FormSwitch
                    control={form.control}
                    name={`orders.${lotIndex}.apply_igv` as any}
                    label="Aplicar IGV"
                    text="IGV 18%"
                  />
                  {isCredito && (
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">
                        Días de crédito
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="Ej: 30"
                        {...form.register(`orders.${lotIndex}.days`)}
                      />
                    </div>
                  )}
                  <DatePickerFormField
                    control={form.control}
                    name={`orders.${lotIndex}.expected_date` as any}
                    label="Fecha esperada *"
                    placeholder="Selecciona una fecha"
                  />
                </div>

                <Textarea
                  placeholder="Observaciones opcionales..."
                  className="resize-none"
                  rows={2}
                  {...form.register(`orders.${lotIndex}.observations`)}
                />

                <LotItemsTable
                  lotIndex={lotIndex}
                  form={form}
                  currencySymbol={currencySymbol}
                />

                {/* Total row */}
                <div className="flex items-center justify-end gap-2 text-sm">
                  <span className="text-muted-foreground">
                    Total estimado
                    {cfg.apply_igv && (
                      <span className="ml-1 text-xs">(+ IGV 18%)</span>
                    )}
                    :
                  </span>
                  <span className="font-bold text-primary tabular-nums">
                    {formatCurrency(cfg.apply_igv ? total * 1.18 : total, {
                      currencySymbol,
                      decimals: 2,
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between pt-2">
          <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Generar órdenes de compra
          </Button>
        </div>
      </div>
    </Form>
  );
}
