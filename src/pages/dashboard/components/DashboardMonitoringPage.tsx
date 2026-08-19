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
import { FinancialSummaryCard } from "@/pages/home/components/FinancialSummaryCard";
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
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-card p-4 flex flex-col",
        className,
      )}
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

      {/* Bento Grid */}
      <div
        className={cn(
          "grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6 transition-opacity duration-200",
          isLoading && "opacity-60",
        )}
      >
        <FinancialSummaryCard
          title="Sin stock"
          value={summary ? summary.products_out_of_stock.toLocaleString("es-PE") : "—"}
          description="Productos agotados"
          icon={PackageX}
          variant="destructive"
        />
        <FinancialSummaryCard
          title="Productos críticos"
          value={summary ? summary.products_critical.toLocaleString("es-PE") : "—"}
          description="Requieren atención inmediata"
          icon={AlertTriangle}
          variant="orange"
        />
        <FinancialSummaryCard
          title="En riesgo"
          value={summary ? summary.products_at_risk.toLocaleString("es-PE") : "—"}
          description="Próximos a quedarse sin stock"
          icon={AlertCircle}
          variant="orange"
        />
        <FinancialSummaryCard
          title="OC pendientes"
          value={summary ? summary.pending_purchase_orders.toLocaleString("es-PE") : "—"}
          description="Órdenes de compra en curso"
          icon={ShoppingCart}
          variant="primary"
        />
        <FinancialSummaryCard
          title="Inversión estimada"
          value={
            summary
              ? `S/ ${summary.estimated_investment_required.toLocaleString("es-PE")}`
              : "—"
          }
          description="Costo de reabastecimiento sugerido"
          icon={DollarSign}
          variant="green"
        />
        <FinancialSummaryCard
          title="Total evaluados"
          value={summary ? summary.total_products_evaluated.toLocaleString("es-PE") : "—"}
          description="Productos considerados en el análisis"
          icon={Package}
          variant="muted"
        />

        {/* Inventory Status */}
        <BentoTile className="col-span-2 md:col-span-3 xl:col-span-2 xl:row-span-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Estado de Inventario
          </h2>
          {inventory ? (
            <div className="flex flex-col gap-4 flex-1">
              <div className="flex flex-col items-center">
                <ChartContainer
                  config={distributionChartConfig}
                  className="aspect-square h-[160px] w-[160px]"
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
                      innerRadius={48}
                      outerRadius={76}
                      strokeWidth={4}
                    >
                      {distributionChartData.map((entry) => (
                        <Cell key={entry.status} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <p className="text-xs text-muted-foreground mt-1">
                  {inventory.total_products.toLocaleString("es-PE")} productos
                  totales
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-blue-50 dark:bg-blue-900/10 px-3 py-2">
                <Boxes className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="text-sm">
                  Sobre stock:{" "}
                  <span className="font-bold text-blue-700 dark:text-blue-400">
                    {inventory.over_stock_products.toLocaleString("es-PE")}
                  </span>{" "}
                  <span className="text-xs text-muted-foreground">
                    ({inventory.over_stock_percentage}%)
                  </span>
                </span>
              </div>

              <div className="space-y-2.5">
                {inventory.distribution.map((item) => {
                  const style = getUrgencyStyle(item.status);
                  return (
                    <div key={item.status} className="flex items-center gap-3">
                      <span
                        className={cn(
                          "h-2.5 w-2.5 rounded-full shrink-0",
                          style.dot,
                        )}
                      />
                      <span className="text-sm font-medium w-20 shrink-0 truncate">
                        {urgencyLabel(item.status)}
                      </span>
                      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            style.dot,
                          )}
                          style={{
                            width: `${Math.max(item.percentage, item.count > 0 ? 2 : 0)}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold w-14 text-right">
                        {item.count.toLocaleString("es-PE")}
                      </span>
                      <span className="text-xs text-muted-foreground w-10 text-right">
                        {item.percentage}%
                      </span>
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-muted-foreground text-right mt-auto pt-1">
                Calculado: {inventory.calculated_at}
              </p>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
              {isLoading ? "Cargando..." : "Sin datos"}
            </div>
          )}
        </BentoTile>

        {/* Suggestions */}
        <BentoTile className="col-span-2 md:col-span-3 xl:col-span-4 xl:row-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Sugerencias Automáticas
            </h2>
            {suggestions.length > 0 && (
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{suggestions.length} productos</span>
                <span className="flex items-center gap-1 font-medium text-foreground">
                  <TrendingUp className="h-3.5 w-3.5" />
                  S/ {totalSuggestedInvestment.toLocaleString("es-PE")}
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
