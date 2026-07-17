import { useState } from "react";
import TitleComponent from "@/components/TitleComponent";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/DataTable";
import { usePredictiveAlerts } from "../lib/predictive.hook";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import { PredictiveAlertsColumns } from "./PredictiveAlertsColumns";
import PredictiveAlertsOptions from "./PredictiveAlertsOptions";
import PredictiveCalcDialog from "./PredictiveCalcDialog";
import PredictiveConfigDialog from "./PredictiveConfigDialog";
import ProductMetricsModal from "@/pages/product/components/ProductMetricsModal";
import { PREDICTIVE_META } from "../lib/predictive.interface";
import type { AlertsFilters } from "../lib/predictive.interface";
import { Play, Settings } from "lucide-react";

const { MODEL, ICON } = PREDICTIVE_META;

export default function PredictivePage() {
  const [filters, setFilters] = useState<AlertsFilters>({});
  const [showCalc, setShowCalc] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [metricsProductId, setMetricsProductId] = useState<number | null>(null);

  const { data, isLoading } = usePredictiveAlerts(filters);
  const { data: warehouses = [] } = useAllWarehouses();

  const warehouseOptions = (warehouses ?? []).map((w: any) => ({
    id: w.id,
    name: w.name,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <TitleComponent
          title={MODEL.plural ?? MODEL.name}
          subtitle={MODEL.description}
          icon={ICON}
        />
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setShowConfig(true)}
          >
            <Settings className="h-4 w-4" />
            Configuración
          </Button>
          <Button size="sm" className="gap-2" onClick={() => setShowCalc(true)}>
            <Play className="h-4 w-4" />
            Calcular Reabastecimiento
          </Button>
        </div>
      </div>

      <DataTable
        columns={PredictiveAlertsColumns(setMetricsProductId)}
        data={data?.data ?? []}
        isLoading={isLoading}
      >
        <PredictiveAlertsOptions
          filters={filters}
          onChange={setFilters}
          warehouses={warehouseOptions}
        />
      </DataTable>

      {data && !isLoading && (
        <p className="text-xs text-muted-foreground text-right">
          {data.total} alerta{data.total !== 1 ? "s" : ""} encontrada{data.total !== 1 ? "s" : ""}
        </p>
      )}

      <PredictiveCalcDialog
        open={showCalc}
        onClose={() => setShowCalc(false)}
        warehouses={warehouseOptions}
      />
      <PredictiveConfigDialog
        open={showConfig}
        onClose={() => setShowConfig(false)}
      />

      {metricsProductId !== null && (
        <ProductMetricsModal
          open={true}
          productId={metricsProductId}
          onClose={() => setMetricsProductId(null)}
        />
      )}
    </div>
  );
}
