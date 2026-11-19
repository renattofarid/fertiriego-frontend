import { useMemo, useState, useEffect, useCallback } from "react";
import {
  PackageX,
  AlertTriangle,
  AlertCircle,
  ShoppingCart,
  DollarSign,
  Package,
  RefreshCw,
  Boxes,
  TrendingUp,
} from "lucide-react";
import { Pie, PieChart, Cell } from "recharts";
import { cn } from "@/lib/utils";
import { promiseToast } from "@/lib/core.function";
import { SearchableSelect } from "@/components/SearchableSelect";
import { DataTable } from "@/components/DataTable";
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
import {
  URGENCY_ORDER,
  getUrgencyStyle,
  urgencyLabel,
} from "../lib/dashboard.constants";
import { DashboardSuggestionsColumns } from "./DashboardSuggestionsColumns";
import TitleComponent from "@/components/TitleComponent";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const { MODEL, ICON } = DASHBOARD_META;

function BentoTile({
  className,
  style,
  children,
}: {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <div
      style={style}
      className={cn("flex flex-col rounded-xl border bg-card p-4 sm:p-5", className)}
    >
      {children}
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

  const sortedSuggestions = useMemo(
    () =>
      [...suggestions].sort(
        (a, b) =>
          (URGENCY_ORDER[a.urgency] ?? 99) - (URGENCY_ORDER[b.urgency] ?? 99),
      ),
    [suggestions],
  );

  const totalSuggestedInvestment = useMemo(
    () => suggestions.reduce((acc, s) => acc + s.estimated_cost, 0),
    [suggestions],
  );

  const distributionChartData = useMemo(
    () =>
      (inventory?.distribution ?? [])
        .filter((item) => item.count > 0)
        .map((item) => ({
          status: item.status,
          count: item.count,
          percentage: item.percentage,
          fill: getUrgencyStyle(item.status).hex,
        })),
    [inventory],
  );

  const distributionChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    for (const item of inventory?.distribution ?? []) {
      config[item.status] = {
        label: urgencyLabel(item.status),
        color: getUrgencyStyle(item.status).hex,
      };
    }
    return config;
  }, [inventory]);

  const fmt = (n?: number) => (summary ? (n ?? 0).toLocaleString("es-PE") : "—");

  const kpis = [
    {
      title: "Sin stock",
      value: fmt(summary?.products_out_of_stock),
      description: "Productos agotados",
      icon: PackageX,
      iconClass: "text-red-500",
      valueClass:
        summary && summary.products_out_of_stock > 0
          ? "text-red-600 dark:text-red-400"
          : "",
    },
    {
      title: "Críticos",
      value: fmt(summary?.products_critical),
      description: "Requieren atención inmediata",
      icon: AlertTriangle,
      iconClass: "text-orange-500",
      valueClass:
        summary && summary.products_critical > 0
          ? "text-orange-600 dark:text-orange-400"
          : "",
    },
    {
      title: "En riesgo",
      value: fmt(summary?.products_at_risk),
      description: "Próximos a quedarse sin stock",
      icon: AlertCircle,
      iconClass: "text-amber-500",
      valueClass: "",
    },
    {
      title: "OC pendientes",
      value: fmt(summary?.pending_purchase_orders),
      description: "Órdenes de compra en curso",
      icon: ShoppingCart,
      iconClass: "text-primary",
      valueClass: "",
    },
    {
      title: "Inversión estimada",
      value: summary
        ? `S/ ${summary.estimated_investment_required.toLocaleString("es-PE")}`
        : "—",
      description: "Reabastecimiento sugerido",
      icon: DollarSign,
      iconClass: "text-primary",
      valueClass: "",
    },
    {
      title: "Evaluados",
      value: fmt(summary?.total_products_evaluated),
      description: "Productos en el análisis",
      icon: Package,
      iconClass: "text-muted-foreground",
      valueClass: "",
    },
  ];

  return (
    <div className="space-y-4">
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
            setFilters((prev) => ({
              ...prev,
              warehouse_id: val ? Number(val) : null,
            }))
          }
          placeholder="Todos los almacenes"
          className="w-full sm:w-[200px]"
        />
        <SearchableSelect
          options={urgencyOptions}
          value={filters.urgency ?? ""}
          onChange={(val) =>
            setFilters((prev) => ({
              ...prev,
              urgency: (val as DashboardUrgency) || null,
            }))
          }
          placeholder="Todas las urgencias"
          className="w-full sm:w-[180px]"
        />
      </div>

      {/* KPIs: una sola franja con celdas separadas por filetes */}
      <div
        className={cn(
          "dash-rise overflow-hidden rounded-xl border bg-border transition-opacity duration-200",
          isLoading && "opacity-60",
        )}
        style={{ "--i": 0 } as React.CSSProperties}
      >
        <div className="grid grid-cols-2 gap-px md:grid-cols-3 xl:grid-cols-6">
          {kpis.map((kpi) => (
            <div key={kpi.title} className="group bg-card p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13px] font-medium text-muted-foreground">
                  {kpi.title}
                </p>
                <kpi.icon
                  className={cn("size-4 shrink-0", kpi.iconClass)}
                  strokeWidth={1.75}
                />
              </div>
              <p
                className={cn(
                  "mt-2 text-3xl font-semibold leading-none tracking-tight tabular-nums",
                  kpi.valueClass,
                )}
              >
                {kpi.value}
              </p>
              <p className="mt-2 text-xs leading-snug text-muted-foreground">
                {kpi.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-6">
        {/* Estado de inventario */}
        <BentoTile
          className="dash-rise xl:col-span-2"
          style={{ "--i": 1 } as React.CSSProperties}
        >
          <h2 className="mb-4 text-sm font-semibold">Estado de inventario</h2>
          {inventory ? (
            <div className="flex flex-1 flex-col gap-5">
              <div className="relative mx-auto h-[176px] w-[176px]">
                <ChartContainer
                  config={distributionChartConfig}
                  className="aspect-square h-[176px] w-[176px]"
                >
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent nameKey="status" hideLabel />
                      }
                    />
                    <Pie
                      data={distributionChartData}
                      dataKey="count"
                      nameKey="status"
                      innerRadius={58}
                      outerRadius={84}
                      paddingAngle={2}
                      cornerRadius={4}
                      strokeWidth={0}
                      animationDuration={500}
                      animationEasing="ease-out"
                    >
                      {distributionChartData.map((entry) => (
                        <Cell key={entry.status} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-semibold leading-none tabular-nums">
                    {inventory.total_products.toLocaleString("es-PE")}
                  </span>
                  <span className="mt-1 text-xs text-muted-foreground">
                    productos
                  </span>
                </div>
              </div>

              <ul className="space-y-3">
                {inventory.distribution.map((item) => {
                  const style = getUrgencyStyle(item.status);
                  return (
                    <li key={item.status}>
                      <div className="mb-1.5 flex items-center gap-2 text-sm">
                        <span
                          className={cn(
                            "size-2 shrink-0 rounded-full",
                            style.dot,
                          )}
                        />
                        <span className="flex-1 truncate font-medium">
                          {urgencyLabel(item.status)}
                        </span>
                        <span className="font-semibold tabular-nums">
                          {item.count.toLocaleString("es-PE")}
                        </span>
                        <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
                          {item.percentage}%
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-full rounded-full transition-[width] duration-500 ease-out",
                            style.dot,
                          )}
                          style={{
                            width: `${Math.max(item.percentage, item.count > 0 ? 2 : 0)}%`,
                          }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="flex items-center justify-between gap-2 border-t pt-3 text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Boxes className="size-4" strokeWidth={1.75} />
                  Sobre stock
                </span>
                <span className="font-semibold tabular-nums">
                  {inventory.over_stock_products.toLocaleString("es-PE")}
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                    {inventory.over_stock_percentage}%
                  </span>
                </span>
              </div>

              <p className="mt-auto text-right text-xs text-muted-foreground">
                Calculado: {inventory.calculated_at}
              </p>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              {isLoading ? "Cargando..." : "Sin datos"}
            </div>
          )}
        </BentoTile>

        {/* Sugerencias */}
        <BentoTile
          className="dash-rise min-w-0 xl:col-span-4"
          style={{ "--i": 2 } as React.CSSProperties}
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Sugerencias automáticas</h2>
            {suggestions.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="tabular-nums">
                  {suggestions.length} productos
                </span>
                <span className="text-border">·</span>
                <span className="flex items-center gap-1 font-medium tabular-nums text-foreground">
                  <TrendingUp className="size-3.5" strokeWidth={1.75} />S/{" "}
                  {totalSuggestedInvestment.toLocaleString("es-PE")}
                </span>
              </div>
            )}
          </div>
          <DataTable
            columns={DashboardSuggestionsColumns}
            data={sortedSuggestions}
            isLoading={isLoading}
            variant="ghost"
            isVisibleColumnFilter={false}
          />
        </BentoTile>
      </div>
    </div>
  );
}
