"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { GeneralModal } from "@/components/GeneralModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Form } from "@/components/ui/form";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { FormSelect } from "@/components/FormSelect";
import { SummaryCard } from "@/components/SummaryCard";
import { useProduct } from "@/pages/product/lib/product.hook";
import { useCalculateReplenishment } from "../lib/predictive.hook";
import type { ReplenishmentDetail, ReplenishmentResponse, UrgencyLevel } from "../lib/predictive.interface";
import {
  AlertTriangle,
  CheckCircle,
  Loader2,
  Play,
  XCircle,
  HelpCircle,
  PackageSearch,
} from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  warehouses: { id: number; name: string }[];
}

interface CalcFormValues {
  product_id: string;
  warehouse_id: string;
}

const urgencyBadge: Record<UrgencyLevel, { label: string; variant: "destructive" | "default" | "secondary" }> = {
  CRITICO:     { label: "Crítico",    variant: "destructive" },
  ADVERTENCIA: { label: "Advertencia", variant: "default" },
  NORMAL:      { label: "Normal",      variant: "secondary" },
};

function DetailRow({ item }: { item: ReplenishmentDetail }) {
  const ub = urgencyBadge[item.urgency] ?? { label: item.urgency, variant: "secondary" as const };
  return (
    <div className="rounded-lg border p-3 space-y-1 text-xs">
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-sm leading-tight">{item.product.name}</p>
        <Badge variant={ub.variant} className="shrink-0">{ub.label}</Badge>
      </div>
      <p className="text-muted-foreground">{item.product.category} · {item.product.brand}</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-1 text-muted-foreground">
        <span>Stock actual: <span className="text-foreground font-mono">{item.current_stock.toLocaleString()}</span></span>
        <span>Vel. venta: <span className="text-foreground font-mono">{item.sales_velocity_daily.toFixed(4)}/día</span></span>
        <span>Días restantes: <span className="text-foreground font-mono">{item.days_of_inventory_remaining != null ? item.days_of_inventory_remaining.toFixed(0) : "—"}</span></span>
        <span>Punto reorden: <span className="text-foreground font-mono">{item.reorder_point.toFixed(2)}</span></span>
        <span>Compra sugerida: <span className="text-foreground font-mono">{item.suggested_purchase_qty.toLocaleString()}</span></span>
        <span>Stock seguridad: <span className="text-foreground font-mono">{item.safety_stock_units.toFixed(2)}</span></span>
      </div>
    </div>
  );
}

export default function PredictiveCalcDialog({ open, onClose, warehouses }: Props) {
  const { mutateAsync, isPending } = useCalculateReplenishment();

  const form = useForm<CalcFormValues>({
    defaultValues: { product_id: "", warehouse_id: "" },
  });

  const [result, setResult] = useState<ReplenishmentResponse | null>(null);

  const warehouseOptions = [
    { value: "", label: "Todos los almacenes" },
    ...warehouses.map((w) => ({ value: String(w.id), label: w.name })),
  ];

  const handleRun = async (values: CalcFormValues) => {
    const data = await mutateAsync({
      product_id: values.product_id ? Number(values.product_id) : null,
      warehouse_id: values.warehouse_id ? Number(values.warehouse_id) : null,
    });
    setResult(data);
  };

  const handleClose = () => {
    form.reset();
    setResult(null);
    onClose();
  };

  const summary = result?.data?.summary;

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Calcular Reabastecimiento"
      subtitle="Ejecuta el algoritmo predictivo para evaluar el inventario"
      icon="BrainCircuit"
      size="4xl"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleRun)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <FormSelectAsync
              control={form.control}
              name="product_id"
              label="Producto"
              placeholder="Todos los productos"
              useQueryHook={useProduct}
              mapOptionFn={(p) => ({ value: String(p.id), label: p.name })}
            />
            <FormSelect
              control={form.control}
              name="warehouse_id"
              label="Almacén"
              placeholder="Todos los almacenes"
              options={warehouseOptions}
            />
          </div>

          <Button type="submit" disabled={isPending} className="w-full sm:w-auto gap-2">
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {isPending ? "Calculando..." : "Ejecutar Algoritmo"}
          </Button>
        </form>
      </Form>

      {result && summary && (
        <div className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground">{result.message}</p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <SummaryCard
              icon={<PackageSearch className="size-4" />}
              label="Evaluados"
              value={String(summary.total_evaluados)}
              color="primary"
            />
            <SummaryCard
              icon={<XCircle className="size-4" />}
              label="Críticos"
              value={String(summary.criticos)}
              color="red"
            />
            <SummaryCard
              icon={<AlertTriangle className="size-4" />}
              label="Advertencia"
              value={String(summary.advertencia)}
              color="amber"
            />
            <SummaryCard
              icon={<CheckCircle className="size-4" />}
              label="Normal"
              value={String(summary.normal)}
              color="green"
            />
            <SummaryCard
              icon={<HelpCircle className="size-4" />}
              label="Sin Datos"
              value={String(summary.sin_datos)}
              color="muted"
            />
          </div>

          {result.data.details.length > 0 && (
            <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Detalle por producto
              </p>
              {result.data.details.map((d) => (
                <DetailRow key={d.product.id} item={d} />
              ))}
            </div>
          )}
        </div>
      )}
    </GeneralModal>
  );
}
