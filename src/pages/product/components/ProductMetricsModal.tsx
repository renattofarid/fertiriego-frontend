import { GeneralModal } from "@/components/GeneralModal";
import FormSkeleton from "@/components/FormSkeleton";
import { SummaryCard } from "@/components/SummaryCard";
import { Badge } from "@/components/ui/badge";
import { useProductMetrics } from "@/pages/predictive/lib/predictive.hook";
import type { UrgencyLevel } from "@/pages/predictive/lib/predictive.interface";
import { Package, TrendingDown, Clock, ShoppingCart, BoxIcon } from "lucide-react";

interface Props {
  open: boolean;
  productId: number;
  onClose: () => void;
}

const urgencyConfig: Record<
  UrgencyLevel,
  { label: string; variant: "destructive" | "default" | "secondary" }
> = {
  CRITICO:     { label: "Crítico",     variant: "destructive" },
  ADVERTENCIA: { label: "Advertencia", variant: "default" },
  NORMAL:      { label: "Normal",      variant: "secondary" },
};

export default function ProductMetricsModal({ open, productId, onClose }: Props) {
  const { data, isLoading, isError } = useProductMetrics(productId);

  const m = data?.data;
  const ub = m ? (urgencyConfig[m.urgency] ?? { label: m.urgency, variant: "secondary" as const }) : null;

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title="Métricas Predictivas"
      subtitle={m?.product.name}
      icon="BrainCircuit"
      size="2xl"
    >
      {isLoading && !m ? (
        <FormSkeleton />
      ) : isError || !m ? (
        <p className="text-sm text-muted-foreground">
          No se pudieron obtener las métricas para este producto.
        </p>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary rounded-md p-2">
                <Package className="size-5" />
              </div>
              <div>
                <p className="font-semibold">{m.product.name}</p>
                <p className="text-xs text-muted-foreground">
                  {m.product.category} · {m.product.brand} · Tipo: {m.product.product_type}
                </p>
              </div>
              {ub && <Badge variant={ub.variant} className="ml-auto">{ub.label}</Badge>}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SummaryCard
              icon={<BoxIcon className="size-4" />}
              label="Stock Actual"
              value={m.current_stock.toLocaleString()}
              subLabel="unidades disponibles"
              color="primary"
            />
            <SummaryCard
              icon={<ShoppingCart className="size-4" />}
              label="Stock Entrante"
              value={m.incoming_stock.toLocaleString()}
              subLabel="en tránsito"
              color="sky"
            />
            <SummaryCard
              icon={<Clock className="size-4" />}
              label="Días Restantes"
              value={m.days_of_inventory_remaining != null ? m.days_of_inventory_remaining.toFixed(0) : "—"}
              subLabel="de inventario"
              color={
                m.days_of_inventory_remaining == null
                  ? "muted"
                  : m.days_of_inventory_remaining < 7
                  ? "red"
                  : m.days_of_inventory_remaining < 14
                  ? "amber"
                  : "green"
              }
            />
            <SummaryCard
              icon={<TrendingDown className="size-4" />}
              label="Compra Sugerida"
              value={m.suggested_purchase_qty.toLocaleString()}
              subLabel="unidades a reponer"
              color={m.suggested_purchase_qty > 0 ? "orange" : "muted"}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-xl border p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Velocidad de Ventas
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vel. diaria</span>
                  <span className="font-mono font-medium">{m.sales_velocity_daily.toFixed(4)} uds/día</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ventana de análisis</span>
                  <span className="font-mono font-medium">{m.sales_velocity_window_days} días</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Stock de Seguridad
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Días de seguridad</span>
                  <span className="font-mono font-medium">{m.safety_stock_days} días</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unidades de seguridad</span>
                  <span className="font-mono font-medium">{m.safety_stock_units.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Reabastecimiento
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lead time</span>
                  <span className="font-mono font-medium">{m.lead_time_days} días</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Punto de reorden</span>
                  <span className="font-mono font-medium">{m.reorder_point.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </GeneralModal>
  );
}
