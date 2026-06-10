import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, DollarSign } from "lucide-react";
import type {
  DocumentCost,
  DocumentCostComponent,
} from "../lib/production-document-cost-report.interface";
import { formatCurrency } from "../lib/performance-report.utils";

function ComponentsSubTable({ components, totalCost }: { components: DocumentCostComponent[]; totalCost: number }) {
  return (
    <tr>
      <td colSpan={9} className="bg-muted/30 px-6 py-3">
        <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
          Desglose de insumos
        </p>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-muted-foreground border-b">
              <th className="text-left pb-1 font-medium">Componente</th>
              <th className="text-right pb-1 font-medium">Cant.</th>
              <th className="text-right pb-1 font-medium">Unidad</th>
              <th className="text-right pb-1 font-medium">C. Unit.</th>
              <th className="text-right pb-1 font-medium">Total</th>
              <th className="text-right pb-1 font-medium">% s/insumos</th>
              <th className="text-right pb-1 font-medium">% s/total</th>
            </tr>
          </thead>
          <tbody>
            {components.map((comp) => (
              <tr key={comp.component_id} className="border-b border-muted last:border-0">
                <td className="py-1">{comp.component_name}</td>
                <td className="py-1 text-right">{comp.quantity_used}</td>
                <td className="py-1 text-right">{comp.unit}</td>
                <td className="py-1 text-right">S/ {formatCurrency(comp.unit_cost)}</td>
                <td className="py-1 text-right font-medium">S/ {formatCurrency(comp.total_cost)}</td>
                <td className="py-1 text-right">{comp.share_of_component_cost.toFixed(2)}%</td>
                <td className="py-1 text-right">{comp.share_of_total_cost.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t font-semibold text-muted-foreground">
              <td colSpan={4} className="pt-1">Total insumos</td>
              <td className="pt-1 text-right">
                S/ {formatCurrency(components.reduce((s, c) => s + c.total_cost, 0))}
              </td>
              <td colSpan={2} className="pt-1 text-right text-xs">
                de S/ {formatCurrency(totalCost)} totales
              </td>
            </tr>
          </tfoot>
        </table>
      </td>
    </tr>
  );
}

function DocumentCostRow({ doc }: { doc: DocumentCost }) {
  const [expanded, setExpanded] = useState(false);
  const { cost_breakdown: cb } = doc;

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
        <td className="py-2 px-3 text-sm text-right">S/ {formatCurrency(cb.component_cost)}</td>
        <td className="py-2 px-3 text-sm text-right">S/ {formatCurrency(cb.labor_cost)}</td>
        <td className="py-2 px-3 text-sm text-right">S/ {formatCurrency(cb.overhead_cost)}</td>
        <td className="py-2 px-3 text-sm text-right font-semibold">
          S/ {formatCurrency(cb.total_cost)}
        </td>
        <td className="py-2 px-3 text-sm text-right">S/ {formatCurrency(cb.unit_cost)}</td>
      </tr>
      {expanded && doc.components.length > 0 && (
        <ComponentsSubTable components={doc.components} totalCost={cb.total_cost} />
      )}
    </>
  );
}

interface CostDocumentDetailsTableProps {
  data: DocumentCost[];
}

export function CostDocumentDetailsTable({ data }: CostDocumentDetailsTableProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <DollarSign className="size-4 text-muted-foreground" />
          Detalle de Costos por Documento
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
                <th className="text-right py-2 px-3 font-medium">Insumos</th>
                <th className="text-right py-2 px-3 font-medium">M.O.</th>
                <th className="text-right py-2 px-3 font-medium">G.G.</th>
                <th className="text-right py-2 px-3 font-medium">Total</th>
                <th className="text-right py-2 px-3 font-medium">C. Unit.</th>
              </tr>
            </thead>
            <tbody>
              {data.map((doc) => (
                <DocumentCostRow key={doc.document_id} doc={doc} />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
