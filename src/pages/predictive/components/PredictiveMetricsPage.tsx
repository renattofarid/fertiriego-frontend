import { useParams } from "react-router-dom";
import { useProductMetrics } from "../lib/predictive.hook";
import TitleComponent from "@/components/TitleComponent";
import { SummaryCard } from "@/components/SummaryCard";
import { Badge } from "@/components/ui/badge";
import BackButton from "@/components/BackButton";
import FormSkeleton from "@/components/FormSkeleton";
import { PREDICTIVE_META, PREDICTIVE_ROUTE } from "../lib/predictive.interface";
import type { UrgencyLevel } from "../lib/predictive.interface";
import {
  Package,
  TrendingDown,
  Clock,
  ShoppingCart,
  BoxIcon,
} from "lucide-react";

const { ICON } = PREDICTIVE_META;

const urgencyConfig: Record<
  UrgencyLevel,
  { label: string; variant: "destructive" | "default" | "secondary" }
> = {
  CRITICO:     { label: "Crítico",     variant: "destructive" },
  ADVERTENCIA: { label: "Advertencia", variant: "default" },
  NORMAL:      { label: "Normal",      variant: "secondary" },
};

export default function PredictiveMetricsPage() {
  const { id } = useParams<{ id: string }>();
  const productId = id ? Number(id) : null;

  const { data, isLoading, isError } = useProductMetrics(productId);

  if (isLoading) return <FormSkeleton />;

  if (isError || !data) {
    return (
      <div className="space-y-4">
        <BackButton route={PREDICTIVE_ROUTE} name="Alertas" />
        <p className="text-muted-foreground text-sm">
          No se pudieron obtener las métricas para este producto.
        </p>
      </div>
    );
  }

  const m = data.data;
  const ub = urgencyConfig[m.urgency] ?? { label: m.urgency, variant: "secondary" as const };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <TitleComponent
          title="Métricas Predictivas"
          subtitle={m.product.name}
          icon={ICON}
        />
        <BackButton route={PREDICTIVE_ROUTE} name="Alertas" />
      </div>

      {/* Product info */}
      <div className="rounded-xl border p-4 space-y-2">
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
          <Badge variant={ub.variant} className="ml-auto">
            {ub.label}
          </Badge>
        </div>
      </div>

      {/* Summary cards */}
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
          value={m.days_of_inventory_remaining.toFixed(0)}
          subLabel="de inventario"
          color={
            m.days_of_inventory_remaining < 7
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

      {/* Detailed metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl border p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Velocidad de Ventas
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vel. diaria</span>
              <span className="font-mono font-medium">
                {m.sales_velocity_daily.toFixed(4)} uds/día
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ventana de análisis</span>
              <span className="font-mono font-medium">
                {m.sales_velocity_window_days} días
              </span>
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
  );
}
