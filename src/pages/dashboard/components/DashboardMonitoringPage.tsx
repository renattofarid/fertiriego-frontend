import { useState, useEffect, useCallback } from "react";
import {
  PackageX,
  AlertTriangle,
  AlertCircle,
  ShoppingCart,
  DollarSign,
  Package,
  RefreshCw,
  Lightbulb,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { promiseToast } from "@/lib/core.function";
import { SearchableSelect } from "@/components/SearchableSelect";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import {
  getDashboardSummary,
  getDashboardSuggestions,
  getDashboardInventoryStatus,
} from "../lib/dashboard.actions";
import type {
  DashboardFilters,
  DashboardSummary,
  DashboardSuggestion,
  InventoryStatus,
  DashboardUrgency,
} from "../lib/dashboard.interface";
import { DASHBOARD_META } from "../lib/dashboard.interface";
import TitleComponent from "@/components/TitleComponent";
import { Button } from "@/components/ui/button";

const { MODEL, ICON } = DASHBOARD_META;

const STATUS_STYLES: Record<string, { bg: string; text: string; badge: string }> = {
  CRITICO: {
    bg: "bg-red-50 dark:bg-red-900/10",
    text: "text-red-700 dark:text-red-400",
    badge: "bg-red-100 dark:bg-red-800",
  },
  ADVERTENCIA: {
    bg: "bg-orange-50 dark:bg-orange-900/10",
    text: "text-orange-700 dark:text-orange-400",
    badge: "bg-orange-100 dark:bg-orange-800",
  },
  NORMAL: {
    bg: "bg-emerald-50 dark:bg-emerald-900/10",
    text: "text-emerald-700 dark:text-emerald-400",
    badge: "bg-emerald-100 dark:bg-emerald-800",
  },
  SIN_DATOS: {
    bg: "bg-gray-50 dark:bg-gray-900/10",
    text: "text-gray-500 dark:text-gray-400",
    badge: "bg-gray-100 dark:bg-gray-800",
  },
};

function SummaryCard({
  title,
  value,
  icon: Icon,
  variant,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  variant: "red" | "orange" | "blue" | "green" | "gray";
}) {
  const styles = {
    red: {
      bg: "bg-red-50 dark:bg-red-900/10",
      icon: "bg-red-100 dark:bg-red-800",
      text: "text-red-700 dark:text-red-400",
    },
    orange: {
      bg: "bg-orange-50 dark:bg-orange-900/10",
      icon: "bg-orange-100 dark:bg-orange-800",
      text: "text-orange-700 dark:text-orange-400",
    },
    blue: {
      bg: "bg-blue-50 dark:bg-blue-900/10",
      icon: "bg-blue-100 dark:bg-blue-800",
      text: "text-blue-700 dark:text-blue-400",
    },
    green: {
      bg: "bg-emerald-50 dark:bg-emerald-900/10",
      icon: "bg-emerald-100 dark:bg-emerald-800",
      text: "text-emerald-700 dark:text-emerald-400",
    },
    gray: {
      bg: "bg-gray-50 dark:bg-gray-900/10",
      icon: "bg-gray-100 dark:bg-gray-800",
      text: "text-gray-600 dark:text-gray-400",
    },
  };

  const s = styles[variant];
  return (
    <div className={cn("rounded-lg p-4", s.bg)}>
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-md shrink-0", s.icon)}>
          <Icon className={cn("h-5 w-5", s.text)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground mb-0.5">{title}</p>
          <p className={cn("text-2xl font-bold", s.text)}>{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardMonitoringPage() {
  const [filters, setFilters] = useState<DashboardFilters>({});
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [suggestions, setSuggestions] = useState<DashboardSuggestion[]>([]);
  const [inventory, setInventory] = useState<InventoryStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { data: warehousesData = [] } = useAllWarehouses();
  const warehouses = Array.isArray(warehousesData) ? warehousesData : [];

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    const promise = Promise.all([
      getDashboardSummary(filters),
      getDashboardSuggestions(filters),
      getDashboardInventoryStatus(filters),
    ]);

    promiseToast(promise, {
      loading: "Cargando datos del monitoreo...",
      success: "Datos actualizados correctamente",
      error: "Error al cargar los datos del dashboard",
    });

    try {
      const [summaryRes, suggestionsRes, inventoryRes] = await promise;
      setSummary(summaryRes.data);
      setSuggestions(suggestionsRes.data);
      setInventory(inventoryRes.data);
    } catch {
      // handled by toast
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const warehouseOptions = warehouses.map((w: any) => ({
    value: String(w.id),
    label: w.name as string,
  }));

  const urgencyOptions = [
    { value: "CRITICO", label: "Crítico" },
    { value: "ADVERTENCIA", label: "Advertencia" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <TitleComponent
          title={MODEL.name}
          subtitle={MODEL.description}
          icon={ICON}
        />
        <Button
          variant="outline"
          size="sm"
          className="gap-2 shrink-0"
          onClick={fetchAll}
          disabled={isLoading}
        >
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          Actualizar
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <SearchableSelect
          options={warehouseOptions}
          value={String(filters.warehouse_id ?? "")}
          onChange={(val) =>
            setFilters((prev) => ({ ...prev, warehouse_id: val ? Number(val) : null }))
          }
          placeholder="Todos los almacenes"
          className="w-full sm:w-[200px]"
        />
        <SearchableSelect
          options={urgencyOptions}
          value={filters.urgency ?? ""}
          onChange={(val) =>
            setFilters((prev) => ({ ...prev, urgency: (val as DashboardUrgency) || null }))
          }
          placeholder="Todas las urgencias"
          className="w-full sm:w-[180px]"
        />
      </div>

      {/* Summary Section */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Resumen General
        </h2>
        <div
          className={cn(
            "grid gap-3 grid-cols-2 lg:grid-cols-3 transition-opacity duration-200",
            isLoading && "opacity-40 pointer-events-none"
          )}
        >
          <SummaryCard
            title="Sin stock"
            value={summary?.products_out_of_stock ?? "—"}
            icon={PackageX}
            variant="red"
          />
          <SummaryCard
            title="Productos críticos"
            value={summary?.products_critical ?? "—"}
            icon={AlertTriangle}
            variant="orange"
          />
          <SummaryCard
            title="En riesgo"
            value={summary?.products_at_risk ?? "—"}
            icon={AlertCircle}
            variant="orange"
          />
          <SummaryCard
            title="OC pendientes"
            value={summary?.pending_purchase_orders ?? "—"}
            icon={ShoppingCart}
            variant="blue"
          />
          <SummaryCard
            title="Inversión estimada"
            value={
              summary
                ? `S/ ${summary.estimated_investment_required.toLocaleString("es-PE")}`
                : "—"
            }
            icon={DollarSign}
            variant="green"
          />
          <SummaryCard
            title="Total evaluados"
            value={summary?.total_products_evaluated ?? "—"}
            icon={Package}
            variant="gray"
          />
        </div>
        {summary && (
          <p className="text-xs text-muted-foreground text-right">
            Calculado: {summary.calculated_at}
          </p>
        )}
      </section>

      {/* Inventory Status Section */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Estado de Inventario
        </h2>
        <div
          className={cn(
            "rounded-xl border bg-card p-5 space-y-4 transition-opacity duration-200",
            isLoading && "opacity-40 pointer-events-none"
          )}
        >
          {inventory ? (
            <>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="font-medium">
                  Total productos:{" "}
                  <span className="text-primary font-bold">
                    {inventory.total_products.toLocaleString("es-PE")}
                  </span>
                </span>
                <span className="text-muted-foreground">|</span>
                <span className="font-medium">
                  Sobre stock:{" "}
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    {inventory.over_stock_products.toLocaleString("es-PE")}
                  </span>{" "}
                  <span className="text-muted-foreground text-xs">
                    ({inventory.over_stock_percentage}%)
                  </span>
                </span>
              </div>

              <div className="space-y-2">
                {inventory.distribution.map((item) => {
                  const style = STATUS_STYLES[item.status] ?? STATUS_STYLES["SIN_DATOS"];
                  const label =
                    item.status === "SIN_DATOS"
                      ? "Sin datos"
                      : item.status.charAt(0) + item.status.slice(1).toLowerCase();
                  return (
                    <div key={item.status} className="flex items-center gap-3">
                      <span
                        className={cn(
                          "text-xs font-semibold px-2 py-0.5 rounded-full w-28 text-center",
                          style.bg,
                          style.text
                        )}
                      >
                        {label}
                      </span>
                      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all", style.badge)}
                          style={{ width: `${Math.max(item.percentage, item.count > 0 ? 0.5 : 0)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-16 text-right">
                        {item.count.toLocaleString("es-PE")}
                      </span>
                      <span className="text-xs text-muted-foreground w-14 text-right">
                        {item.percentage}%
                      </span>
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-muted-foreground text-right">
                Calculado: {inventory.calculated_at}
              </p>
            </>
          ) : (
            <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
              {isLoading ? "Cargando..." : "Sin datos"}
            </div>
          )}
        </div>
      </section>

      {/* Suggestions Section */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Sugerencias Automáticas
        </h2>
        <div
          className={cn(
            "rounded-xl border bg-card p-5 transition-opacity duration-200",
            isLoading && "opacity-40 pointer-events-none"
          )}
        >
          {suggestions.length > 0 ? (
            <div className="space-y-2">
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 text-sm"
                >
                  <Lightbulb className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                  <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(s, null, 2)}</pre>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
              <BarChart3 className="h-8 w-8 opacity-30" />
              <p className="text-sm">
                {isLoading ? "Cargando sugerencias..." : "No hay sugerencias disponibles por el momento."}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
