import { useState, useCallback } from "react";
import { format } from "date-fns";
import FormWrapper from "@/components/FormWrapper";
import TitleComponent from "@/components/TitleComponent";
import { SearchableSelectAsync } from "@/components/SearchableSelectAsync";
import DatePicker from "@/components/DatePicker";
import { SummaryCard } from "@/components/SummaryCard";
import { Button } from "@/components/ui/button";
import { useWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import { useProduct } from "@/pages/product/lib/product.hook";
import { useWorkers } from "@/pages/worker/lib/worker.hook";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import { getProductionDocumentCostReport } from "../lib/production-document-cost-report.actions";
import type {
  CostReportData,
  CostReportParams,
} from "../lib/production-document-cost-report.interface";
import { formatCurrency } from "../lib/performance-report.utils";
import { CostTrendTable } from "./CostTrendTable";
import { TopComponentsTable } from "./TopComponentsTable";
import { CostDocumentDetailsTable } from "./CostDocumentDetailsTable";
import {
  BarChart2,
  Loader2,
  FileText,
  Boxes,
  DollarSign,
  Percent,
} from "lucide-react";

export default function ProductionDocumentCostReportPage() {
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [productId, setProductId] = useState("");
  const [responsibleId, setResponsibleId] = useState("");
  const [warehouseOriginId, setWarehouseOriginId] = useState("");
  const [warehouseDestId, setWarehouseDestId] = useState("");

  const [reportData, setReportData] = useState<CostReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildParams = useCallback((): CostReportParams => ({
    ...(dateFrom && { date_from: format(dateFrom, "yyyy-MM-dd") }),
    ...(dateTo && { date_to: format(dateTo, "yyyy-MM-dd") }),
    ...(productId && { product_id: Number(productId) }),
    ...(responsibleId && { responsible_id: Number(responsibleId) }),
    ...(warehouseOriginId && { warehouse_origin_id: Number(warehouseOriginId) }),
    ...(warehouseDestId && { warehouse_dest_id: Number(warehouseDestId) }),
  }), [dateFrom, dateTo, productId, responsibleId, warehouseOriginId, warehouseDestId]);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getProductionDocumentCostReport(buildParams());
      setReportData(result.data);
    } catch {
      setError("Error al generar el reporte. Intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const { summary, cost_trend, top_components, document_costs } = reportData ?? {};

  return (
    <FormWrapper>
      <div className="mb-4">
        <TitleComponent
          title="Costo de Producción"
          subtitle="Desglose detallado del costo de insumos en el producto final"
          icon="DollarSign"
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
          <DatePicker
            label="Fecha desde"
            value={dateFrom}
            onChange={setDateFrom}
            placeholder="Desde"
            captionLayout="dropdown"
          />
          <DatePicker
            label="Fecha hasta"
            value={dateTo}
            onChange={setDateTo}
            placeholder="Hasta"
            captionLayout="dropdown"
          />
          <SearchableSelectAsync
            label="Producto"
            placeholder="Todos los productos"
            value={productId}
            onChange={setProductId}
            useQueryHook={useProduct}
            mapOptionFn={(p) => ({ value: p.id.toString(), label: p.name })}
          />
          <SearchableSelectAsync
            label="Responsable"
            placeholder="Todos"
            value={responsibleId}
            onChange={setResponsibleId}
            useQueryHook={useWorkers}
            mapOptionFn={(w: PersonResource) => ({
              value: w.id.toString(),
              label: [w.names, w.father_surname, w.mother_surname].filter(Boolean).join(" "),
            })}
          />
          <SearchableSelectAsync
            label="Almacén Origen"
            placeholder="Todos"
            value={warehouseOriginId}
            onChange={setWarehouseOriginId}
            useQueryHook={useWarehouses}
            mapOptionFn={(wh) => ({ value: wh.id.toString(), label: wh.name })}
          />
          <SearchableSelectAsync
            label="Almacén Destino"
            placeholder="Todos"
            value={warehouseDestId}
            onChange={setWarehouseDestId}
            useQueryHook={useWarehouses}
            mapOptionFn={(wh) => ({ value: wh.id.toString(), label: wh.name })}
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleGenerate} disabled={isLoading} className="gap-2">
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <BarChart2 className="size-4" />
            )}
            {isLoading ? "Generando..." : "Generar Reporte"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {reportData && summary && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SummaryCard
              icon={<FileText className="size-4" />}
              label="Documentos"
              value={String(summary.total_documents)}
              color="blue"
            />
            <SummaryCard
              icon={<Boxes className="size-4" />}
              label="Total Producido"
              value={String(summary.total_qty_produced)}
              subLabel="unidades"
              color="emerald"
            />
            <SummaryCard
              icon={<DollarSign className="size-4" />}
              label="Costo Total"
              value={`S/ ${formatCurrency(summary.total_production_cost)}`}
              subLabel={`Insumos: S/ ${formatCurrency(summary.total_component_cost)}`}
              color="amber"
            />
            <SummaryCard
              icon={<Percent className="size-4" />}
              label="% Insumos"
              value={`${summary.component_cost_pct.toFixed(2)}%`}
              subLabel={`M.O. ${summary.labor_cost_pct.toFixed(2)}% · G.G. ${summary.overhead_cost_pct.toFixed(2)}%`}
              color="violet"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cost_trend && cost_trend.length > 0 && (
              <CostTrendTable data={cost_trend} />
            )}
            {top_components && top_components.length > 0 && (
              <TopComponentsTable data={top_components} />
            )}
          </div>

          {document_costs && document_costs.length > 0 && (
            <CostDocumentDetailsTable data={document_costs} />
          )}
        </>
      )}

      {!reportData && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
          <BarChart2 className="size-12 opacity-30" />
          <p className="text-sm">Aplica filtros y genera el reporte para ver los resultados.</p>
        </div>
      )}
    </FormWrapper>
  );
}
