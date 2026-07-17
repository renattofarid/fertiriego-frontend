import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import type { CostTrend } from "../lib/production-document-cost-report.interface";
import { formatCurrency } from "../lib/performance-report.utils";

const columns: ColumnDef<CostTrend>[] = [
  {
    accessorKey: "period",
    header: "Período",
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "documents_count",
    header: "# Documentos",
  },
  {
    accessorKey: "total_qty_produced",
    header: "Producido",
  },
  {
    accessorKey: "total_component_cost",
    header: "Insumos",
    cell: ({ getValue }) => `S/ ${formatCurrency(getValue() as number)}`,
  },
  {
    accessorKey: "total_labor_cost",
    header: "Mano de Obra",
    cell: ({ getValue }) => `S/ ${formatCurrency(getValue() as number)}`,
  },
  {
    accessorKey: "total_overhead_cost",
    header: "Gastos Generales",
    cell: ({ getValue }) => `S/ ${formatCurrency(getValue() as number)}`,
  },
  {
    accessorKey: "total_production_cost",
    header: "Total",
    cell: ({ getValue }) => (
      <span className="font-semibold">
        S/ {formatCurrency(getValue() as number)}
      </span>
    ),
  },
  {
    accessorKey: "avg_unit_cost",
    header: "C. Unit.",
    cell: ({ getValue }) => `S/ ${formatCurrency(getValue() as number)}`,
  },
];

interface CostTrendTableProps {
  data: CostTrend[];
}

export function CostTrendTable({ data }: CostTrendTableProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="size-4 text-muted-foreground" />
          Tendencia de Costos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={data}
          variant="simple"
          isVisibleColumnFilter={false}
        />
      </CardContent>
    </Card>
  );
}
