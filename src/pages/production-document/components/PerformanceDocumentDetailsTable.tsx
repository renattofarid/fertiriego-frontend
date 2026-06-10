import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, Wrench } from "lucide-react";
import type {
  PerformanceDocumentDetail,
  PerformanceDocumentComponent,
} from "../lib/production-document-performance-report.interface";
import { formatCurrency, formatPct } from "../lib/performance-report.utils";

function ComponentsSubTable({ components }: { components: PerformanceDocumentComponent[] }) {
  return (
    <tr>
      <td colSpan={11} className="bg-muted/30 px-6 py-3">
        <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
          Componentes utilizados
        </p>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-muted-foreground border-b">
              <th className="text-left pb-1 font-medium">Componente</th>
              <th className="text-right pb-1 font-medium">Requerido</th>
              <th className="text-right pb-1 font-medium">Usado</th>
              <th className="text-right pb-1 font-medium">Merma</th>
              <th className="text-right pb-1 font-medium">% Merma</th>
              <th className="text-right pb-1 font-medium">Unidad</th>
              <th className="text-right pb-1 font-medium">Costo unit.</th>
              <th className="text-right pb-1 font-medium">Costo total</th>
            </tr>
          </thead>
          <tbody>
            {components.map((comp) => (
              <tr key={comp.component_id} className="border-b border-muted last:border-0">
                <td className="py-1">{comp.component_name}</td>
                <td className="py-1 text-right">{comp.quantity_required}</td>
                <td className="py-1 text-right">{comp.quantity_used}</td>
                <td className="py-1 text-right">{comp.waste_quantity}</td>
                <td className="py-1 text-right">{formatPct(comp.waste_percentage)}</td>
                <td className="py-1 text-right">{comp.unit}</td>
                <td className="py-1 text-right">S/ {formatCurrency(comp.unit_cost)}</td>
                <td className="py-1 text-right font-medium">S/ {formatCurrency(comp.total_cost)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </td>
    </tr>
  );
}

function DocumentRow({ doc }: { doc: PerformanceDocumentDetail }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr className="border-b hover:bg-muted/40 transition-colors">
        <td className="py-2 px-3">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-primary hover:underline text-sm font-medium"
          >
            {expanded ? (
              <ChevronDown className="size-4 shrink-0" />
            ) : (
              <ChevronRight className="size-4 shrink-0" />
            )}
            {doc.document_number}
          </button>
        </td>
        <td className="py-2 px-3 text-sm">{doc.production_date}</td>
        <td className="py-2 px-3 text-sm max-w-[160px] truncate" title={doc.product.name}>
          {doc.product.name}
        </td>
        <td className="py-2 px-3 text-sm text-right">
          {doc.quantity_produced} {doc.product.unit}
        </td>
        <td className="py-2 px-3 text-sm text-right">{doc.total_used_qty}</td>
        <td className="py-2 px-3 text-sm text-right">{doc.total_waste_qty}</td>
        <td className="py-2 px-3 text-sm text-right">
          <Badge
            variant={doc.efficiency_rate >= 90 ? "default" : "secondary"}
            className="text-xs"
          >
            {formatPct(doc.efficiency_rate)}
          </Badge>
        </td>
        <td className="py-2 px-3 text-sm text-right">
          S/ {formatCurrency(doc.total_production_cost)}
        </td>
        <td className="py-2 px-3 text-sm text-right">
          S/ {formatCurrency(doc.unit_production_cost)}
        </td>
        <td className="py-2 px-3 text-sm">
          {doc.production_order ? (
            <Badge variant="secondary" className="text-xs">
              {doc.production_order.order_number}
            </Badge>
          ) : (
            <span className="text-muted-foreground text-xs">—</span>
          )}
        </td>
        <td
          className="py-2 px-3 text-sm text-muted-foreground truncate max-w-[140px]"
          title={doc.responsible}
        >
          {doc.responsible.trim()}
        </td>
      </tr>
      {expanded && doc.components.length > 0 && (
        <ComponentsSubTable components={doc.components} />
      )}
    </>
  );
}

interface PerformanceDocumentDetailsTableProps {
  data: PerformanceDocumentDetail[];
}

export function PerformanceDocumentDetailsTable({ data }: PerformanceDocumentDetailsTableProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Wrench className="size-4 text-muted-foreground" />
          Detalle por Documento de Producción
          <Badge variant="secondary" className="ml-auto text-xs">
            {data.length} docs
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-xs bg-muted/30">
                <th className="text-left py-2 px-3 font-medium">N° Documento</th>
                <th className="text-left py-2 px-3 font-medium">Fecha</th>
                <th className="text-left py-2 px-3 font-medium">Producto</th>
                <th className="text-right py-2 px-3 font-medium">Producido</th>
                <th className="text-right py-2 px-3 font-medium">Usado</th>
                <th className="text-right py-2 px-3 font-medium">Merma</th>
                <th className="text-right py-2 px-3 font-medium">Eficiencia</th>
                <th className="text-right py-2 px-3 font-medium">Costo Total</th>
                <th className="text-right py-2 px-3 font-medium">C. Unit.</th>
                <th className="text-left py-2 px-3 font-medium">Orden</th>
                <th className="text-left py-2 px-3 font-medium">Responsable</th>
              </tr>
            </thead>
            <tbody>
              {data.map((doc) => (
                <DocumentRow key={doc.document_id} doc={doc} />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
