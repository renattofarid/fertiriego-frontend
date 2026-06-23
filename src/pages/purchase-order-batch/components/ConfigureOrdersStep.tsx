import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Building2,
  Loader2,
  Package,
  Send,
  Trash2,
} from "lucide-react";
import { createBatchOrders } from "../lib/purchase-order-batch.actions";
import type {
  BatchOrderResource,
  LotOrderConfig,
} from "../lib/purchase-order-batch.interface";
import { errorToast } from "@/lib/core.function";
import { useWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import { formatCurrency } from "@/lib/formatCurrency";
import { CURRENCIES } from "@/pages/purchase-order/lib/purchase-order.interface";

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
  const [configs, setConfigs] = useState<LotOrderConfig[]>(lotConfigs);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: warehousesData } = useWarehouses();
  const warehouses = warehousesData?.data ?? [];

  const updateConfig = (
    index: number,
    field: keyof LotOrderConfig,
    value: any
  ) => {
    setConfigs((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  const updateItem = (
    lotIndex: number,
    itemIndex: number,
    field: "quantity_requested" | "unit_price_estimated",
    value: string
  ) => {
    setConfigs((prev) =>
      prev.map((c, i) => {
        if (i !== lotIndex) return c;
        const newItems = c.items.map((item, j) =>
          j === itemIndex ? { ...item, [field]: value } : item
        );
        return { ...c, items: newItems };
      })
    );
  };

  const removeItem = (lotIndex: number, itemIndex: number) => {
    setConfigs((prev) =>
      prev.map((c, i) => {
        if (i !== lotIndex) return c;
        return { ...c, items: c.items.filter((_, j) => j !== itemIndex) };
      })
    );
  };

  const calcLotTotal = (config: LotOrderConfig) =>
    config.items
      .filter((i) => i.selected)
      .reduce(
        (sum, item) =>
          sum +
          Number(item.quantity_requested) * Number(item.unit_price_estimated),
        0
      );

  const handleSubmit = async () => {
    for (const cfg of configs) {
      if (!cfg.warehouse_id) {
        errorToast(
          `Selecciona un almacén para el proveedor: ${cfg.supplier_name}`
        );
        return;
      }
      const activeItems = cfg.items.filter((i) => i.selected);
      if (activeItems.length === 0) {
        errorToast(`El lote de ${cfg.supplier_name} no tiene ítems activos.`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const result = await createBatchOrders({
        orders: configs.map((cfg) => ({
          supplier_id: cfg.supplier_id,
          warehouse_id: Number(cfg.warehouse_id),
          currency: cfg.currency,
          apply_igv: cfg.apply_igv,
          payment_type: cfg.payment_type || null,
          days:
            cfg.payment_type === "CREDITO" ? (Number(cfg.days) || null) : null,
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
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Configura los parámetros para cada lote antes de generarlos.
        </p>
      </div>

      {configs.map((cfg, lotIndex) => {
        const activeItems = cfg.items.filter((i) => i.selected);
        const total = calcLotTotal(cfg);
        const currencySymbol =
          CURRENCIES.find((c) => c.value === cfg.currency)?.symbol ?? "S/.";

        return (
          <Card key={cfg.supplier_id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {cfg.supplier_name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {activeItems.length} ítem(s)
                  </Badge>
                  <span className="font-bold text-primary">
                    {formatCurrency(total, {
                      currencySymbol,
                      decimals: 2,
                    })}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Parámetros del lote */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Almacén *</Label>
                  <Select
                    value={cfg.warehouse_id}
                    onValueChange={(v) =>
                      updateConfig(lotIndex, "warehouse_id", v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona almacén" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((w) => (
                        <SelectItem key={w.id} value={w.id.toString()}>
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Moneda</Label>
                  <Select
                    value={cfg.currency}
                    onValueChange={(v) =>
                      updateConfig(lotIndex, "currency", v as "PEN" | "USD")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Tipo de Pago</Label>
                  <Select
                    value={cfg.payment_type}
                    onValueChange={(v) =>
                      updateConfig(lotIndex, "payment_type", v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CONTADO">Contado</SelectItem>
                      <SelectItem value="CREDITO">Crédito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {cfg.payment_type === "CREDITO" && (
                  <div className="space-y-1.5">
                    <Label>Días de crédito</Label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="Ej: 30"
                      value={cfg.days}
                      onChange={(e) =>
                        updateConfig(lotIndex, "days", e.target.value)
                      }
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label>Fecha esperada</Label>
                  <Input
                    type="date"
                    value={cfg.expected_date}
                    onChange={(e) =>
                      updateConfig(lotIndex, "expected_date", e.target.value)
                    }
                  />
                </div>

                <div className="flex items-center gap-3 pt-5">
                  <Switch
                    checked={cfg.apply_igv}
                    onCheckedChange={(v) =>
                      updateConfig(lotIndex, "apply_igv", v)
                    }
                    id={`igv-${lotIndex}`}
                  />
                  <Label htmlFor={`igv-${lotIndex}`}>Aplicar IGV (18%)</Label>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Observaciones</Label>
                <Textarea
                  placeholder="Observaciones opcionales..."
                  className="resize-none"
                  rows={2}
                  value={cfg.observations}
                  onChange={(e) =>
                    updateConfig(lotIndex, "observations", e.target.value)
                  }
                />
              </div>

              {/* Tabla de ítems */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left px-3 py-2 font-medium">
                        Producto
                      </th>
                      <th className="text-right px-3 py-2 font-medium w-28">
                        Cantidad
                      </th>
                      <th className="text-right px-3 py-2 font-medium w-32">
                        P. Unit.
                      </th>
                      <th className="text-right px-3 py-2 font-medium w-28">
                        Subtotal
                      </th>
                      <th className="w-10 px-2 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cfg.items
                      .filter((i) => i.selected)
                      .map((item, itemDisplayIdx) => {
                        const itemIndex = cfg.items.findIndex(
                          (i) => i.product_id === item.product_id
                        );
                        const subtotal =
                          Number(item.quantity_requested) *
                          Number(item.unit_price_estimated);
                        return (
                          <tr
                            key={item.product_id}
                            className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                          >
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-2">
                                <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
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
                                    className="text-xs shrink-0"
                                  >
                                    {item.urgency_at_creation}
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <Input
                                type="number"
                                min={0.01}
                                step={0.01}
                                className="h-7 text-right text-sm"
                                value={item.quantity_requested}
                                onChange={(e) =>
                                  updateItem(
                                    lotIndex,
                                    itemIndex,
                                    "quantity_requested",
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                            <td className="px-3 py-2">
                              <Input
                                type="number"
                                min={0}
                                step={0.000001}
                                className="h-7 text-right text-sm"
                                value={item.unit_price_estimated}
                                onChange={(e) =>
                                  updateItem(
                                    lotIndex,
                                    itemIndex,
                                    "unit_price_estimated",
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                            <td className="px-3 py-2 text-right font-bold text-primary">
                              {formatCurrency(subtotal, {
                                currencySymbol,
                                decimals: 2,
                              })}
                            </td>
                            <td className="px-2 py-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() =>
                                  removeItem(lotIndex, itemIndex)
                                }
                              >
                                <Trash2 className="h-3.5 w-3.5 text-red-500" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t bg-muted/20">
                      <td
                        colSpan={3}
                        className="px-3 py-2 text-right text-sm font-medium text-muted-foreground"
                      >
                        Total estimado
                        {cfg.apply_igv && (
                          <span className="ml-1 text-xs">(+ IGV 18%)</span>
                        )}
                        :
                      </td>
                      <td className="px-3 py-2 text-right font-bold text-primary">
                        {formatCurrency(
                          cfg.apply_igv ? total * 1.18 : total,
                          { currencySymbol, decimals: 2 }
                        )}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          Generar órdenes de compra
        </Button>
      </div>
    </div>
  );
}

